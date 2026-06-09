// api/init.js  — GET /api/init  (call once after first deploy)
const { initDB, seedAdmin } = require('./lib/db');
const { setCors, handleOptions } = require('./lib/helpers');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;
  try {
    await initDB();
    await seedAdmin();
    res.status(200).json({
      ok: true,
      message: 'Database initialised & admin seeded',
      admin: { email: 'admin@gssgadau.edu.ng', password: 'Admin@2024' }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
