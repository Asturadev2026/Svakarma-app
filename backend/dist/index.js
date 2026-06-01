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
const dotenv_1 = require("dotenv");
// Load environment variables
(0, dotenv_1.config)();
// Module Routes
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const cibil_routes_1 = __importDefault(require("./modules/cibil/cibil.routes"));
const loan_routes_1 = __importDefault(require("./modules/loans/loan.routes"));
const referral_routes_1 = __importDefault(require("./modules/referrals/referral.routes"));
const profile_routes_1 = __importDefault(require("./modules/profile/profile.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security and Logging Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health Check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'svakarma-mobile-backend' });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/cibil', cibil_routes_1.default);
app.use('/api/loans', loan_routes_1.default);
app.use('/api/referrals', referral_routes_1.default);
app.use('/api/profile', profile_routes_1.default);
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
app.listen(PORT, () => {
    console.log(`🚀 Svakarma Backend running at http://localhost:${PORT}`);
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
});
exports.default = app;
