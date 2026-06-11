"use strict";
/**
 * Payment provider abstraction (Razorpay-shaped).
 *
 * The app talks only to this interface, never to Razorpay directly. The mock
 * and live providers are interchangeable; switching is a one-line env change
 * (PAYMENT_PROVIDER=mock -> razorpay). See ./index.ts for the factory.
 *
 * Amounts follow the Razorpay convention: the smallest currency unit (paise).
 * ₹1,000 => amount = 100000.
 */
Object.defineProperty(exports, "__esModule", { value: true });
