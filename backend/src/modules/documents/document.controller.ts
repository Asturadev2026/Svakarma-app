import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { documentService } from './document.service';

export class DocumentController {
  /**
   * POST /api/documents/upload
   * Receives a multipart/form-data request with:
   *   - file   : the binary file (handled by multer middleware in routes)
   *   - docType: one of PAN_CARD | AADHAAR_CARD | GST_CERTIFICATE | BANK_STATEMENT
   */
  async uploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId  = req.userId!;
      const file    = req.file;
      const docType = req.body.docType as string;

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

      const doc = await documentService.uploadDocument(userId, file, docType);

      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully.',
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/documents
   * Returns all documents belonging to the authenticated user.
   */
  async getDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const docs   = await documentService.getDocuments(userId);

      return res.status(200).json({
        success: true,
        count:   docs.length,
        data:    docs,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/documents/:id
   * Returns a single document by ID. User can only fetch their own documents.
   */
  async getDocumentById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const doc    = await documentService.getDocumentById(userId, id);

      return res.status(200).json({
        success: true,
        data:    doc,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const documentController = new DocumentController();
