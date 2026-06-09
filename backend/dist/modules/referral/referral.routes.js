"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const referral_controller_1 = require("./referral.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.get('/summary', auth_1.authMiddleware, (req, res, next) => {
    referral_controller_1.referralController.getSummary(req, res, next);
});
router.post('/invite', auth_1.authMiddleware, (req, res, next) => {
    referral_controller_1.referralController.invite(req, res, next);
});
exports.default = router;
