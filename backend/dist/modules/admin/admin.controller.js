"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
class AdminController {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password)
                return res.status(400).json({ success: false, message: 'email and password are required.' });
            const result = await admin_service_1.adminService.login(email, password);
            return res.json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async getDashboard(req, res, next) {
        try {
            const stats = await admin_service_1.adminService.getDashboardStats();
            return res.json({ success: true, data: stats });
        }
        catch (error) {
            next(error);
        }
    }
    async getApplications(req, res, next) {
        try {
            const { status, page = '1', limit = '20' } = req.query;
            const result = await admin_service_1.adminService.getApplications(status, +page, +limit);
            return res.json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
    async getApplicationById(req, res, next) {
        try {
            const app = await admin_service_1.adminService.getApplicationById(req.params.id);
            return res.json({ success: true, data: app });
        }
        catch (error) {
            next(error);
        }
    }
    async updateApplicationStatus(req, res, next) {
        try {
            const { status, notes } = req.body;
            if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status))
                return res.status(400).json({ success: false, message: 'status must be PENDING | APPROVED | REJECTED' });
            const updated = await admin_service_1.adminService.updateApplicationStatus(req.params.id, status, notes, req.adminEmail);
            return res.json({ success: true, message: `Application ${status.toLowerCase()}.`, data: updated });
        }
        catch (error) {
            next(error);
        }
    }
    async getUsers(req, res, next) {
        try {
            const { page = '1', limit = '20' } = req.query;
            const result = await admin_service_1.adminService.getUsers(+page, +limit);
            return res.json({ success: true, ...result });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
