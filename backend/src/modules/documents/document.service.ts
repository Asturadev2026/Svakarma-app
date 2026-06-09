import { prisma } from '../../shared/prisma';
import { AppError } from '../../shared/errors';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const ALLOWED_DOC_TYPES = [
  'PAN_CARD',
  'AADHAAR_CARD',
  'GST_CERTIFICATE',
  'BANK_STATEMENT',
] as const;

export type DocType = (typeof ALLOWED_DOC_TYPES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export class DocumentService {
  /**
   * Persist an uploaded file record to the database.
   * Called AFTER multer has already saved the file to disk.
   */
  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    docType: string,
  ) {
    if (!ALLOWED_DOC_TYPES.includes(docType as DocType)) {
      throw new AppError(
        400,
        `Invalid docType. Must be one of: ${ALLOWED_DOC_TYPES.join(', ')}`,
      );
    }

    // Ensure user exists
    const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) throw new AppError(404, 'User not found.');

    // Build a URL path that will be served by Express static middleware
    const fileUrl = `/uploads/${file.filename}`;

    const doc = await prisma.userDocument.create({
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
  async getDocuments(userId: string) {
    const docs = await prisma.userDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return docs.map((d) => this.mapToResponse(d));
  }

  /**
   * Return a single document by ID — scoped to the requesting user.
   */
  async getDocumentById(userId: string, id: string) {
    const doc = await prisma.userDocument.findFirst({
      where: { id, userId },
    });
    if (!doc) throw new AppError(404, 'Document not found.');
    return this.mapToResponse(doc);
  }

  /** Strip internal fields and return a clean API response shape */
  private mapToResponse(doc: any) {
    return {
      id:        doc.id,
      userId:    doc.userId,
      docType:   doc.docType,
      fileUrl:   doc.fileUrl,
      fileName:  doc.fileName,
      mimeType:  doc.mimeType,
      status:    doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

export const documentService = new DocumentService();
