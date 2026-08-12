function requireAuth(req, res, next) {
  if (req.session && req.session.loggedIn) {
    return next();
  }
  return res.status(401).json({ error: 'Nicht angemeldet.' });
}

module.exports = requireAuth;
