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
exports.getSmsProvider = getSmsProvider;
exports.isMockSms = isMockSms;
const mock_sms_provider_1 = require("./mock.sms.provider");
const twilio_sms_provider_1 = require("./twilio.sms.provider");
__exportStar(require("./sms.provider"), exports);
let instance = null;
/**
 * Returns the configured SMS provider (singleton).
 * Driven by env SMS_PROVIDER: 'mock' (default) | 'twilio'.
 */
function getSmsProvider() {
    if (instance)
        return instance;
    const choice = (process.env.SMS_PROVIDER || 'mock').toLowerCase();
    instance = choice === 'twilio' ? new twilio_sms_provider_1.TwilioSmsProvider() : new mock_sms_provider_1.MockSmsProvider();
    // eslint-disable-next-line no-console
    console.log(`[SMS] provider = ${instance.name}`);
    return instance;
}
/** True when running the mock provider (used to decide whether to expose the demo OTP). */
function isMockSms() {
    return (process.env.SMS_PROVIDER || 'mock').toLowerCase() !== 'twilio';
}
