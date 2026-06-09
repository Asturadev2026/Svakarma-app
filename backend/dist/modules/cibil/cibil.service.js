"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cibilService = exports.CibilService = void 0;
const prisma_1 = require("../../shared/prisma");
class CibilService {
    async getCibilData(userId, generate = false) {
        let scores = await prisma_1.prisma.cibilScore.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' }, // chronological order
        });
        if (scores.length === 0) {
            if (!generate) {
                return null;
            }
            // Generate and save a new default CIBIL score for this user
            const initialScore = 742; // standard good starting score
            const newScore = await prisma_1.prisma.cibilScore.create({
                data: {
                    userId,
                    score: initialScore,
                    reportUrl: `https://bureau.reports.example.com/svk-${Math.floor(1000000 + Math.random() * 9000000)}`,
                },
            });
            scores = [newScore];
        }
        const latestRecord = scores[scores.length - 1];
        const latestScore = latestRecord.score;
        // Determine status text
        let status = 'Fair';
        if (latestScore >= 750)
            status = 'Excellent';
        else if (latestScore >= 700)
            status = 'Good';
        else if (latestScore < 600)
            status = 'Poor';
        // Generate score history formatted for the frontend
        const scoreHistory = scores.map((s) => ({
            month: new Date(s.createdAt).toLocaleDateString('en-IN', { month: 'short' }),
            score: s.score,
        }));
        // Dynamically generate factors based on the latest score
        const factors = [
            {
                name: 'Payment History',
                rating: latestScore >= 730 ? 'Excellent' : (latestScore >= 680 ? 'Good' : 'Fair'),
                status: latestScore >= 680 ? 'high' : 'medium',
            },
            {
                name: 'Credit Utilization',
                rating: latestScore >= 750 ? '18% Used' : '28% Used',
                status: 'high',
            },
            {
                name: 'Credit Age',
                rating: '4 Yrs 2 Mos',
                status: 'medium',
            },
            {
                name: 'Total Accounts',
                rating: '4 Active',
                status: 'medium',
            },
            {
                name: 'Recent Inquiries',
                rating: latestScore >= 750 ? '0 in 30 days' : '1 in 30 days',
                status: 'low',
            },
        ];
        // Dynamically generate insights
        const insights = latestScore >= 720
            ? [
                'You have a clean repayment history with 100% on-time payments.',
                'Keeping credit card utilization below 30% helps boost your score further.',
            ]
            : [
                'Late payments or higher utilization may be dragging your score down.',
                'Ensure all monthly dues are settled before the due date to rebuild your rating.',
            ];
        return {
            score: latestScore,
            maxScore: 900,
            status,
            lastUpdated: new Date(latestRecord.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }),
            scoreHistory,
            factors,
            insights,
        };
    }
}
exports.CibilService = CibilService;
exports.cibilService = new CibilService();
