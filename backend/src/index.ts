import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';

// Load environment variables
config();

// Module Routes
import authRoutes from './modules/auth/auth.routes';
import cibilRoutes from './modules/cibil/cibil.routes';
import loanRoutes from './modules/loans/loan.routes';
import referralRoutes from './modules/referrals/referral.routes';
import profileRoutes from './modules/profile/profile.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Logging Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'svakarma-mobile-backend' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cibil', cibilRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/profile', profileRoutes);

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
app.listen(PORT, () => {
  console.log(`🚀 Svakarma Backend running at http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
});

export default app;
