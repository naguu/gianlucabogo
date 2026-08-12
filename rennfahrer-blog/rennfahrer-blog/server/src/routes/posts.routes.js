const express = require('express');
const { readData, writeData } = require('../lib/dataStore');
const { upload } = require('../lib/upload');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

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

router.delete('/posts/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const data = readData();
  const before = data.posts.length;
  data.posts = data.posts.filter((post) => String(post.id) !== String(id));
  if (data.posts.length === before) {
    return res.status(404).json({ error: 'Beitrag nicht gefunden.' });
  }
  writeData(data);
  res.json({ ok: true });
});

module.exports = router;
