import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { loanService } from './loan.service';

export class LoanController {
  async getApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const list = await loanService.getApplications(userId);
      return res.json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }

  async apply(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { amount, tenureMonths, purpose } = req.body;
      const newApp = await loanService.apply(userId, { amount, tenureMonths, purpose });
      return res.status(201).json({
        success: true,
        message: 'Loan application submitted successfully!',
        data: newApp,
      });
    } catch (error) {
      next(error);
    }
  }

  async calculateEmi(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { amount, rate, tenureMonths } = req.body;
      const calculation = loanService.calculateEMI(amount, rate, tenureMonths);
      return res.json({
        success: true,
        data: calculation,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveLoans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const list = await loanService.getActiveLoans(userId);
      return res.json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const loanController = new LoanController();
