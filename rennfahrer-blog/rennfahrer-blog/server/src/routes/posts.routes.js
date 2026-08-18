const express = require('express');
const { readData, writeData } = require('../lib/dataStore');
const { upload, removeUploadedFile } = require('../lib/upload');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

function parseImageList(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

router.post('/posts', requireAuth, upload.array('images', 12), (req, res) => {
  const { title, text, date } = req.body || {};
  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Titel darf nicht leer sein.' });
  }

  const data = readData();
  const images = (req.files || []).map((file) => `uploads/${file.filename}`);

  const newPost = {
    id: Date.now(),
    title: title.trim(),
    date: (date && date.trim()) || new Date().toISOString().slice(0, 10),
    text: (text || '').trim(),
    images,
  };

  data.posts.unshift(newPost);
  writeData(data);
  res.status(201).json({ post: newPost });
});

router.put('/posts/:id', requireAuth, upload.array('images', 12), (req, res) => {
  const { id } = req.params;
  const { title, text, date, removeImages } = req.body || {};

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Titel darf nicht leer sein.' });
  }

  const data = readData();
  const post = data.posts.find((p) => String(p.id) === String(id));
  if (!post) {
    return res.status(404).json({ error: 'Beitrag nicht gefunden.' });
  }

  let images = post.images || [];
  const toRemove = parseImageList(removeImages);
  if (toRemove.length) {
    images = images.filter((img) => {
      const drop = toRemove.includes(img);
      if (drop) removeUploadedFile(img);
      return !drop;
    });
  }

  const newImages = (req.files || []).map((file) => `uploads/${file.filename}`);
  images = images.concat(newImages);

  post.title = title.trim();
  post.date = (date && date.trim()) || post.date;
  post.text = (text || '').trim();
  post.images = images;

  writeData(data);
  res.json({ post });
});

router.delete('/posts/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const data = readData();
  const toDelete = data.posts.find((post) => String(post.id) === String(id));
  if (!toDelete) {
    return res.status(404).json({ error: 'Beitrag nicht gefunden.' });
  }
  data.posts = data.posts.filter((post) => String(post.id) !== String(id));
  (toDelete.images || []).forEach(removeUploadedFile);
  writeData(data);
  res.json({ ok: true });
});

module.exports = router;
