import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

// Store profile info in memory
let userProfile = {
  personalDetails: {
    fullName: 'Rajesh Kumar Mehta',
    email: 'rajesh.mehta@mehtaent.in',
    mobile: '+91 98765 43210',
    dob: '12/04/1985',
    pan: 'ABCDE1234F',
    aadhaar: 'XXXX XXXX 4527',
  },
  businessDetails: {
    businessName: 'Mehta Enterprises',
    udyamId: 'UDYAM-MH-18-0034521',
    gstin: '27ABCDE1234F1Z5',
    businessType: 'Manufacturing',
    industry: 'CNC & Tooling Units',
    annualTurnover: '₹45,00,000',
    location: 'Pune, Maharashtra',
  },
  kycStatus: {
    panVerified: true,
    aadhaarVerified: true,
    udyamVerified: true,
    gstVerified: true,
    completionPercentage: 85,
  },
};

router.get('/', authMiddleware, (req, res) => {
  return res.json({
    success: true,
    data: userProfile,
  });
});

router.put('/', authMiddleware, (req, res) => {
  const { personalDetails, businessDetails } = req.body;

  if (personalDetails) {
    userProfile.personalDetails = { ...userProfile.personalDetails, ...personalDetails };
  }

  if (businessDetails) {
    userProfile.businessDetails = { ...userProfile.businessDetails, ...businessDetails };
  }

  return res.json({
    success: true,
    message: 'Profile updated successfully!',
    data: userProfile,
  });
});

export default router;
