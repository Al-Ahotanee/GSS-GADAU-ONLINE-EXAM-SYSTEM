// api/lib/db.js  — shared across all serverless functions
const { Pool } = require('pg');

let pool;
const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,              // keep low for serverless / Neon free tier
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
};

const query = (text, params) => getPool().query(text, params);

// ─── Schema bootstrap ───────────────────────────────────────────────────────
const initDB = async () => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name   VARCHAR(255) NOT NULL,
        email       VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role        VARCHAR(20) NOT NULL CHECK (role IN ('admin','teacher','student')),
        student_id  VARCHAR(50) UNIQUE,
        class       VARCHAR(50),
        subject_specialization VARCHAR(100),
        is_active   BOOLEAN DEFAULT true,
        avatar_color VARCHAR(20) DEFAULT '#6366f1',
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      )`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(255) NOT NULL,
        code        VARCHAR(20) UNIQUE NOT NULL,
        class_level VARCHAR(50) NOT NULL,
        teacher_id  UUID REFERENCES users(id) ON DELETE SET NULL,
        description TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title       VARCHAR(255) NOT NULL,
        subject_id  UUID REFERENCES subjects(id) ON DELETE CASCADE,
        teacher_id  UUID REFERENCES users(id) ON DELETE SET NULL,
        class_level VARCHAR(50) NOT NULL,
        instructions TEXT,
        duration_minutes INTEGER NOT NULL DEFAULT 60,
        total_marks INTEGER NOT NULL DEFAULT 100,
        pass_mark   INTEGER NOT NULL DEFAULT 50,
        start_time  TIMESTAMPTZ,
        end_time    TIMESTAMPTZ,
        status      VARCHAR(20) DEFAULT 'draft'
                    CHECK (status IN ('draft','published','active','completed','archived')),
        randomize_questions      BOOLEAN DEFAULT false,
        show_results_immediately BOOLEAN DEFAULT true,
        max_attempts INTEGER DEFAULT 1,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      )`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        exam_id       UUID REFERENCES exams(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(20) DEFAULT 'mcq'
                      CHECK (question_type IN ('mcq','true_false','short_answer')),
        options       JSONB,
        correct_answer TEXT NOT NULL,
        marks         INTEGER NOT NULL DEFAULT 1,
        explanation   TEXT,
        order_index   INTEGER NOT NULL DEFAULT 0,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      )`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS exam_attempts (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        exam_id      UUID REFERENCES exams(id) ON DELETE CASCADE,
        student_id   UUID REFERENCES users(id) ON DELETE CASCADE,
        started_at   TIMESTAMPTZ DEFAULT NOW(),
        submitted_at TIMESTAMPTZ,
        time_taken_minutes INTEGER,
        score        INTEGER,
        total_marks  INTEGER,
        percentage   DECIMAL(5,2),
        grade        VARCHAR(5),
        status       VARCHAR(20) DEFAULT 'in_progress'
                     CHECK (status IN ('in_progress','submitted','timed_out','flagged')),
        answers      JSONB DEFAULT '{}',
        created_at   TIMESTAMPTZ DEFAULT NOW()
      )`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
        title      VARCHAR(255) NOT NULL,
        message    TEXT NOT NULL,
        type       VARCHAR(20) DEFAULT 'info'
                   CHECK (type IN ('info','success','warning','exam')),
        is_read    BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title        VARCHAR(255) NOT NULL,
        content      TEXT NOT NULL,
        author_id    UUID REFERENCES users(id) ON DELETE SET NULL,
        target_role  VARCHAR(20),
        target_class VARCHAR(50),
        is_pinned    BOOLEAN DEFAULT false,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      )`);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Seed default admin once
const seedAdmin = async () => {
  const bcrypt = require('bcryptjs');
  const exists = await query("SELECT id FROM users WHERE email='admin@gssgadau.edu.ng'");
  if (!exists.rows.length) {
    const hash = await bcrypt.hash('Admin@2024', 10);
    await query(
      `INSERT INTO users (full_name,email,password_hash,role)
       VALUES ('System Administrator','admin@gssgadau.edu.ng',$1,'admin')`,
      [hash]
    );
  }
};

module.exports = { query, getPool, initDB, seedAdmin };
