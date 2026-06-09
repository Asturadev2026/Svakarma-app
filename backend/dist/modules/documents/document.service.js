"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentService = exports.DocumentService = exports.ALLOWED_DOC_TYPES = void 0;
const prisma_1 = require("../../shared/prisma");
const errors_1 = require("../../shared/errors");
// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
exports.ALLOWED_DOC_TYPES = [
    'PAN_CARD',
    'AADHAAR_CARD',
    'GST_CERTIFICATE',
    'BANK_STATEMENT',
];
// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────
class DocumentService {
    /**
     * Persist an uploaded file record to the database.
     * Called AFTER multer has already saved the file to disk.
     */
    async uploadDocument(userId, file, docType) {
        if (!exports.ALLOWED_DOC_TYPES.includes(docType)) {
            throw new errors_1.AppError(400, `Invalid docType. Must be one of: ${exports.ALLOWED_DOC_TYPES.join(', ')}`);
        }
        // Ensure user exists
        const user = await prisma_1.prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
        if (!user)
            throw new errors_1.AppError(404, 'User not found.');
        // Build a URL path that will be served by Express static middleware
        const fileUrl = `/uploads/${file.filename}`;
        const doc = await prisma_1.prisma.userDocument.create({
            data: {
                userId,
                docType,
                fileUrl,
                fileName: file.originalname,
                mimeType: file.mimetype,
                status: 'pending',
            },
        });
        return this.mapToResponse(doc);
    }
    /**
     * Return all documents for a user, newest first.
     */
    async getDocuments(userId) {
        const docs = await prisma_1.prisma.userDocument.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return docs.map((d) => this.mapToResponse(d));
    }
    /**
     * Return a single document by ID — scoped to the requesting user.
     */
    async getDocumentById(userId, id) {
        const doc = await prisma_1.prisma.userDocument.findFirst({
            where: { id, userId },
        });
        if (!doc)
            throw new errors_1.AppError(404, 'Document not found.');
        return this.mapToResponse(doc);
    }
    /** Strip internal fields and return a clean API response shape */
    mapToResponse(doc) {
        return {
            id: doc.id,
            userId: doc.userId,
            docType: doc.docType,
            fileUrl: doc.fileUrl,
            fileName: doc.fileName,
            mimeType: doc.mimeType,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
    }
}
exports.DocumentService = DocumentService;
exports.documentService = new DocumentService();
