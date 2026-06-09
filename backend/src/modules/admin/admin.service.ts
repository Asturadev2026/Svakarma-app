import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../shared/prisma';
import { AppError } from '../../shared/errors';

const ADMIN_JWT_SECRET = process.env.JWT_SECRET + '_admin';
const ADMIN_JWT_EXPIRES = '8h';

// ─────────────────────────────────────────────────────────────────────────────

export class AdminService {

  // ── Auth ──────────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !admin.isActive) throw new AppError(401, 'Invalid credentials.');

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) throw new AppError(401, 'Invalid credentials.');

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, role: admin.role, isAdmin: true },
      ADMIN_JWT_SECRET,
      { expiresIn: ADMIN_JWT_EXPIRES },
    );

    return {
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    };
  }

  verifyToken(token: string) {
    return jwt.verify(token, ADMIN_JWT_SECRET) as any;
  }

  // ── Applications ──────────────────────────────────────────────────────────

  async getApplications(status?: string, page = 1, limit = 20) {
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.loanApplication.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, phone: true, companyName: true } },
          statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.loanApplication.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getApplicationById(id: string) {
    const app = await prisma.loanApplication.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            businessProfile: true,
            documents: { orderBy: { createdAt: 'desc' } },
          },
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!app) throw new AppError(404, 'Application not found.');
    return app;
  }

  async updateApplicationStatus(
    id: string,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    notes: string | undefined,
    adminEmail: string,
  ) {
    const app = await prisma.loanApplication.findUnique({ where: { id } });
    if (!app) throw new AppError(404, 'Application not found.');

    const ops: any[] = [
      prisma.loanApplication.update({
        where: { id },
        data: { status: status as any, notes, updatedAt: new Date() },
      }),
      prisma.applicationStatusHistory.create({
        data: { applicationId: id, status: status as any, notes, changedBy: adminEmail },
      }),
    ];

    if (status === 'APPROVED') {
      const amount = app.requestedAmount;
      const rate = 24; // 24% p.a.
      const tenureMonths = 36;
      const p = amount;
      const r = rate / 12 / 100;
      const n = tenureMonths;
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

      ops.push(
        prisma.loan.create({
          data: {
            userId: app.userId,
            loanNumber: `SVK-${Math.floor(1000000 + Math.random() * 9000000)}`,
            amount: amount,
            status: 'ACTIVE',
            emiDue: Math.round(emi),
            nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })
      );
    }

    const [updated] = await prisma.$transaction(ops);
    return updated;
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async getUsers(page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true, name: true, phone: true, companyName: true,
          location: true, role: true, profileCompletion: true, createdAt: true,
          businessProfile: { select: { businessName: true, businessType: true } },
          _count: { select: { applications: true, documents: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where: { deletedAt: null } }),
    ]);
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const [totalUsers, totalApplications, pendingApplications, approvedApplications] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.loanApplication.count(),
        prisma.loanApplication.count({ where: { status: 'PENDING' } }),
        prisma.loanApplication.count({ where: { status: 'APPROVED' } }),
      ]);

    return { totalUsers, totalApplications, pendingApplications, approvedApplications };
  }

  // ── Seed ─────────────────────────────────────────────────────────────────

  /** Creates the default super-admin if none exist */
  async ensureDefaultAdmin() {
    const count = await prisma.adminUser.count();
    if (count > 0) return;
    const hash = await bcrypt.hash('Admin@123', 10);
    await prisma.adminUser.create({
      data: { email: 'admin@svakarma.com', name: 'Super Admin', passwordHash: hash, role: 'super' },
    });
    console.log('[Admin] Default admin created → admin@svakarma.com / Admin@123');
  }
}

export const adminService = new AdminService();
