import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../../middleware/auth';
import { documentController } from './document.controller';

// ─────────────────────────────────────────────────────────────────────────────
// Upload directory — resolved relative to the compiled dist output
// dist/modules/documents/ → ../../../uploads/ → backend/uploads/
// ─────────────────────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Multer configuration
// ─────────────────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    // Unique filename: {timestamp}-{random}.{ext}
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Cast to any — Multer's callback type doesn't accept Error without ts workaround
      (cb as any)(new Error('Only JPEG, PNG, and PDF files are allowed.'), false);
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Multer error handler wrapper — surfaces file-filter rejections as 400
// ─────────────────────────────────────────────────────────────────────────────
function handleUpload(req: any, res: any, next: any) {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────
const router = Router();

/**
 * POST /api/documents/upload
 * Body: multipart/form-data
 *   - file    (binary)
 *   - docType (string)
 */
router.post(
  '/upload',
  authMiddleware,
  handleUpload,
  (req: any, res: any, next: any) => documentController.uploadDocument(req, res, next),
);

/**
 * GET /api/documents
 * Returns all documents for the authenticated user.
 */
router.get(
  '/',
  authMiddleware,
  (req: any, res: any, next: any) => documentController.getDocuments(req, res, next),
);

/**
 * GET /api/documents/:id
 * Returns a single document by ID (scoped to authenticated user).
 */
router.get(
  '/:id',
  authMiddleware,
  (req: any, res: any, next: any) => documentController.getDocumentById(req, res, next),
);

export default router;
