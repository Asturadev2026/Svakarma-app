"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthMiddleware = adminAuthMiddleware;
const admin_service_1 = require("../modules/admin/admin.service");
function adminAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Admin access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = admin_service_1.adminService.verifyToken(token);
        if (!decoded.isAdmin)
            throw new Error('Not an admin token.');
        req.adminId = decoded.adminId;
        req.adminEmail = decoded.email;
        req.adminRole = decoded.role;
        next();
    }
    catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired admin token.' });
    }
}
