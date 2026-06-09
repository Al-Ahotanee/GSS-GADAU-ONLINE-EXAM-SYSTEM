// api/exams/index.js  → /api/exams
// api/exams/[id].js   → /api/exams/:id
// We use a single file with query params for routing on Vercel

const { query } = require('../lib/db');
const { setCors, handleOptions, ok, err, requireAuth, requireRole } = require('../lib/helpers');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const { id, action, qid } = req.query;

  // ── LIST EXAMS ────────────────────────────────────────────────────────────
  if (req.method === 'GET' && !id) {
    let sql, params = [];
    if (user.role === 'student') {
      sql = `
        SELECT e.*,s.name subject_name,u.full_name teacher_name,
          (SELECT COUNT(*) FROM questions WHERE exam_id=e.id) question_count,
          (SELECT id   FROM exam_attempts WHERE exam_id=e.id AND student_id=$1 AND status='submitted' LIMIT 1) attempt_id,
          (SELECT percentage FROM exam_attempts WHERE exam_id=e.id AND student_id=$1 AND status='submitted' LIMIT 1) my_score
        FROM exams e
        LEFT JOIN subjects s ON e.subject_id=s.id
        LEFT JOIN users u ON e.teacher_id=u.id
        WHERE e.status IN ('published','active','completed') AND e.class_level=$2
        ORDER BY e.created_at DESC`;
      params = [user.id, user.class];
    } else if (user.role === 'teacher') {
      sql = `
        SELECT e.*,s.name subject_name,
          (SELECT COUNT(*) FROM questions WHERE exam_id=e.id) question_count,
          (SELECT COUNT(*) FROM exam_attempts WHERE exam_id=e.id AND status='submitted') submissions
        FROM exams e LEFT JOIN subjects s ON e.subject_id=s.id
        WHERE e.teacher_id=$1
        ORDER BY e.created_at DESC`;
      params = [user.id];
    } else {
      sql = `
        SELECT e.*,s.name subject_name,u.full_name teacher_name,
          (SELECT COUNT(*) FROM questions WHERE exam_id=e.id) question_count,
          (SELECT COUNT(*) FROM exam_attempts WHERE exam_id=e.id AND status='submitted') submissions
        FROM exams e
        LEFT JOIN subjects s ON e.subject_id=s.id
        LEFT JOIN users u ON e.teacher_id=u.id
        ORDER BY e.created_at DESC`;
    }
    const r = await query(sql, params);
    return ok(res, r.rows);
  }

  // ── GET SINGLE EXAM + QUESTIONS ───────────────────────────────────────────
  if (req.method === 'GET' && id && !action) {
    const r = await query(`
      SELECT e.*,s.name subject_name,u.full_name teacher_name
      FROM exams e LEFT JOIN subjects s ON e.subject_id=s.id LEFT JOIN users u ON e.teacher_id=u.id
      WHERE e.id=$1`, [id]);
    if (!r.rows[0]) return err(res, 'Exam not found', 404);
    const exam = r.rows[0];
    const qs = await query('SELECT * FROM questions WHERE exam_id=$1 ORDER BY order_index', [id]);
    let questions = qs.rows;
    // Hide answers from students during active exam
    if (user.role === 'student' && exam.status === 'active') {
      questions = questions.map(({ correct_answer, explanation, ...q }) => q);
    }
    return ok(res, { ...exam, questions });
  }

  // ── CREATE EXAM ────────────────────────────────────────────────────────────
  if (req.method === 'POST' && !id) {
    if (!['teacher','admin'].includes(user.role)) return err(res,'Forbidden',403);
    const { title, subject_id, class_level, instructions, duration_minutes, total_marks, pass_mark, start_time, end_time, randomize_questions, show_results_immediately, max_attempts } = req.body;
    const r = await query(`
      INSERT INTO exams(title,subject_id,teacher_id,class_level,instructions,duration_minutes,
        total_marks,pass_mark,start_time,end_time,randomize_questions,show_results_immediately,max_attempts)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [title, subject_id||null, user.id, class_level, instructions||null,
       duration_minutes||60, total_marks||100, pass_mark||50,
       start_time||null, end_time||null,
       randomize_questions||false, show_results_immediately!==false, max_attempts||1]);
    return ok(res, r.rows[0], 201);
  }

  // ── UPDATE EXAM ────────────────────────────────────────────────────────────
  if (req.method === 'PUT' && id && !action) {
    if (!['teacher','admin'].includes(user.role)) return err(res,'Forbidden',403);
    const { title, instructions, duration_minutes, total_marks, pass_mark, start_time, end_time, status } = req.body;
    const r = await query(`
      UPDATE exams SET title=COALESCE($1,title),instructions=COALESCE($2,instructions),
        duration_minutes=COALESCE($3,duration_minutes),total_marks=COALESCE($4,total_marks),
        pass_mark=COALESCE($5,pass_mark),start_time=COALESCE($6,start_time),
        end_time=COALESCE($7,end_time),status=COALESCE($8,status),updated_at=NOW()
      WHERE id=$9 RETURNING *`,
      [title, instructions, duration_minutes, total_marks, pass_mark, start_time, end_time, status, id]);
    return ok(res, r.rows[0]);
  }

  // ── DELETE EXAM ────────────────────────────────────────────────────────────
  if (req.method === 'DELETE' && id && !action) {
    if (!['teacher','admin'].includes(user.role)) return err(res,'Forbidden',403);
    await query('DELETE FROM exams WHERE id=$1', [id]);
    return ok(res, { message: 'Exam deleted' });
  }

  // ── PUBLISH ────────────────────────────────────────────────────────────────
  if (req.method === 'POST' && id && action === 'publish') {
    if (!['teacher','admin'].includes(user.role)) return err(res,'Forbidden',403);
    const qCount = await query('SELECT COUNT(*) c FROM questions WHERE exam_id=$1', [id]);
    if (+qCount.rows[0].c === 0) return err(res, 'Add at least one question before publishing');
    const r = await query("UPDATE exams SET status='published',updated_at=NOW() WHERE id=$1 RETURNING *", [id]);
    const exam = r.rows[0];
    // Notify students in that class
    const students = await query("SELECT id FROM users WHERE role='student' AND class=$1 AND is_active=true", [exam.class_level]);
    if (students.rows.length) {
      const vals = students.rows.map(s=>`('${s.id}','New Exam: ${exam.title.replace(/'/g,"''")}','Check your dashboard for the new exam.','exam')`).join(',');
      await query(`INSERT INTO notifications(user_id,title,message,type) VALUES ${vals}`);
    }
    return ok(res, r.rows[0]);
  }

  // ── ADD QUESTION ───────────────────────────────────────────────────────────
  if (req.method === 'POST' && id && action === 'questions') {
    if (!['teacher','admin'].includes(user.role)) return err(res,'Forbidden',403);
    const { question_text, question_type, options, correct_answer, marks, explanation } = req.body;
    const maxOrd = await query('SELECT COALESCE(MAX(order_index),0) m FROM questions WHERE exam_id=$1', [id]);
    const r = await query(`
      INSERT INTO questions(exam_id,question_text,question_type,options,correct_answer,marks,explanation,order_index)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id, question_text, question_type||'mcq', options?JSON.stringify(options):null, correct_answer, marks||1, explanation||null, +maxOrd.rows[0].m+1]);
    // Sync total_marks
    const tot = await query('SELECT SUM(marks) s FROM questions WHERE exam_id=$1', [id]);
    await query('UPDATE exams SET total_marks=$1,updated_at=NOW() WHERE id=$2', [tot.rows[0].s, id]);
    return ok(res, r.rows[0], 201);
  }

  // ── UPDATE QUESTION ────────────────────────────────────────────────────────
  if (req.method === 'PUT' && id && action === 'questions' && qid) {
    if (!['teacher','admin'].includes(user.role)) return err(res,'Forbidden',403);
    const { question_text, options, correct_answer, marks, explanation } = req.body;
    const r = await query(`
      UPDATE questions SET
        question_text=COALESCE($1,question_text),
        options=COALESCE($2,options),
        correct_answer=COALESCE($3,correct_answer),
        marks=COALESCE($4,marks),
        explanation=COALESCE($5,explanation)
      WHERE id=$6 AND exam_id=$7 RETURNING *`,
      [question_text, options?JSON.stringify(options):null, correct_answer, marks, explanation, qid, id]);
    return ok(res, r.rows[0]);
  }

  // ── DELETE QUESTION ────────────────────────────────────────────────────────
  if (req.method === 'DELETE' && id && action === 'questions' && qid) {
    if (!['teacher','admin'].includes(user.role)) return err(res,'Forbidden',403);
    await query('DELETE FROM questions WHERE id=$1 AND exam_id=$2', [qid, id]);
    const tot = await query('SELECT COALESCE(SUM(marks),0) s FROM questions WHERE exam_id=$1', [id]);
    await query('UPDATE exams SET total_marks=$1,updated_at=NOW() WHERE id=$2', [tot.rows[0].s, id]);
    return ok(res, { message: 'Question deleted' });
  }

  // ── EXAM RESULTS (teacher/admin) ───────────────────────────────────────────
  if (req.method === 'GET' && id && action === 'results') {
    if (!['teacher','admin'].includes(user.role)) return err(res,'Forbidden',403);
    const r = await query(`
      SELECT ea.*,u.full_name student_name,u.student_id student_no,u.class
      FROM exam_attempts ea JOIN users u ON ea.student_id=u.id
      WHERE ea.exam_id=$1 AND ea.status='submitted'
      ORDER BY ea.percentage DESC`, [id]);
    return ok(res, r.rows);
  }

  err(res, 'Not found', 404);
};
