const express = require('express');
const crypto = require('crypto');
const config = require('../config');

const router = express.Router();

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Trotzdem eine Vergleichsoperation ausfuehren, damit die Laufzeit nicht verraet, dass die Laenge nicht passt
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

router.post('/login', (req, res) => {
  const { password } = req.body || {};
  if (typeof password !== 'string' || !safeEqual(password, config.adminPassword)) {
    return res.status(401).json({ error: 'Falsches Passwort.' });
  }
  req.session.loggedIn = true;
  res.json({ loggedIn: true });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ loggedIn: false });
  });
});

router.get('/session', (req, res) => {
  res.json({ loggedIn: Boolean(req.session && req.session.loggedIn) });
});

module.exports = router;
