# Payments & SMS Integrations (Mock → Live)

Both integrations are built **production-shaped behind a provider interface**. The
demo and the live system run the **same code path** — switching is a one-line env
change plus installing the vendor SDK. No business logic changes.

| Integration | Mock (default) | Live | Env switch |
|-------------|----------------|------|------------|
| SMS / OTP | OTP generated + verified for real; no SMS sent; code returned to client for demo | Real SMS via Twilio | `SMS_PROVIDER=mock → twilio` |
| Payments | Razorpay-shaped orders; payments simulated; **signatures are real HMAC-SHA256** | Real Razorpay checkout + webhooks | `PAYMENT_PROVIDER=mock → razorpay` |

The key design point: only the **network call** is faked. OTP generation/expiry,
payment signature verification, the webhook signature check, and the EMI schedule
update all run for real in mock mode — so going live exercises identical code.

---

## Architecture

```
src/providers/
  sms/
    sms.provider.ts          # interface
    mock.sms.provider.ts     # demo: logs + returns Twilio-shaped result
    twilio.sms.provider.ts   # live: lazy-requires `twilio`
    index.ts                 # getSmsProvider() reads SMS_PROVIDER
  payments/
    payment.provider.ts      # interface
    signature.ts             # shared HMAC-SHA256 (mock AND live use this)
    mock.razorpay.provider.ts# demo: in-memory orders, real signatures
    razorpay.provider.ts     # live: lazy-requires `razorpay`
    index.ts                 # getPaymentProvider() reads PAYMENT_PROVIDER

src/modules/auth/auth.service.ts       # sendOtp() now uses the SMS provider
src/modules/payments/                  # order / verify / webhook / mock-pay
```

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/auth/send-otp` | – | Sends OTP (returns `devOtp` only in mock + non-prod) |
| POST | `/api/payments/emi/order` | Bearer | Create an EMI order |
| POST | `/api/payments/mock/pay` | Bearer | **Dev only** — simulate a signed successful checkout |
| POST | `/api/payments/verify` | Bearer | Verify signature → mark EMI paid → advance schedule |
| POST | `/api/payments/webhook` | signature | Razorpay-style webhook (raw-body HMAC verified) |
| GET | `/api/payments` | Bearer | List the user's payments |

## Demo flow (mobile)

1. **OTP** — Login → the OTP screen shows the code (from the mock provider) and
   auto-fills it. Tap *Verify*.
2. **EMI** — Loans tab → *Pay your EMI* → a Razorpay-style checkout. *Pay* calls
   `mock/pay` to get a `{ paymentId, signature }`, then `verify` validates the
   signature and records the EMI.

## First-time setup

```bash
cd backend
cp .env.example .env            # fill DATABASE_URL + JWT_SECRET
npm install
npm run prisma:generate         # regenerates client incl. the new Payment model
npm run prisma:migrate          # creates the Payment table  (needs DB access)
npm run dev
```

> Note: a new `Payment` model was added to `prisma/schema.prisma`. Run
> `prisma:migrate` once to create the table. (This couldn't be run in the build
> sandbox because Prisma engine downloads and the DB were unavailable there.)

## Going live — SMS (Twilio)

```bash
npm install twilio
# .env:
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_FROM_NUMBER=+1xxxxxxxxxx
```
No code change. `getSmsProvider()` returns the Twilio provider; OTP is no longer
returned to the client.

## Going live — Payments (Razorpay)

```bash
npm install razorpay
# .env (test keys work too — same code path):
PAYMENT_PROVIDER=razorpay
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx
```
Then in the mobile checkout (`EMIPaymentScreen.js`), wire the real Razorpay
checkout SDK (e.g. `react-native-razorpay`) at the marked `else` branch using
`meta.keyId` + `order.id`; it returns `razorpay_payment_id` + `razorpay_signature`,
which flow into the **unchanged** `/payments/verify`. Point the Razorpay webhook
at `/api/payments/webhook`.

## Security notes addressed here

- OTP is no longer printed to the client/log in production; the `123456` shortcut
  is disabled when `NODE_ENV=production`.
- Payment confirmation runs inside a DB transaction with an idempotency guard, so
  duplicate/concurrent confirmations cannot double-apply an EMI.
- Webhook uses the raw request body for signature verification (registered before
  the JSON body parser).
