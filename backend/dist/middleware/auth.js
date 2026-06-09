"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../shared/prisma");
const env_1 = require("../config/env");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.',
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        // 1. Verify standard JWT signature and validity
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // 2. Fetch the user and verify they are active and not deleted
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                id: decoded.userId,
                deletedAt: null,
            },
        });
        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'Invalid user session or user account has been deactivated.',
            });
        }
        // 3. Optional: Verify session exists in DB
        const session = await prisma_1.prisma.session.findFirst({
            where: {
                userId: user.id,
                token: token,
            },
        });
        if (!session) {
            return res.status(403).json({
                success: false,
                message: 'Session has expired or is invalid.',
            });
        }
        // 4. Attach user information to request
        req.userId = user.id;
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }
};
exports.authMiddleware = authMiddleware;
exports.default = exports.authMiddleware;
