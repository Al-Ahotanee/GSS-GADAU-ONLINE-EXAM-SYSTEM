// api/lib/helpers.js
const jwt = require('jsonwebtoken');
const { query } = require('./db');

// ─── CORS ────────────────────────────────────────────────────────────────────
const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
};

const handleOptions = (req, res) => {
  if (req.method === 'OPTIONS') { setCors(res); res.status(200).end(); return true; }
  return false;
};

// ─── Response helpers ────────────────────────────────────────────────────────
const ok  = (res, data, status = 200) => res.status(status).json(data);
const err = (res, message, status = 400) => res.status(status).json({ error: message });

// ─── Auth ────────────────────────────────────────────────────────────────────
const getUser = async (req) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const result  = await query(
      'SELECT id,full_name,email,role,class,student_id,is_active FROM users WHERE id=$1',
      [decoded.id]
    );
    const user = result.rows[0];
    return user?.is_active ? user : null;
  } catch { return null; }
};

const requireAuth = async (req, res) => {
  const user = await getUser(req);
  if (!user) { err(res, 'Unauthorized', 401); return null; }
  return user;
};

const requireRole = async (req, res, ...roles) => {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (!roles.includes(user.role)) { err(res, 'Forbidden', 403); return null; }
  return user;
};

// ─── Grade calculator ────────────────────────────────────────────────────────
const calcGrade = (pct) => {
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 45) return 'D';
  if (pct >= 40) return 'E';
  return 'F';
};

const AVATAR_COLORS = ['#6366f1','#8b5cf6','#ec4899','#14b8a6','#f59e0b','#10b981','#3b82f6'];
const randColor = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

module.exports = { setCors, handleOptions, ok, err, requireAuth, requireRole, calcGrade, randColor };
