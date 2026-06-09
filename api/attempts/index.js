// api/attempts/index.js
const { query } = require('../lib/db');
const { setCors, handleOptions, ok, err, requireAuth, calcGrade } = require('../lib/helpers');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const { id, action } = req.query;

  // ── STUDENT HISTORY  GET /api/attempts?action=history ─────────────────────
  if (req.method === 'GET' && action === 'history') {
    const r = await query(`
      SELECT ea.*,e.title exam_title,e.duration_minutes,s.name subject_name
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id=e.id
      LEFT JOIN subjects s ON e.subject_id=s.id
      WHERE ea.student_id=$1
      ORDER BY ea.created_at DESC`, [user.id]);
    return ok(res, r.rows);
  }

  // ── GET RESULT  GET /api/attempts?id=xxx&action=result ────────────────────
  if (req.method === 'GET' && id && action === 'result') {
    const r = await query(`
      SELECT ea.*,e.title exam_title,e.show_results_immediately,s.name subject_name
      FROM exam_attempts ea
      JOIN exams e ON ea.exam_id=e.id
      LEFT JOIN subjects s ON e.subject_id=s.id
      WHERE ea.id=$1`, [id]);
    if (!r.rows[0]) return err(res, 'Result not found', 404);
    const att = r.rows[0];
    if (user.role === 'student' && att.student_id !== user.id) return err(res, 'Forbidden', 403);
    let questions = [];
    if (att.show_results_immediately || user.role !== 'student') {
      const qs = await query('SELECT * FROM questions WHERE exam_id=$1 ORDER BY order_index', [att.exam_id]);
      questions = qs.rows;
    }
    return ok(res, { ...att, questions });
  }

  // ── START  POST /api/attempts?action=start ────────────────────────────────
  if (req.method === 'POST' && action === 'start') {
    if (user.role !== 'student') return err(res, 'Students only', 403);
    const { exam_id } = req.body;
    const examR = await query("SELECT * FROM exams WHERE id=$1 AND status IN ('published','active')", [exam_id]);
    if (!examR.rows[0]) return err(res, 'Exam not available', 404);
    const exam = examR.rows[0];
    if (exam.class_level !== user.class) return err(res, 'Exam not available for your class', 403);

    const prevR = await query(
      "SELECT COUNT(*) c FROM exam_attempts WHERE exam_id=$1 AND student_id=$2 AND status='submitted'",
      [exam_id, user.id]
    );
    if (+prevR.rows[0].c >= exam.max_attempts) return err(res, 'Maximum attempts reached');

    // Resume in-progress attempt
    const inProg = await query(
      "SELECT * FROM exam_attempts WHERE exam_id=$1 AND student_id=$2 AND status='in_progress'",
      [exam_id, user.id]
    );
    if (inProg.rows[0]) return ok(res, { attempt: inProg.rows[0], resumed: true });

    // Activate exam
    await query("UPDATE exams SET status='active' WHERE id=$1 AND status='published'", [exam_id]);
    const r = await query(
      'INSERT INTO exam_attempts(exam_id,student_id) VALUES($1,$2) RETURNING *',
      [exam_id, user.id]
    );
    return ok(res, { attempt: r.rows[0], resumed: false }, 201);
  }

  // ── SAVE ANSWER  PUT /api/attempts?id=xxx&action=answer ──────────────────
  if (req.method === 'PUT' && id && action === 'answer') {
    if (user.role !== 'student') return err(res, 'Students only', 403);
    const { question_id, answer } = req.body;
    const attR = await query(
      "SELECT * FROM exam_attempts WHERE id=$1 AND student_id=$2 AND status='in_progress'",
      [id, user.id]
    );
    if (!attR.rows[0]) return err(res, 'No active attempt', 404);
    const answers = { ...(attR.rows[0].answers || {}), [question_id]: answer };
    await query('UPDATE exam_attempts SET answers=$1 WHERE id=$2', [JSON.stringify(answers), id]);
    return ok(res, { saved: true });
  }

  // ── SUBMIT  POST /api/attempts?id=xxx&action=submit ───────────────────────
  if (req.method === 'POST' && id && action === 'submit') {
    if (user.role !== 'student') return err(res, 'Students only', 403);
    const attR = await query(
      "SELECT * FROM exam_attempts WHERE id=$1 AND student_id=$2 AND status='in_progress'",
      [id, user.id]
    );
    if (!attR.rows[0]) return err(res, 'No active attempt', 404);
    const att  = attR.rows[0];

    const [qsR, examR] = await Promise.all([
      query('SELECT * FROM questions WHERE exam_id=$1', [att.exam_id]),
      query('SELECT * FROM exams WHERE id=$1', [att.exam_id]),
    ]);
    const exam = examR.rows[0];
    const finalAnswers = req.body.answers || att.answers || {};

    let score = 0;
    const graded = {};
    qsR.rows.forEach(q => {
      const sa = (finalAnswers[q.id]||'').toString().trim().toLowerCase();
      const ca = q.correct_answer.toString().trim().toLowerCase();
      const correct = sa === ca;
      if (correct) score += q.marks;
      graded[q.id] = { student_answer: finalAnswers[q.id]||null, correct_answer: q.correct_answer, is_correct: correct, marks_awarded: correct?q.marks:0, marks_possible: q.marks };
    });

    const pct  = exam.total_marks > 0 ? (score / exam.total_marks) * 100 : 0;
    const grade = calcGrade(pct);
    const mins  = Math.round((Date.now() - new Date(att.started_at).getTime()) / 60000);

    const r = await query(`
      UPDATE exam_attempts SET
        submitted_at=NOW(),status='submitted',answers=$1,
        score=$2,total_marks=$3,percentage=$4,grade=$5,time_taken_minutes=$6
      WHERE id=$7 RETURNING *`,
      [JSON.stringify(graded), score, exam.total_marks, pct.toFixed(2), grade, mins, id]);

    // Mark exam completed
    await query("UPDATE exams SET status='completed' WHERE id=$1 AND status='active'", [att.exam_id]);

    // Notification
    await query(
      "INSERT INTO notifications(user_id,title,message,type) VALUES($1,$2,$3,'success')",
      [user.id, 'Exam Submitted!', `Score: ${score}/${exam.total_marks} (${pct.toFixed(1)}%) — Grade ${grade}`]
    );

    return ok(res, {
      attempt: r.rows[0],
      show_results: exam.show_results_immediately,
      questions: exam.show_results_immediately ? qsR.rows : []
    });
  }

  err(res, 'Not found', 404);
};
