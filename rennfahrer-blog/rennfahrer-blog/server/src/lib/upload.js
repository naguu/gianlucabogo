const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB pro Bild

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, ALLOWED_EXT.has(ext));
}

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

module.exports = { upload, UPLOAD_DIR };
