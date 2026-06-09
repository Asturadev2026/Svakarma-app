"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentController = exports.DocumentController = void 0;
const document_service_1 = require("./document.service");
class DocumentController {
    /**
     * POST /api/documents/upload
     * Receives a multipart/form-data request with:
     *   - file   : the binary file (handled by multer middleware in routes)
     *   - docType: one of PAN_CARD | AADHAAR_CARD | GST_CERTIFICATE | BANK_STATEMENT
     */
    async uploadDocument(req, res, next) {
        try {
            const userId = req.userId;
            const file = req.file;
            const docType = req.body.docType;
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded. Send the file as form-data field "file".',
                });
            }
            if (!docType) {
                return res.status(400).json({
                    success: false,
                    message: 'docType is required. E.g. PAN_CARD, AADHAAR_CARD, GST_CERTIFICATE, BANK_STATEMENT.',
                });
            }
            const doc = await document_service_1.documentService.uploadDocument(userId, file, docType);
            return res.status(201).json({
                success: true,
                message: 'Document uploaded successfully.',
                data: doc,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/documents
     * Returns all documents belonging to the authenticated user.
     */
    async getDocuments(req, res, next) {
        try {
            const userId = req.userId;
            const docs = await document_service_1.documentService.getDocuments(userId);
            return res.status(200).json({
                success: true,
                count: docs.length,
                data: docs,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/documents/:id
     * Returns a single document by ID. User can only fetch their own documents.
     */
    async getDocumentById(req, res, next) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const doc = await document_service_1.documentService.getDocumentById(userId, id);
            return res.status(200).json({
                success: true,
                data: doc,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DocumentController = DocumentController;
exports.documentController = new DocumentController();
