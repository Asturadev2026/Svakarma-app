import { prisma } from '../../shared/prisma';
import { AppError } from '../../shared/errors';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const toNumber = (v: any) => Number(String(v ?? '').replace(/[^0-9.]/g, '')) || 0;

export class HomeService {
  /**
   * Dashboard aggregate: the pre-approved offer + the enriched active loan.
   * (Greeting and CIBIL stay on /profile and /cibil.)
   */
  async getSummary(userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { businessProfile: true },
    });
    if (!user) throw new AppError(404, 'User not found.');

    // Pre-approved offer: 40% of annual turnover, clamped to a sensible band;
    // falls back to a default headline figure when turnover is unknown.
    const turnover = toNumber(user.businessProfile?.annualTurnover);
    const eligibleAmount = turnover > 0 ? clamp(Math.round(turnover * 0.4), 200000, 2500000) : 850000;

    // Active loan (most recent), enriched with paid/total EMIs + outstanding.
    const loan = await prisma.loan.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    let activeLoan: any = null;
    if (loan) {
      let totalEmis = 24;
      const disb = await prisma.disbursement.findFirst({ where: { loanId: loan.id } });
      if (disb) {
        const app = await prisma.loanApplication.findUnique({ where: { id: disb.applicationId } });
        if (app?.offerTenorMonths) totalEmis = app.offerTenorMonths;
      }
      const paidEmis = await prisma.payment.count({ where: { loanId: loan.id, status: 'paid' } });
      const remaining = Math.max(0, totalEmis - paidEmis);
      const outstanding = Math.round(loan.amount * (remaining / totalEmis));

      activeLoan = {
        loanNumber: loan.loanNumber,
        amount: loan.amount,
        outstanding,
        emiDue: loan.emiDue,
        nextDueDate: loan.nextDueDate,
        paidEmis,
        totalEmis,
        status: 'ON TIME',
      };
    }

    return {
      preApproved: { eligibleAmount, expiresInDays: 14, zeroDocs: true },
      activeLoan,
    };
  }
}

export const homeService = new HomeService();
