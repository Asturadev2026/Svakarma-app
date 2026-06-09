"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Mount user profile routes
router.get('/check-onboarding', auth_1.authMiddleware, (req, res, next) => {
    user_controller_1.userController.checkOnboarding(req, res, next);
});
router.get('/', auth_1.authMiddleware, (req, res, next) => {
    user_controller_1.userController.getProfile(req, res, next);
});
router.put('/', auth_1.authMiddleware, (req, res, next) => {
    user_controller_1.userController.updateProfile(req, res, next);
});
exports.default = router;
