'use strict';

const {
  getConfig,
  isConfigured,
  makeToken,
  noStore,
  sendMethodNotAllowed,
  setSessionCookie,
  verifyPassword
} = require('../../lib/auth');

module.exports = async function handler(req, res) {
  noStore(res);
  if (req.method !== 'POST') return sendMethodNotAllowed(res, 'POST');

  const config = getConfig();
  if (!isConfigured(config)) {
    return res.status(500).json({ error: 'Sign-in is not configured. Add the PAZOSTACK environment variables in Vercel.' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }

  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  if (!username || !password) return res.status(400).json({ error: 'Enter your username and password.' });

  const usernameMatches = username.toLowerCase() === config.username.toLowerCase();
  const passwordMatches = await verifyPassword(password, config.passwordHash);
  if (!usernameMatches || !passwordMatches) {
    return res.status(401).json({ error: 'Sign-in failed. Check your username and password.' });
  }

  setSessionCookie(req, res, makeToken(config.username, config.sessionSecret));
  return res.status(200).json({ ok: true, user: { username: config.username } });
};
