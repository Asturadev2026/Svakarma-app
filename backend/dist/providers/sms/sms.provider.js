"use strict";
/**
 * SMS provider abstraction.
 *
 * Every SMS/OTP integration implements this interface, so the rest of the app
 * never talks to Twilio (or any vendor) directly. Swapping the live provider in
 * is a one-line env change (SMS_PROVIDER=mock -> twilio) with no code changes
 * elsewhere. See ./index.ts for the factory.
 */
Object.defineProperty(exports, "__esModule", { value: true });
