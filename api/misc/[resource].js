// api/misc/[resource].js
const { query } = require('../lib/db');
const { setCors, handleOptions, ok, err, requireAuth } = require('../lib/helpers');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;

  const user = await requireAuth(req, res);
  if (!user) return;

  const resource = req.query.resource;

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  if (resource === 'notifications') {
    if (req.method === 'PUT') { // mark read
      await query('UPDATE notifications SET is_read=true WHERE user_id=$1', [user.id]);
      return ok(res, { message: 'Marked read' });
    }
    const r    = await query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50', [user.id]);
    const unrd = await query('SELECT COUNT(*) c FROM notifications WHERE user_id=$1 AND is_read=false', [user.id]);
    return ok(res, { notifications: r.rows, unread_count: +unrd.rows[0].c });
  }

  // ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────
  if (resource === 'announcements') {
    const r = await query(`
      SELECT a.*,u.full_name author_name FROM announcements a
      LEFT JOIN users u ON a.author_id=u.id
      WHERE a.target_role IS NULL OR a.target_role=$1
      ORDER BY a.is_pinned DESC,a.created_at DESC LIMIT 20`, [user.role]);
    return ok(res, r.rows);
  }

  // ── SUBJECTS ──────────────────────────────────────────────────────────────
  if (resource === 'subjects') {
    let sql = 'SELECT s.*,u.full_name teacher_name FROM subjects s LEFT JOIN users u ON s.teacher_id=u.id';
    const p = [];
    if (user.role === 'student') { p.push(user.class); sql += ' WHERE s.class_level=$1'; }
    sql += ' ORDER BY s.name';
    const r = await query(sql, p);
    return ok(res, r.rows);
  }

  // ── TEACHERS ──────────────────────────────────────────────────────────────
  if (resource === 'teachers') {
    const r = await query("SELECT id,full_name,email,subject_specialization,avatar_color FROM users WHERE role='teacher' AND is_active=true ORDER BY full_name");
    return ok(res, r.rows);
  }

  err(res, 'Not found', 404);
};
