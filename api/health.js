const { setCors, handleOptions } = require('./lib/helpers');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;
  res.json({ status: 'GSS Gadau Exam API ✅', ts: new Date().toISOString() });
};
