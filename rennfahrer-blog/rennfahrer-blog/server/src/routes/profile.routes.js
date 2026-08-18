const express = require('express');
const { readData, writeData } = require('../lib/dataStore');
const { upload } = require('../lib/upload');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

function parseJsonField(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function linesToArray(raw) {
  if (typeof raw !== 'string') return null;
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

router.put(
  '/profile',
  requireAuth,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'heroPhoto', maxCount: 1 },
    { name: 'partnerPhoto', maxCount: 1 },
  ]),
  (req, res) => {
    const data = readData();
    const { name, tagline, bio, achievements, contact, partner, partnerPitch, sponsorTiers } = req.body || {};

    if (typeof name === 'string') data.profile.name = name.trim();
    if (typeof tagline === 'string') data.profile.tagline = tagline.trim();
    if (typeof bio === 'string') data.profile.bio = bio.trim();

    const achievementsArr = linesToArray(achievements);
    if (achievementsArr) data.profile.achievements = achievementsArr;

    const contactObj = parseJsonField(contact);
    if (contactObj && typeof contactObj === 'object') {
      data.profile.contact = {
        address: str(contactObj.address),
        email: str(contactObj.email),
        phone: str(contactObj.phone),
        instagram: str(contactObj.instagram),
        facebook: str(contactObj.facebook),
        tiktok: str(contactObj.tiktok),
        youtube: str(contactObj.youtube),
      };
    }

    const partnerObj = parseJsonField(partner);
    if (partnerObj && typeof partnerObj === 'object') {
      data.profile.partner = {
        ...data.profile.partner,
        name: str(partnerObj.name),
        text: str(partnerObj.text),
        url: str(partnerObj.url),
      };
    }

    const partnerPitchObj = parseJsonField(partnerPitch);
    if (partnerPitchObj && typeof partnerPitchObj === 'object') {
      data.profile.partnerPitch = {
        intro: str(partnerPitchObj.intro),
        individual: str(partnerPitchObj.individual),
        benefits: Array.isArray(partnerPitchObj.benefits)
          ? partnerPitchObj.benefits.map((b) => str(b)).filter(Boolean)
          : [],
      };
    }

    const sponsorTiersArr = parseJsonField(sponsorTiers);
    if (Array.isArray(sponsorTiersArr)) {
      data.profile.sponsorTiers = sponsorTiersArr
        .filter((t) => t && str(t.name))
        .map((t) => ({
          name: str(t.name),
          price: str(t.price),
          benefits: Array.isArray(t.benefits) ? t.benefits.map((b) => str(b)).filter(Boolean) : [],
        }));
    }

    const files = req.files || {};
    if (files.photo && files.photo[0]) {
      data.profile.photo = `uploads/${files.photo[0].filename}`;
    }
    if (files.heroPhoto && files.heroPhoto[0]) {
      data.profile.heroPhoto = `uploads/${files.heroPhoto[0].filename}`;
    }
    if (files.partnerPhoto && files.partnerPhoto[0]) {
      data.profile.partner.photo = `uploads/${files.partnerPhoto[0].filename}`;
    }

    writeData(data);
    res.json({ profile: data.profile });
  }
);

module.exports = router;
