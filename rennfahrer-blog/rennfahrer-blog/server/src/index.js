const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const authRoutes = require('./routes/auth.routes');
const siteRoutes = require('./routes/site.routes');
const profileRoutes = require('./routes/profile.routes');
const postsRoutes = require('./routes/posts.routes');

const app = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: 'rennfahrer.sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProduction,
      maxAge: 1000 * 60 * 60 * 12, // 12 Stunden
    },
  })
);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', authRoutes);
app.use('/api', siteRoutes);
app.use('/api', profileRoutes);
app.use('/api', postsRoutes);

app.use((err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ error: 'Datei-Upload fehlgeschlagen: ' + err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Interner Serverfehler.' });
});

app.listen(config.port, () => {
  console.log(`API laeuft auf http://localhost:${config.port}`);
});
