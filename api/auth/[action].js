// api/auth/[action].js  → /api/auth/login  /api/auth/register  /api/auth/me
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { query }  = require('../lib/db');
const { setCors, handleOptions, ok, err, requireAuth, randColor } = require('../lib/helpers');

const sign = (user) => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;

  const action = req.query.action; // login | register | me | change-password

  // ── GET /api/auth/me ────────────────────────────────────────────────────────
  if (req.method === 'GET' && action === 'me') {
    const user = await requireAuth(req, res);
    if (!user) return;
    const r = await query(
      'SELECT id,full_name,email,role,class,student_id,subject_specialization,avatar_color,created_at FROM users WHERE id=$1',
      [user.id]
    );
    return ok(res, r.rows[0]);
  }

  // ── POST /api/auth/register ─────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'register') {
    const { full_name, email, password, role, class: cls, student_id, subject_specialization } = req.body;
    if (!full_name || !email || !password || !role) return err(res, 'All required fields missing');

    const exists = await query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows.length) return err(res, 'Email already registered', 409);

    const hash  = await bcrypt.hash(password, 12);
    const color = randColor();
    const r = await query(
      `INSERT INTO users (full_name,email,password_hash,role,class,student_id,subject_specialization,avatar_color)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id,full_name,email,role,class,student_id,avatar_color`,
      [full_name, email, hash, role, cls||null, student_id||null, subject_specialization||null, color]
    );
    const user = r.rows[0];
    // welcome notification
    await query(
      "INSERT INTO notifications(user_id,title,message,type) VALUES($1,$2,$3,'success')",
      [user.id, 'Welcome to GSS Gadau!', `Hello ${user.full_name}, your account is ready.`]
    );
    return ok(res, { token: sign(user), user }, 201);
  }

  // ── POST /api/auth/login ────────────────────────────────────────────────────
  if (req.method === 'POST' && action === 'login') {
    const { email, password } = req.body;
    if (!email || !password) return err(res, 'Email and password required');

    const r = await query('SELECT * FROM users WHERE email=$1 AND is_active=true', [email]);
    if (!r.rows[0]) return err(res, 'Invalid credentials', 401);

    const user  = r.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return err(res, 'Invalid credentials', 401);

    const { password_hash, ...safe } = user;
    return ok(res, { token: sign(safe), user: safe });
  }

  // ── PUT /api/auth/me ────────────────────────────────────────────────────────
  if (req.method === 'PUT' && action === 'me') {
    const user = await requireAuth(req, res);
    if (!user) return;
    const { full_name, class: cls } = req.body;
    const r = await query(
      'UPDATE users SET full_name=COALESCE($1,full_name),class=COALESCE($2,class),updated_at=NOW() WHERE id=$3 RETURNING id,full_name,email,role,class,student_id,avatar_color',
      [full_name, cls, user.id]
    );
    return ok(res, r.rows[0]);
  }

  // ── PUT /api/auth/change-password ───────────────────────────────────────────
  if (req.method === 'PUT' && action === 'change-password') {
    const user = await requireAuth(req, res);
    if (!user) return;
    const { current_password, new_password } = req.body;
    const r = await query('SELECT password_hash FROM users WHERE id=$1', [user.id]);
    const valid = await bcrypt.compare(current_password, r.rows[0].password_hash);
    if (!valid) return err(res, 'Current password incorrect');
    const hash = await bcrypt.hash(new_password, 12);
    await query('UPDATE users SET password_hash=$1,updated_at=NOW() WHERE id=$2', [hash, user.id]);
    return ok(res, { message: 'Password changed' });
  }

  err(res, 'Not found', 404);
};
