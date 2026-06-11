"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentProvider = getPaymentProvider;
const mock_razorpay_provider_1 = require("./mock.razorpay.provider");
const razorpay_provider_1 = require("./razorpay.provider");
__exportStar(require("./payment.provider"), exports);
let instance = null;
/**
 * Returns the configured payment provider (singleton).
 * Driven by env PAYMENT_PROVIDER: 'mock' (default) | 'razorpay'.
 */
function getPaymentProvider() {
    if (instance)
        return instance;
    const choice = (process.env.PAYMENT_PROVIDER || 'mock').toLowerCase();
    instance = choice === 'razorpay' ? new razorpay_provider_1.RazorpayProvider() : new mock_razorpay_provider_1.MockRazorpayProvider();
    // eslint-disable-next-line no-console
    console.log(`[PAY] provider = ${instance.name}`);
    return instance;
}
