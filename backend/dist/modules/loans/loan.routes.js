"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loan_controller_1 = require("./loan.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authMiddleware, (req, res, next) => {
    loan_controller_1.loanController.getActiveLoans(req, res, next);
});
router.get('/applications', auth_1.authMiddleware, (req, res, next) => {
    loan_controller_1.loanController.getApplications(req, res, next);
});
router.post('/apply', auth_1.authMiddleware, (req, res, next) => {
    loan_controller_1.loanController.apply(req, res, next);
});
router.post('/calculator', (req, res, next) => {
    loan_controller_1.loanController.calculateEmi(req, res, next);
});
exports.default = router;
