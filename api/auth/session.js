'use strict';

const { getConfig, isConfigured, noStore, sendMethodNotAllowed, verifySession } = require('../../lib/auth');

module.exports = function handler(req, res) {
  noStore(res);
  if (req.method !== 'GET') return sendMethodNotAllowed(res, 'GET');

  const config = getConfig();
  if (!isConfigured(config)) {
    return res.status(500).json({ authenticated: false, error: 'Sign-in is not configured. Add the PAZOSTACK environment variables in Vercel.' });
  }

  const session = verifySession(req, config.sessionSecret);
  if (!session || session.username.toLowerCase() !== config.username.toLowerCase()) {
    return res.status(200).json({ authenticated: false });
  }
  return res.status(200).json({ authenticated: true, user: { username: session.username } });
};
