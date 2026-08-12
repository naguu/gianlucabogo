const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'posts.json');

const EMPTY = {
  profile: { name: '', tagline: '', bio: '', photo: '', heroPhoto: '' },
  posts: [],
};

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
  if (!data.profile) data.profile = { ...EMPTY.profile };
  if (!data.posts) data.posts = [];
  return data;
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readData, writeData };
