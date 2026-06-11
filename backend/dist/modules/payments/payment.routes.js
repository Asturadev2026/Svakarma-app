"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Create an EMI payment order (Razorpay-shaped).
router.post('/emi/order', auth_1.authMiddleware, (req, res, next) => payment_controller_1.paymentController.createOrder(req, res, next));
// Verify checkout result (orderId + paymentId + signature) and record the EMI.
router.post('/verify', auth_1.authMiddleware, (req, res, next) => payment_controller_1.paymentController.verify(req, res, next));
// DEV/DEMO ONLY: simulate a successful checkout for an order.
router.post('/mock/pay', auth_1.authMiddleware, (req, res, next) => payment_controller_1.paymentController.simulate(req, res, next));
// List the user's payments.
router.get('/', auth_1.authMiddleware, (req, res, next) => payment_controller_1.paymentController.list(req, res, next));
exports.default = router;
