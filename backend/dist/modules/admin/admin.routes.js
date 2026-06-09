"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const adminAuth_1 = require("../../middleware/adminAuth");
const router = (0, express_1.Router)();
// ── Public ──────────────────────────────────────────────────────────────────
/** POST /api/admin/login */
router.post('/login', (req, res, next) => admin_controller_1.adminController.login(req, res, next));
// ── Protected ────────────────────────────────────────────────────────────────
/** GET /api/admin/dashboard */
router.get('/dashboard', adminAuth_1.adminAuthMiddleware, (req, res, next) => admin_controller_1.adminController.getDashboard(req, res, next));
/** GET /api/admin/applications?status=PENDING&page=1&limit=20 */
router.get('/applications', adminAuth_1.adminAuthMiddleware, (req, res, next) => admin_controller_1.adminController.getApplications(req, res, next));
/** GET /api/admin/applications/:id */
router.get('/applications/:id', adminAuth_1.adminAuthMiddleware, (req, res, next) => admin_controller_1.adminController.getApplicationById(req, res, next));
/** PATCH /api/admin/applications/:id/status */
router.patch('/applications/:id/status', adminAuth_1.adminAuthMiddleware, (req, res, next) => admin_controller_1.adminController.updateApplicationStatus(req, res, next));
/** GET /api/admin/users?page=1&limit=20 */
router.get('/users', adminAuth_1.adminAuthMiddleware, (req, res, next) => admin_controller_1.adminController.getUsers(req, res, next));
exports.default = router;
