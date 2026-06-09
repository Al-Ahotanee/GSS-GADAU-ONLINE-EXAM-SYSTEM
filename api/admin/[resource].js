// api/admin/[resource].js
const bcrypt = require('bcryptjs');
const { query }  = require('../lib/db');
const { setCors, handleOptions, ok, err, requireRole, randColor } = require('../lib/helpers');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;

  const user = await requireRole(req, res, 'admin');
  if (!user) return;

  const resource = req.query.resource;
  const id       = req.query.id;

  // ── STATS ────────────────────────────────────────────────────────────────
  if (resource === 'stats') {
    const [users, exams, attempts, subjects] = await Promise.all([
      query("SELECT role,COUNT(*) c FROM users WHERE is_active=true GROUP BY role"),
      query("SELECT status,COUNT(*) c FROM exams GROUP BY status"),
      query("SELECT COUNT(*) c,AVG(percentage) avg FROM exam_attempts WHERE status='submitted'"),
      query("SELECT COUNT(*) c FROM subjects"),
    ]);
    const u = { total:0, admin:0, teacher:0, student:0 };
    users.rows.forEach(r=>{ u[r.role]=+r.c; u.total+=+r.c; });
    const e = { total:0, active:0, draft:0, completed:0, published:0 };
    exams.rows.forEach(r=>{ e[r.status]=+r.c; e.total+=+r.c; });
    return ok(res, {
      users: u, exams: e,
      attempts: { total: +attempts.rows[0].c, avg_score: (+attempts.rows[0].avg||0).toFixed(1) },
      subjects: +subjects.rows[0].c
    });
  }

  // ── USERS ────────────────────────────────────────────────────────────────
  if (resource === 'users') {
    if (req.method === 'GET' && !id) {
      const { role, search, page=1, limit=20 } = req.query;
      let sql = 'SELECT id,full_name,email,role,class,student_id,subject_specialization,avatar_color,is_active,created_at FROM users WHERE 1=1';
      const p = [];
      if (role)   { p.push(role);          sql += ` AND role=$${p.length}`; }
      if (search) { p.push(`%${search}%`); sql += ` AND (full_name ILIKE $${p.length} OR email ILIKE $${p.length})`; }
      sql += ` ORDER BY created_at DESC LIMIT ${+limit} OFFSET ${(+page-1)*+limit}`;
      const r = await query(sql, p);
      const cnt = await query('SELECT COUNT(*) c FROM users');
      return ok(res, { users: r.rows, total: +cnt.rows[0].c });
    }

    if (req.method === 'POST') {
      const { full_name, email, password, role: r, class: cls, student_id, subject_specialization } = req.body;
      const ex = await query('SELECT id FROM users WHERE email=$1', [email]);
      if (ex.rows.length) return err(res, 'Email already exists', 409);
      const hash  = await bcrypt.hash(password || 'Password@123', 12);
      const color = randColor();
      const result = await query(
        `INSERT INTO users(full_name,email,password_hash,role,class,student_id,subject_specialization,avatar_color)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id,full_name,email,role,class,student_id,avatar_color,is_active,created_at`,
        [full_name, email, hash, r, cls||null, student_id||null, subject_specialization||null, color]
      );
      return ok(res, result.rows[0], 201);
    }

    if (req.method === 'PUT' && id) {
      const { full_name, email, role: r, class: cls, is_active } = req.body;
      const result = await query(
        `UPDATE users SET full_name=COALESCE($1,full_name),email=COALESCE($2,email),
         role=COALESCE($3,role),class=COALESCE($4,class),is_active=COALESCE($5,is_active),updated_at=NOW()
         WHERE id=$6 RETURNING id,full_name,email,role,class,is_active`,
        [full_name, email, r, cls, is_active, id]
      );
      return ok(res, result.rows[0]);
    }

    if (req.method === 'DELETE' && id) {
      await query('UPDATE users SET is_active=false WHERE id=$1', [id]);
      return ok(res, { message: 'User deactivated' });
    }
  }

  // ── SUBJECTS ─────────────────────────────────────────────────────────────
  if (resource === 'subjects') {
    if (req.method === 'GET') {
      const r = await query(`SELECT s.*,u.full_name teacher_name FROM subjects s LEFT JOIN users u ON s.teacher_id=u.id ORDER BY s.name`);
      return ok(res, r.rows);
    }
    if (req.method === 'POST') {
      const { name, code, class_level, teacher_id, description } = req.body;
      const r = await query(
        'INSERT INTO subjects(name,code,class_level,teacher_id,description) VALUES($1,$2,$3,$4,$5) RETURNING *',
        [name, code, class_level, teacher_id||null, description||null]
      );
      return ok(res, r.rows[0], 201);
    }
    if (req.method === 'PUT' && id) {
      const { name, code, class_level, teacher_id, description } = req.body;
      const r = await query(
        `UPDATE subjects SET name=COALESCE($1,name),code=COALESCE($2,code),class_level=COALESCE($3,class_level),
         teacher_id=COALESCE($4,teacher_id),description=COALESCE($5,description) WHERE id=$6 RETURNING *`,
        [name, code, class_level, teacher_id, description, id]
      );
      return ok(res, r.rows[0]);
    }
    if (req.method === 'DELETE' && id) {
      await query('DELETE FROM subjects WHERE id=$1', [id]);
      return ok(res, { message: 'Deleted' });
    }
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────
  if (resource === 'results') {
    const r = await query(`
      SELECT ea.*,u.full_name student_name,u.class,e.title exam_title,s.name subject_name
      FROM exam_attempts ea
      JOIN users u ON ea.student_id=u.id
      JOIN exams e ON ea.exam_id=e.id
      LEFT JOIN subjects s ON e.subject_id=s.id
      WHERE ea.status='submitted'
      ORDER BY ea.submitted_at DESC LIMIT 200`);
    return ok(res, r.rows);
  }

  // ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────
  if (resource === 'announcements') {
    if (req.method === 'POST') {
      const { title, content, target_role, target_class, is_pinned } = req.body;
      const r = await query(
        'INSERT INTO announcements(title,content,author_id,target_role,target_class,is_pinned) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
        [title, content, user.id, target_role||null, target_class||null, is_pinned||false]
      );
      return ok(res, r.rows[0], 201);
    }
    const r = await query(`SELECT a.*,u.full_name author_name FROM announcements a LEFT JOIN users u ON a.author_id=u.id ORDER BY is_pinned DESC,created_at DESC`);
    return ok(res, r.rows);
  }

  err(res, 'Not found', 404);
};
