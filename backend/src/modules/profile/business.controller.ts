import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { businessService } from './business.service';
import { BusinessType } from '@prisma/client';

export class BusinessController {
  /**
   * POST /api/profile/business
   * Create or update the authenticated user's business profile
   */
  async upsertBusinessProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const {
        businessType,
        businessName,
        gstNumber,
        panNumber,
        aadhaarNumber,
        industry,
        annualTurnover,
        udyamNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
      } = req.body;

      // Validate enum value
      if (!Object.values(BusinessType).includes(businessType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid businessType. Must be one of: ${Object.values(BusinessType).join(', ')}`,
        });
      }

      const profile = await businessService.upsertBusinessProfile(userId, {
        businessType,
        businessName,
        gstNumber,
        panNumber,
        aadhaarNumber,
        industry,
        annualTurnover,
        udyamNumber,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
      });

      return res.status(200).json({
        success: true,
        message: 'Business profile saved successfully.',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/profile/business
   * Fetch the authenticated user's business profile.
   * Returns { hasProfile: false } if no business profile exists yet.
   */
  async getBusinessProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const profile = await businessService.getBusinessProfile(userId);

      if (!profile) {
        return res.status(200).json({
          success: true,
          hasProfile: false,
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        hasProfile: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const businessController = new BusinessController();
