import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

// Store user loan applications in memory
const applicationsStorage = new Map<string, any[]>();

// Initialize default mock application for the demo flow
const defaultApplications = [
  {
    id: 'la_984321',
    amount: 1500000,
    tenureMonths: 36,
    purpose: 'Machinery Purchase',
    status: 'In Progress', // 'Submitted', 'In Progress', 'Approved', 'Rejected', 'Disbursed'
    statusSteps: [
      { label: 'Application Submitted', completed: true, date: '28 May 2026' },
      { label: 'Document Verification', completed: true, date: '30 May 2026' },
      { label: 'Credit Assessment', completed: false, subtitle: 'CIBIL report being reviewed' },
      { label: 'Final Underwriting', completed: false },
      { label: 'Disbursal', completed: false },
    ],
    submittedAt: '28 May 2026',
  },
];

router.get('/applications', authMiddleware, (req, res) => {
  const userId = req.userId || 'default_user';
  const list = applicationsStorage.get(userId) || defaultApplications;
  return res.json({
    success: true,
    data: list,
  });
});

router.post('/apply', authMiddleware, (req, res) => {
  const userId = req.userId || 'default_user';
  const { amount, tenureMonths, purpose, businessName, udyamId, pan, aadhaar } = req.body;

  if (!amount || !tenureMonths || !purpose) {
    return res.status(400).json({
      success: false,
      message: 'Loan amount, tenure, and purpose are required.',
    });
  }

  const newApp = {
    id: `la_${Math.random().toString(36).substr(2, 9)}`,
    amount: Number(amount),
    tenureMonths: Number(tenureMonths),
    purpose,
    status: 'Submitted',
    statusSteps: [
      { label: 'Application Submitted', completed: true, date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
      { label: 'Document Verification', completed: false, subtitle: 'Documents queued for scanning' },
      { label: 'Credit Assessment', completed: false },
      { label: 'Final Underwriting', completed: false },
      { label: 'Disbursal', completed: false },
    ],
    submittedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    businessDetails: { businessName, udyamId, pan, aadhaar },
  };

  const currentList = applicationsStorage.get(userId) || defaultApplications;
  const updatedList = [newApp, ...currentList];
  applicationsStorage.set(userId, updatedList);

  return res.status(201).json({
    success: true,
    message: 'Loan application submitted successfully!',
    data: newApp,
  });
});

router.post('/calculator', (req, res) => {
  const { amount, rate, tenureMonths } = req.body;

  if (!amount || !rate || !tenureMonths) {
    return res.status(400).json({
      success: false,
      message: 'Amount, interest rate, and tenure are required.',
    });
  }

  const p = Number(amount);
  const r = Number(rate) / 12 / 100; // monthly rate
  const n = Number(tenureMonths);

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayable = emi * n;
  const totalInterest = totalPayable - p;

  return res.json({
    success: true,
    data: {
      monthlyEMI: Math.round(emi),
      principalAmount: p,
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable),
    },
  });
});

export default router;
