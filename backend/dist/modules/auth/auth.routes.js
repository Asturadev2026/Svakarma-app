"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// Store active OTPs in memory for MVP/testing purposes
const otpStorage = new Map();
router.post('/send-otp', (req, res) => {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) {
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number. Must be a 10-digit number.',
        });
    }
    // Generate a standard dummy OTP
    const otp = '123456';
    otpStorage.set(phone, otp);
    console.log(`[OTP Engine] OTP sent to ${phone}: ${otp}`);
    return res.json({
        success: true,
        message: 'OTP sent successfully (mocked). Use 123456 to verify.',
    });
});
router.post('/verify-otp', (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({
            success: false,
            message: 'Phone and OTP are required.',
        });
    }
    const expectedOtp = otpStorage.get(phone) || '123456'; // Fallback to '123456' for standard flows
    if (otp !== expectedOtp) {
        return res.status(400).json({
            success: false,
            message: 'Invalid OTP code. Please try again.',
        });
    }
    // Success: Clear OTP
    otpStorage.delete(phone);
    // Sign standard JWT
    const userId = `usr_${Math.random().toString(36).substr(2, 9)}`;
    const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'svakarma_super_secret_key_2026_dev_prod', { expiresIn: '30d' });
    return res.json({
        success: true,
        message: 'OTP verified successfully.',
        token,
        user: {
            id: userId,
            phone,
            name: 'Rajesh Kumar Mehta',
            companyName: 'Mehta Enterprises',
            location: 'Pune, Maharashtra',
            profileCompletion: 85,
        },
    });
});
exports.default = router;
