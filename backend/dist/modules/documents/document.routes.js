"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../../middleware/auth");
const document_controller_1 = require("./document.controller");
// ─────────────────────────────────────────────────────────────────────────────
// Upload directory — resolved relative to the compiled dist output
// dist/modules/documents/ → ../../../uploads/ → backend/uploads/
// ─────────────────────────────────────────────────────────────────────────────
const uploadDir = path_1.default.join(__dirname, '../../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// ─────────────────────────────────────────────────────────────────────────────
// Multer configuration
// ─────────────────────────────────────────────────────────────────────────────
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        // Unique filename: {timestamp}-{random}.{ext}
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `${unique}${ext}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB max
    },
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            // Cast to any — Multer's callback type doesn't accept Error without ts workaround
            cb(new Error('Only JPEG, PNG, and PDF files are allowed.'), false);
        }
    },
});
// ─────────────────────────────────────────────────────────────────────────────
// Multer error handler wrapper — surfaces file-filter rejections as 400
// ─────────────────────────────────────────────────────────────────────────────
function handleUpload(req, res, next) {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}
// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────
const router = (0, express_1.Router)();
/**
 * POST /api/documents/upload
 * Body: multipart/form-data
 *   - file    (binary)
 *   - docType (string)
 */
router.post('/upload', auth_1.authMiddleware, handleUpload, (req, res, next) => document_controller_1.documentController.uploadDocument(req, res, next));
/**
 * GET /api/documents
 * Returns all documents for the authenticated user.
 */
router.get('/', auth_1.authMiddleware, (req, res, next) => document_controller_1.documentController.getDocuments(req, res, next));
/**
 * GET /api/documents/:id
 * Returns a single document by ID (scoped to authenticated user).
 */
router.get('/:id', auth_1.authMiddleware, (req, res, next) => document_controller_1.documentController.getDocumentById(req, res, next));
exports.default = router;
