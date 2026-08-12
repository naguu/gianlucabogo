const express = require('express');
const { readData } = require('../lib/dataStore');

const router = express.Router();

// Oeffentlicher Endpunkt, keine Anmeldung noetig, liefert Profil und Beitraege sortiert nach Datum
router.get('/site', (req, res) => {
  const data = readData();
  const posts = [...data.posts].sort((a, b) => (a.date < b.date ? 1 : -1));
  res.json({ profile: data.profile, posts });
});

module.exports = router;
