"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockSmsProvider = void 0;
/**
 * Mock SMS provider.
 *
 * Mimics the shape and lifecycle of a real provider (Twilio) without sending an
 * actual SMS. The OTP itself is generated and verified for real by AuthService;
 * this class only stands in for the network "send". It logs the message and
 * returns a Twilio-style result so the calling code path is identical to live.
 *
 * The OTP is surfaced back to the client (for the demo) by AuthService, NOT here
 * — and only when running in mock mode outside production.
 */
class MockSmsProvider {
    name = 'mock';
    newSid() {
        return 'SM_mock_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    }
    async sendSms(to, body) {
        const sid = this.newSid();
        // eslint-disable-next-line no-console
        console.log(`[SMS:mock] -> ${to} | sid=${sid} | body="${body}"`);
        return { messageSid: sid, status: 'queued', provider: 'mock' };
    }
    async sendOtp(to, code) {
        return this.sendSms(to, `Your Svakarma verification code is ${code}. Valid for 10 minutes.`);
    }
}
exports.MockSmsProvider = MockSmsProvider;
