import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import './config/env'; // Validate environment variables early
import prisma from './shared/prisma';

// Module Routes
import authRoutes from './modules/auth/auth.routes';
import cibilRoutes from './modules/cibil/cibil.routes';
import loanRoutes from './modules/loans/loan.routes';
import referralRoutes from './modules/referral/referral.routes';
import userRoutes from './modules/user/user.routes';
import businessRoutes from './modules/profile/business.routes';
import documentRoutes from './modules/documents/document.routes';
import adminRoutes from './modules/admin/admin.routes';
import paymentRoutes from './modules/payments/payment.routes';
import { paymentController } from './modules/payments/payment.controller';
import productRoutes from './modules/products/product.routes';
import applicationRoutes from './modules/applications/application.routes';
import verificationRoutes from './modules/verification/verification.routes';
import homeRoutes from './modules/home/home.routes';
import { adminService } from './modules/admin/admin.service';

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Logging Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Payment webhook MUST receive the raw body so the gateway signature can be
// verified against the exact bytes sent. Registered before express.json().
app.post(
  '/api/payments/webhook',
  express.raw({ type: '*/*' }),
  (req, res, next) => paymentController.webhook(req, res, next)
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically — accessible at /uploads/<filename>
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Health Check
app.get('/health', async (_req, res) => {
  try {
    // Run simple query to test DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      service: 'svakarma-mobile-backend',
    });
  } catch (error: any) {
    console.error('Database connection failed in health check:', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message || 'Connection failed',
      timestamp: new Date().toISOString(),
      service: 'svakarma-mobile-backend',
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cibil', cibilRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/admin', adminRoutes);
// Mount /api/profile/business BEFORE /api/profile to prevent prefix conflict
app.use('/api/profile/business', businessRoutes);
app.use('/api/profile', userRoutes);


// 404 Route handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error encountered:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Svakarma Backend running at http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  await adminService.ensureDefaultAdmin();
});

export default app;
