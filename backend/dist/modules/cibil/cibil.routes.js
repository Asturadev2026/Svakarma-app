"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authMiddleware, (req, res) => {
    return res.json({
        success: true,
        data: {
            score: 784,
            maxScore: 900,
            status: 'Excellent',
            lastUpdated: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            scoreHistory: [
                { month: 'Dec', score: 750 },
                { month: 'Jan', score: 762 },
                { month: 'Feb', score: 758 },
                { month: 'Mar', score: 770 },
                { month: 'Apr', score: 780 },
                { month: 'May', score: 784 },
            ],
            factors: [
                { name: 'Payment History', rating: 'Excellent', status: 'high' },
                { name: 'Credit Utilization', rating: '18% Used', status: 'high' },
                { name: 'Credit Age', rating: '5 Yrs 4 Mos', status: 'medium' },
                { name: 'Total Accounts', rating: '4 Active', status: 'medium' },
                { name: 'Recent Inquiries', rating: '1 in 30 days', status: 'low' },
            ],
            insights: [
                'You have a clean repayment history with 100% on-time payments.',
                'Keeping credit card utilization below 30% helps boost your score further.',
            ],
        },
    });
});
exports.default = router;
