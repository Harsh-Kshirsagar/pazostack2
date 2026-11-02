'use strict';

const crypto = require('crypto');

const COOKIE_NAME = 'pazostack_session';
const SESSION_SECONDS = 12 * 60 * 60;

function getConfig() {
  return {
    username: String(process.env.PAZOSTACK_LOGIN_USERNAME || '').trim(),
    passwordHash: String(process.env.PAZOSTACK_LOGIN_PASSWORD_HASH || '').trim(),
    sessionSecret: String(process.env.PAZOSTACK_SESSION_SECRET || '')
  };
}

function isConfigured(config) {
  return Boolean(config.username && config.passwordHash && config.sessionSecret.length >= 32);
}

function makeToken(username, secret) {
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    username,
    iat: now,
    exp: now + SESSION_SECONDS
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function readToken(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const expected = crypto.createHmac('sha256', secret).update(parts[0]).digest();
  let received;
  try {
    received = Buffer.from(parts[1], 'base64url');
  } catch (_) {
    return null;
  }
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (!payload.username || !Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

function getCookie(req, name) {
  const header = req.headers.cookie || '';
  const prefix = `${name}=`;
  for (const part of header.split(';')) {
    const item = part.trim();
    if (item.startsWith(prefix)) {
      try { return decodeURIComponent(item.slice(prefix.length)); } catch (_) { return ''; }
    }
  }
  return '';
}

function setSessionCookie(req, res, token) {
  const secure = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${SESSION_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax'
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(req, res) {
  const secure = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'HttpOnly',
    'SameSite=Lax'
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function verifySession(req, secret) {
  const token = getCookie(req, COOKIE_NAME);
  return readToken(token, secret);
}

function verifyPassword(password, encodedHash) {
  return new Promise((resolve) => {
    const parts = String(encodedHash || '').split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt' || !/^[0-9a-f]{32}$/i.test(parts[1]) || !/^[0-9a-f]{128}$/i.test(parts[2])) {
      resolve(false);
      return;
    }

    const salt = Buffer.from(parts[1], 'hex');
    const expected = Buffer.from(parts[2], 'hex');
    crypto.scrypt(String(password), salt, expected.length, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, actual) => {
      if (error || actual.length !== expected.length) {
        resolve(false);
        return;
      }
      resolve(crypto.timingSafeEqual(actual, expected));
    });
  });
}

function sendMethodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed);
  return res.status(405).json({ error: 'Method not allowed.' });
}

function noStore(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
}

module.exports = {
  COOKIE_NAME,
  clearSessionCookie,
  getConfig,
  isConfigured,
  makeToken,
  noStore,
  sendMethodNotAllowed,
  setSessionCookie,
  verifyPassword,
  verifySession
};
