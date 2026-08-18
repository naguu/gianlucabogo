const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'posts.json');

const EMPTY = {
  profile: {
    name: '',
    tagline: '',
    bio: '',
    photo: '',
    heroPhoto: '',
    achievements: [],
    contact: { address: '', email: '', phone: '', instagram: '', facebook: '', tiktok: '', youtube: '' },
    partner: { name: '', text: '', url: '', photo: '' },
    partnerPitch: { intro: '', benefits: [], individual: '' },
    sponsorTiers: [],
  },
  posts: [],
};

// Fehlende Felder ergaenzen, damit auch aeltere posts.json-Dateien ohne die neuen Profilfelder funktionieren
function ensureProfile(profile) {
  const p = profile || {};
  return {
    name: p.name || '',
    tagline: p.tagline || '',
    bio: p.bio || '',
    photo: p.photo || '',
    heroPhoto: p.heroPhoto || '',
    achievements: Array.isArray(p.achievements) ? p.achievements : [],
    contact: { ...EMPTY.profile.contact, ...(p.contact || {}) },
    partner: { ...EMPTY.profile.partner, ...(p.partner || {}) },
    partnerPitch: {
      ...EMPTY.profile.partnerPitch,
      ...(p.partnerPitch || {}),
      benefits: Array.isArray(p.partnerPitch && p.partnerPitch.benefits) ? p.partnerPitch.benefits : [],
    },
    sponsorTiers: Array.isArray(p.sponsorTiers) ? p.sponsorTiers : [],
  };
}

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return structuredClone(EMPTY);
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return structuredClone(EMPTY);
  }
  data.profile = ensureProfile(data.profile);
  if (!data.posts) data.posts = [];
  return data;
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readData, writeData };
