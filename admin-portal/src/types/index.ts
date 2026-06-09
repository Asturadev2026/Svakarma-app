export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
}

export interface Application {
  id: string;
  requestedAmount: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name?: string;
    phone: string;
    companyName?: string;
  };
  statusHistory?: StatusHistory[];
}

export interface StatusHistory {
  id: string;
  applicationId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  changedBy?: string;
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  businessType: string;
  businessName: string;
  gstNumber?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  industry?: string;
  annualTurnover?: string;
  city?: string;
  state?: string;
}

export interface UserDocument {
  id: string;
  docType: string;
  fileUrl: string;
  fileName: string;
  mimeType?: string;
  status: string;
  createdAt: string;
}

export interface User {
  id: string;
  name?: string;
  phone: string;
  companyName?: string;
  location?: string;
  role: string;
  profileCompletion: number;
  createdAt: string;
  businessProfile?: { businessName: string; businessType: string };
  _count?: { applications: number; documents: number };
}
