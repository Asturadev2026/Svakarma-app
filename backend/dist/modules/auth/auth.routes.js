"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
router.post('/send-otp', (req, res, next) => {
    auth_controller_1.authController.sendOtp(req, res, next);
});
router.post('/verify-otp', (req, res, next) => {
    auth_controller_1.authController.verifyOtp(req, res, next);
});
exports.default = router;
