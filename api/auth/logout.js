'use strict';

const { clearSessionCookie, noStore, sendMethodNotAllowed } = require('../../lib/auth');

module.exports = function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') return sendMethodNotAllowed(res, 'POST');
  clearSessionCookie(req, res);
  return res.status(200).json({ ok: true });
};
