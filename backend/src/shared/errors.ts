import { Prisma } from '@prisma/client';

export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handlePrismaError = (err: any): any => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.target as string[])?.join(', ') || 'field';
        return new AppError(400, `Unique constraint failed: A record with this ${target} already exists.`);
      }
      case 'P2025': {
        const cause = (err.meta?.cause as string) || 'Required record was not found.';
        return new AppError(404, cause);
      }
      default:
        return new AppError(500, `Database error code ${err.code}: ${err.message}`);
    }
  }
  return err;
};
