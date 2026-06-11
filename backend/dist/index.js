"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
require("./config/env"); // Validate environment variables early
const prisma_1 = __importDefault(require("./shared/prisma"));
// Module Routes
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const cibil_routes_1 = __importDefault(require("./modules/cibil/cibil.routes"));
const loan_routes_1 = __importDefault(require("./modules/loans/loan.routes"));
const referral_routes_1 = __importDefault(require("./modules/referral/referral.routes"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const business_routes_1 = __importDefault(require("./modules/profile/business.routes"));
const document_routes_1 = __importDefault(require("./modules/documents/document.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const payment_routes_1 = __importDefault(require("./modules/payments/payment.routes"));
const payment_controller_1 = require("./modules/payments/payment.controller");
const admin_service_1 = require("./modules/admin/admin.service");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security and Logging Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
// Payment webhook MUST receive the raw body so the gateway signature can be
// verified against the exact bytes sent. Registered before express.json().
app.post('/api/payments/webhook', express_1.default.raw({ type: '*/*' }), (req, res, next) => payment_controller_1.paymentController.webhook(req, res, next));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files statically — accessible at /uploads/<filename>
const uploadsDir = path_1.default.join(__dirname, '../uploads');
app.use('/uploads', express_1.default.static(uploadsDir));
// Health Check
app.get('/health', async (_req, res) => {
    try {
        // Run simple query to test DB connectivity
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString(),
            service: 'svakarma-mobile-backend',
        });
    }
    catch (error) {
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
app.use('/api/auth', auth_routes_1.default);
app.use('/api/cibil', cibil_routes_1.default);
app.use('/api/loans', loan_routes_1.default);
app.use('/api/referrals', referral_routes_1.default);
app.use('/api/documents', document_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Mount /api/profile/business BEFORE /api/profile to prevent prefix conflict
app.use('/api/profile/business', business_routes_1.default);
app.use('/api/profile', user_routes_1.default);
// 404 Route handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found',
    });
});
// Global Error Handler
app.use((err, _req, res, _next) => {
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
    await admin_service_1.adminService.ensureDefaultAdmin();
});
exports.default = app;
