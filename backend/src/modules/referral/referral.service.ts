import { prisma } from '../../shared/prisma';
import { AppError } from '../../shared/errors';
import { ReferralStatus } from '@prisma/client';

export class ReferralService {
  async getSummary(userId: string) {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referredUser: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const history = referrals.map((ref) => ({
      id: ref.id,
      name: ref.referredUser?.name ?? 'Pending User',
      phone: ref.referredUser?.phone ?? '',
      status: ref.status === ReferralStatus.COMPLETED ? 'Approved' : 'Pending',
      amount: ref.rewardAmount,
      date: new Date(ref.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    }));

    const totalEarned = history
      .filter((r) => r.status === 'Approved')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalPending = history
      .filter((r) => r.status === 'Pending')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      totalEarned,
      totalPending,
      totalRefers: history.length,
      history,
    };
  }

  async invite(userId: string, name: string, phone: string) {
    if (!name || !phone || phone.length !== 10) {
      throw new AppError(400, 'Full name and a valid 10-digit phone number are required.');
    }

    // Check if user is trying to invite themselves
    const referrer = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (referrer && referrer.phone === phone) {
      throw new AppError(400, 'You cannot refer yourself.');
    }

    // Find or create the referred user to attach to
    let referredUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (!referredUser) {
      referredUser = await prisma.user.create({
        data: {
          phone,
          name, // Set their name as provided by the referrer
          profileCompletion: 0,
        },
      });
    }

    // Check if referral record already exists
    const existingReferral = await prisma.referral.findFirst({
      where: {
        referrerId: userId,
        referredUserId: referredUser.id,
      },
    });

    if (existingReferral) {
      throw new AppError(400, 'You have already invited this user.');
    }

    const referralCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newReferral = await prisma.referral.create({
      data: {
        referrerId: userId,
        referredUserId: referredUser.id,
        referralCode,
        rewardAmount: 500, // Standard reward
        status: ReferralStatus.PENDING,
      },
    });

    return {
      id: newReferral.id,
      name,
      phone,
      status: 'Pending',
      amount: newReferral.rewardAmount,
      date: new Date(newReferral.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };
  }
}

export const referralService = new ReferralService();
