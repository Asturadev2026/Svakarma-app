"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Store referrals in memory
const referralStorage = new Map();
const defaultReferrals = [
    { id: 'ref_1', name: 'Amit Sharma', phone: '9823412345', status: 'Approved', amount: 1500, date: '12 May 2026' },
    { id: 'ref_2', name: 'Sanjay Deshmukh', phone: '8877665544', status: 'Pending', amount: 500, date: '25 May 2026' },
];
router.get('/summary', auth_middleware_1.authMiddleware, (req, res) => {
    const userId = req.userId || 'default_user';
    const list = referralStorage.get(userId) || defaultReferrals;
    const totalEarned = list
        .filter(r => r.status === 'Approved')
        .reduce((sum, r) => sum + r.amount, 0);
    const totalPending = list
        .filter(r => r.status === 'Pending')
        .reduce((sum, r) => sum + r.amount, 0);
    return res.json({
        success: true,
        data: {
            totalEarned,
            totalPending,
            totalRefers: list.length,
            history: list,
        },
    });
});
router.post('/invite', auth_middleware_1.authMiddleware, (req, res) => {
    const userId = req.userId || 'default_user';
    const { name, phone } = req.body;
    if (!name || !phone || phone.length !== 10) {
        return res.status(400).json({
            success: false,
            message: 'Full name and a valid 10-digit phone number are required.',
        });
    }
    const newReferral = {
        id: `ref_${Math.random().toString(36).substr(2, 9)}`,
        name,
        phone,
        status: 'Pending',
        amount: 500,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    const currentList = referralStorage.get(userId) || defaultReferrals;
    const updatedList = [newReferral, ...currentList];
    referralStorage.set(userId, updatedList);
    return res.json({
        success: true,
        message: 'Referral invite sent successfully!',
        data: newReferral,
    });
});
exports.default = router;
