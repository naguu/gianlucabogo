const express = require('express');
const { readData, writeData } = require('../lib/dataStore');
const { upload } = require('../lib/upload');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.put(
  '/profile',
  requireAuth,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'heroPhoto', maxCount: 1 },
  ]),
  (req, res) => {
    const data = readData();
    const { name, tagline, bio } = req.body || {};

    if (typeof name === 'string') data.profile.name = name.trim();
    if (typeof tagline === 'string') data.profile.tagline = tagline.trim();
    if (typeof bio === 'string') data.profile.bio = bio.trim();

    const files = req.files || {};
    if (files.photo && files.photo[0]) {
      data.profile.photo = `uploads/${files.photo[0].filename}`;
    }
    if (files.heroPhoto && files.heroPhoto[0]) {
      data.profile.heroPhoto = `uploads/${files.heroPhoto[0].filename}`;
    }

    writeData(data);
    res.json({ profile: data.profile });
  }
);

module.exports = router;
