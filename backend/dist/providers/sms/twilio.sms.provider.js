"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioSmsProvider = void 0;
const errors_1 = require("../../shared/errors");
/**
 * Live Twilio SMS provider.
 *
 * This is the real integration, ready to activate. It is intentionally NOT
 * imported at the top of the module — the `twilio` package is loaded lazily so
 * the backend builds and runs in mock mode without the dependency installed.
 *
 * To go live:
 *   1. npm install twilio
 *   2. set SMS_PROVIDER=twilio
 *   3. set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
 *
 * No other code changes are required — the factory in ./index.ts will return
 * this provider and AuthService keeps calling the same sendOtp().
 */
class TwilioSmsProvider {
    name = 'twilio';
    client;
    from;
    constructor() {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;
        this.from = process.env.TWILIO_FROM_NUMBER || '';
        if (!sid || !token || !this.from) {
            throw new errors_1.AppError(500, 'Twilio is selected (SMS_PROVIDER=twilio) but TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_FROM_NUMBER is missing.');
        }
        let twilio;
        try {
            // Lazy require so the dependency is only needed when actually using Twilio.
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            twilio = require('twilio');
        }
        catch {
            throw new errors_1.AppError(500, 'Twilio package not installed. Run: npm install twilio');
        }
        this.client = twilio(sid, token);
    }
    /** Normalise a 10-digit Indian number to E.164; pass through if already +. */
    toE164(to) {
        if (to.startsWith('+'))
            return to;
        return `+91${to}`;
    }
    async sendSms(to, body) {
        const msg = await this.client.messages.create({
            to: this.toE164(to),
            from: this.from,
            body,
        });
        return { messageSid: msg.sid, status: msg.status, provider: 'twilio' };
    }
    async sendOtp(to, code) {
        return this.sendSms(to, `Your Svakarma verification code is ${code}. Valid for 10 minutes.`);
    }
}
exports.TwilioSmsProvider = TwilioSmsProvider;
