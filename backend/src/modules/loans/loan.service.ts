import { prisma } from '../../shared/prisma';
import { AppError } from '../../shared/errors';
import { ApplicationStatus } from '@prisma/client';

export class LoanService {
  private mapApplicationToResponse(app: any) {
    const submittedDate = new Date(app.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    let statusSteps: { label: string; completed: boolean; date?: string; subtitle?: string }[] = [
      { label: 'Application Submitted', completed: true, date: submittedDate },
      { label: 'Document Verification', completed: false, subtitle: undefined },
      { label: 'Credit Assessment', completed: false, subtitle: undefined },
      { label: 'Final Underwriting', completed: false, subtitle: undefined },
      { label: 'Disbursal', completed: false, subtitle: undefined },
    ];

    if (app.status === ApplicationStatus.APPROVED) {
      statusSteps = statusSteps.map((s) => ({
        ...s,
        completed: true,
        date: submittedDate,
      }));
    } else if (app.status === ApplicationStatus.REJECTED) {
      statusSteps[1] = {
        label: 'Verification Failed',
        completed: false,
        subtitle: 'Application rejected during evaluation',
      };
    } else {
      // PENDING status
      statusSteps[1] = {
        label: 'Document Verification',
        completed: true,
        date: submittedDate,
        subtitle: undefined,
      };
      statusSteps[2] = {
        label: 'Credit Assessment',
        completed: false,
        subtitle: 'CIBIL report being reviewed',
      };
    }

    return {
      id: app.id,
      amount: app.requestedAmount,
      tenureMonths: 36, // default fallback
      purpose: app.purpose,
      status: app.status === ApplicationStatus.APPROVED ? 'Approved' : (app.status === ApplicationStatus.REJECTED ? 'Rejected' : 'Submitted'),
      statusSteps,
      submittedAt: submittedDate,
    };
  }

  async getApplications(userId: string) {
    const apps = await prisma.loanApplication.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return apps.map((app) => this.mapApplicationToResponse(app));
  }

  async apply(userId: string, data: { amount: number; tenureMonths: number; purpose: string }) {
    if (!data.amount || !data.purpose) {
      throw new AppError(400, 'Loan amount and purpose are required.');
    }

    const newApp = await prisma.loanApplication.create({
      data: {
        userId,
        requestedAmount: Number(data.amount),
        purpose: data.purpose,
        status: ApplicationStatus.PENDING,
      },
    });

    return this.mapApplicationToResponse(newApp);
  }

  calculateEMI(amount: number, rate: number, tenureMonths: number) {
    if (!amount || !rate || !tenureMonths) {
      throw new AppError(400, 'Amount, interest rate, and tenure are required.');
    }

    const p = Number(amount);
    const r = Number(rate) / 12 / 100; // monthly interest rate
    const n = Number(tenureMonths);

    // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - p;

    return {
      monthlyEMI: Math.round(emi),
      principalAmount: p,
      totalInterest: Math.round(totalInterest),
      totalPayable: Math.round(totalPayable),
    };
  }

  async getActiveLoans(userId: string) {
    const loans = await prisma.loan.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    return loans;
  }
}

export const loanService = new LoanService();
