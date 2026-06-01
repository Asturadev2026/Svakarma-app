import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, (req, res) => {
  return res.json({
    success: true,
    data: {
      score: 742,
      maxScore: 900,
      status: 'Good',
      lastUpdated: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      scoreHistory: [
        { month: 'Dec', score: 710 },
        { month: 'Jan', score: 718 },
        { month: 'Feb', score: 725 },
        { month: 'Mar', score: 730 },
        { month: 'Apr', score: 738 },
        { month: 'May', score: 742 },
      ],
      factors: [
        { name: 'Payment History', rating: 'Excellent', status: 'high' },
        { name: 'Credit Utilization', rating: '24% Used', status: 'high' },
        { name: 'Credit Age', rating: '4 Yrs 2 Mos', status: 'medium' },
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

export default router;
