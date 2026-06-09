"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = exports.calculateProfileCompletion = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../shared/prisma");
const env_1 = require("../../config/env");
const errors_1 = require("../../shared/errors");
const calculateProfileCompletion = (user) => {
    let score = 0;
    if (user.name)
        score += 35;
    if (user.companyName)
        score += 35;
    if (user.location)
        score += 30;
    return score;
};
exports.calculateProfileCompletion = calculateProfileCompletion;
class AuthService {
    async sendOtp(phone) {
        if (!phone || phone.length !== 10) {
            throw new errors_1.AppError(400, 'Invalid phone number. Must be a 10-digit number.');
        }
        // Generate standard OTP (use '123456' for predictable test experience, but write it dynamically)
        // For production-readiness, we can use a random generator but fall back to '123456' for specific demo flows.
        const otp = phone === '9908889635' || phone === '7984876749' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        // Save to database
        await prisma_1.prisma.oTP.create({
            data: {
                phone,
                otp,
                expiresAt,
                verified: false,
            },
        });
        console.log(`[OTP Engine] OTP sent to ${phone}: ${otp}`);
        return {
            message: `OTP sent successfully. (Mocked transmission - code printed to console)`,
        };
    }
    async verifyOtp(phone, otp, deviceInfo) {
        if (!phone || !otp) {
            throw new errors_1.AppError(400, 'Phone and OTP are required.');
        }
        // Find latest active OTP session
        const otpRecord = await prisma_1.prisma.oTP.findFirst({
            where: {
                phone,
                otp,
                verified: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!otpRecord) {
            throw new errors_1.AppError(400, 'Invalid OTP code. Please try again.');
        }
        // Check expiration
        if (otpRecord.expiresAt < new Date()) {
            throw new errors_1.AppError(400, 'OTP code has expired. Please request a new one.');
        }
        // Mark OTP as verified
        await prisma_1.prisma.oTP.update({
            where: { id: otpRecord.id },
            data: { verified: true },
        });
        // Find or create user
        let user = await prisma_1.prisma.user.findUnique({
            where: { phone },
        });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: {
                    phone,
                    name: null,
                    companyName: null,
                    location: null,
                    profileCompletion: 0,
                },
            });
        }
        // Sign Access Token (standard JWT)
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.env.JWT_SECRET, { expiresIn: '30d' });
        // Create session record in database
        await prisma_1.prisma.session.create({
            data: {
                userId: user.id,
                token,
                deviceInfo: deviceInfo || null,
            },
        });
        return {
            token,
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name ?? 'Complete Your Profile',
                companyName: user.companyName ?? '',
                location: user.location ?? '',
                profileCompletion: (0, exports.calculateProfileCompletion)(user),
            },
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
