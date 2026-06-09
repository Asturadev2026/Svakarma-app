"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePrismaError = exports.AppError = void 0;
const client_1 = require("@prisma/client");
class AppError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = 'AppError';
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const handlePrismaError = (err) => {
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002': {
                const target = err.meta?.target?.join(', ') || 'field';
                return new AppError(400, `Unique constraint failed: A record with this ${target} already exists.`);
            }
            case 'P2025': {
                const cause = err.meta?.cause || 'Required record was not found.';
                return new AppError(404, cause);
            }
            default:
                return new AppError(500, `Database error code ${err.code}: ${err.message}`);
        }
    }
    return err;
};
exports.handlePrismaError = handlePrismaError;
