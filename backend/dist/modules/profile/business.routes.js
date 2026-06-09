"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const business_controller_1 = require("./business.controller");
const router = (0, express_1.Router)();
/**
 * POST /api/profile/business
 * Create or update the authenticated user's business profile.
 */
router.post('/', auth_1.authMiddleware, (req, res, next) => {
    business_controller_1.businessController.upsertBusinessProfile(req, res, next);
});
/**
 * GET /api/profile/business
 * Retrieve the authenticated user's business profile.
 */
router.get('/', auth_1.authMiddleware, (req, res, next) => {
    business_controller_1.businessController.getBusinessProfile(req, res, next);
});
exports.default = router;
