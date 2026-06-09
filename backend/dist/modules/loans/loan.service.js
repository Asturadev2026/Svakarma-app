"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanService = exports.LoanService = void 0;
const prisma_1 = require("../../shared/prisma");
const errors_1 = require("../../shared/errors");
const client_1 = require("@prisma/client");
class LoanService {
    mapApplicationToResponse(app) {
        const submittedDate = new Date(app.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
        let statusSteps = [
            { label: 'Application Submitted', completed: true, date: submittedDate },
            { label: 'Document Verification', completed: false, subtitle: undefined },
            { label: 'Credit Assessment', completed: false, subtitle: undefined },
            { label: 'Final Underwriting', completed: false, subtitle: undefined },
            { label: 'Disbursal', completed: false, subtitle: undefined },
        ];
        if (app.status === client_1.ApplicationStatus.APPROVED) {
            statusSteps = statusSteps.map((s) => ({
                ...s,
                completed: true,
                date: submittedDate,
            }));
        }
        else if (app.status === client_1.ApplicationStatus.REJECTED) {
            statusSteps[1] = {
                label: 'Verification Failed',
                completed: false,
                subtitle: 'Application rejected during evaluation',
            };
        }
        else {
            // PENDING status
            statusSteps[1] = {
                label: 'Document Verification',
                completed: true,
                date: submittedDate,
                subtitle: undefined,
            };
            statusSteps[2] = {
                label: 'Credit Assessment',
                completed: false,
                subtitle: 'CIBIL report being reviewed',
            };
        }
        return {
            id: app.id,
            amount: app.requestedAmount,
            tenureMonths: 36, // default fallback
            purpose: app.purpose,
            status: app.status === client_1.ApplicationStatus.APPROVED ? 'Approved' : (app.status === client_1.ApplicationStatus.REJECTED ? 'Rejected' : 'Submitted'),
            statusSteps,
            submittedAt: submittedDate,
        };
    }
    async getApplications(userId) {
        const apps = await prisma_1.prisma.loanApplication.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return apps.map((app) => this.mapApplicationToResponse(app));
    }
    async apply(userId, data) {
        if (!data.amount || !data.purpose) {
            throw new errors_1.AppError(400, 'Loan amount and purpose are required.');
        }
        const newApp = await prisma_1.prisma.loanApplication.create({
            data: {
                userId,
                requestedAmount: Number(data.amount),
                purpose: data.purpose,
                status: client_1.ApplicationStatus.PENDING,
            },
        });
        return this.mapApplicationToResponse(newApp);
    }
    calculateEMI(amount, rate, tenureMonths) {
        if (!amount || !rate || !tenureMonths) {
            throw new errors_1.AppError(400, 'Amount, interest rate, and tenure are required.');
        }
        const p = Number(amount);
        const r = Number(rate) / 12 / 100; // monthly interest rate
        const n = Number(tenureMonths);
        // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayable = emi * n;
        const totalInterest = totalPayable - p;
        return {
            monthlyEMI: Math.round(emi),
            principalAmount: p,
            totalInterest: Math.round(totalInterest),
            totalPayable: Math.round(totalPayable),
        };
    }
    async getActiveLoans(userId) {
        const loans = await prisma_1.prisma.loan.findMany({
            where: { userId, status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
        });
        return loans;
    }
}
exports.LoanService = LoanService;
exports.loanService = new LoanService();
