"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanController = exports.LoanController = void 0;
const loan_service_1 = require("./loan.service");
class LoanController {
    async getApplications(req, res, next) {
        try {
            const userId = req.userId;
            const list = await loan_service_1.loanService.getApplications(userId);
            return res.json({
                success: true,
                data: list,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async apply(req, res, next) {
        try {
            const userId = req.userId;
            const { amount, tenureMonths, purpose } = req.body;
            const newApp = await loan_service_1.loanService.apply(userId, { amount, tenureMonths, purpose });
            return res.status(201).json({
                success: true,
                message: 'Loan application submitted successfully!',
                data: newApp,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async calculateEmi(req, res, next) {
        try {
            const { amount, rate, tenureMonths } = req.body;
            const calculation = loan_service_1.loanService.calculateEMI(amount, rate, tenureMonths);
            return res.json({
                success: true,
                data: calculation,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getActiveLoans(req, res, next) {
        try {
            const userId = req.userId;
            const list = await loan_service_1.loanService.getActiveLoans(userId);
            return res.json({
                success: true,
                data: list,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.LoanController = LoanController;
exports.loanController = new LoanController();
