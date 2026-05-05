import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Storage on VPS — served by nginx from /var/www/uploads (or local ./uploads in dev)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
const PUBLIC_BASE = process.env.UPLOAD_PUBLIC_BASE || '/uploads';

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 40) || 'file';
    const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    cb(null, `${base}-${stamp}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(file.mimetype)) {
      return cb(new Error('Only image uploads allowed'));
    }
    cb(null, true);
  },
});

router.post('/image', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `${PUBLIC_BASE}/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

export default router;
