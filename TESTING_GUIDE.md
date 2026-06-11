# Svakarma — Manual Testing Guide

How to run the app and verify everything built so far:
**(1) OTP/SMS mock · (2) Profile completion + KYC fixes · (3) Document-upload hydration · (4) EMI payments (Razorpay mock) · (5) the loan-origination journey: Product → Verification → AI Underwriting.**

Everything external (SMS, payments, KYC data sources) runs in **mock mode** by default — no accounts or API keys needed.

---

## 0. One-time setup

### Backend
```powershell
cd backend
npm install
# .env must have DATABASE_URL + JWT_SECRET. Providers default to mock.
npm run dev
```
Expected console lines on first request: `[SMS] provider = mock`, `[PAY] provider = mock`.

Health check — open in a browser:
```
http://localhost:5000/health
```
Expect `{"status":"ok","database":"connected", ...}`. If `disconnected`, your DB isn't reachable (re-check the Neon push step).

### Mobile (the one gotcha — set the API URL)
The app talks to the backend over your network. The base URL is **hardcoded in two files** and must point at your backend:

- `myapp/services/api.js`  → `DEV_LAN_IP`
- `myapp/services/documentService.js` → `DEV_LAN_IP` (must match)

Set it based on where you run the app:

| Running on | Set `DEV_LAN_IP` to |
|------------|---------------------|
| Physical phone (Expo Go, QR) | your PC's LAN IP, e.g. `192.168.1.5` (run `ipconfig` → IPv4 Address) |
| Android emulator | `10.0.2.2` |
| iOS simulator | `127.0.0.1` |

Then:
```powershell
cd myapp
npm install
npx expo start
```
Press `a` (Android), `i` (iOS), or scan the QR in Expo Go. Phone and PC must be on the **same Wi-Fi**, and your firewall must allow port 5000.

---

## 1. Auth / OTP — mock SMS provider

1. Splash → **Get Started** → Login.
2. Enter a 10-digit number and tap **Send OTP**.
3. **What to verify:** the OTP screen shows an orange **"DEMO MODE · mock SMS provider"** banner with the code, and the field is **auto-filled**. (Numbers starting `999999` or `9908889635`/`7984876749` always get `123456`; any other number gets a random 6-digit code, shown in the banner.)
4. Backend console shows a line like `[SMS:mock] -> 98765xxxxx | sid=SM_mock_... | body="Your Svakarma verification code is ..."`.
5. Tap **Verify & Proceed** → new number → onboarding; returning number → Permissions/Home.
6. **Negative test:** clear the field, type a wrong 6-digit code → "Invalid OTP code." **Resend OTP** → banner refreshes with a new code.

> This proves the OTP is generated, stored with a 10-minute expiry, and verified for real — only the SMS "send" is mocked.

---

## 2. Permissions → Onboarding

1. Toggle the permissions, tap **Continue**.
2. **Select business type** → **Business details** form: fill business name (required), turnover, city, state, etc. → **Save**.

---

## 3. Document upload + the hydration fix

1. After business details → **Upload Documents**. Pick a file for **PAN Card** and **Aadhaar Card** → **Upload** → status turns **"Uploaded ✓"**.
2. **The fix to verify:** leave the screen, then reopen it (Profile tab → **KYC documents** card). On entry you'll briefly see **"Checking your documents…"**, then your previously-uploaded docs show **"Uploaded ✓"** again.
   - *Before the fix this screen reset everything to "Not Uploaded" every time.*

---

## 4. Profile completion + KYC status — the main fix

Go to the **Profile** tab.

1. **Completion %** now reflects all **six** sections (Personal, Business info, Financial, Address, KYC documents, **References**) — it is no longer stuck at 0%. (Each section is ~16.7%.)
2. **Step-by-step proof** (do these and watch the % climb ~20% each):
   - Brand-new user → ~**0%**.
   - Set your name (Personal details) → **+20%**.
   - Save business name + type → **+20%**.
   - Add annual turnover → **+20%**.
   - Add city + state → **+20%**.
   - Upload PAN **and** Aadhaar → KYC section completes → up to **100%**.
3. Each section card shows the correct **green check** vs **COMPLETE** badge from real data.
4. **KYC documents** card subtitle reads **"2 uploaded"** / **"Verified"** / **"Not uploaded"** — reflecting what you actually uploaded (not a flag that was never set).
5. **Refetch-on-focus:** edit something on another screen, come back to Profile — it updates without restarting the app.
6. **Quick info** block shows PAN, Aadhaar (masked), Udyam, GSTIN, Email, Mobile.
7. **Edit round-trip:** tap **Financial profile** or **Address proof** → the business-details screen now **preloads your saved data** and remembers your business type (previously it opened blank and couldn't save).
8. **References section (new):** tap **References** → add 2 people (name, 10-digit mobile, relationship) → **Save**. Back on Profile the section flips to complete ("2 saved") and the % rises.
9. **Email (new):** tap **Personal details** → there's now an **Email** field. Enter one → Save. It appears in the **Quick info** block and persists.

> Note: this build adds the `email` column and a `UserReference` table — run `npx prisma db push` before testing.

---

## 5. EMI payment — Razorpay mock

1. **Loans** tab → **"Pay your EMI"** button.
2. A Razorpay-style checkout sheet appears with a **"DEMO MODE"** note, order ID, and amount. (If you have no active loan, the backend auto-creates a demo loan in non-prod, so this always works.)
3. Tap **Pay ₹…** → it simulates a signed gateway payment, verifies the signature, and shows **"Payment successful"** with the next EMI date.
4. Backend console: `[PAY:mock] order created order_...` then `[PAY:mock] simulated success ...`.

> The signature is real HMAC-SHA256 — the mock just supplies it the way live Razorpay would, so the verification path is exactly what runs in production.

---

## 6. Loan-origination journey — Product → Verification → AI Underwriting (newest build)

1. **Loans** tab → tap a product card (e.g. **Samridhi Loan**) — or the **Apply Now** quick card.
2. **Product detail:** use the **− / +** stepper to change the amount and the **tenor pills** (12/24/36…). The **Indicative EMI** updates live. Tap **Apply Now**.
3. **Verification:** you'll see the **7 data sources** with their provider names (PAN — NSDL via Karza, Aadhaar — DigiLocker, Udyam, GST — Perfios, CIBIL + Experian, Bank — Finvu AA, Penny Drop — Decentro).
   - Tap a single row to connect it, **or** tap **"Connect 7 sources"** to run them progressively. Watch the counter go to **7 of 7 connected**.
   - Then tap **Continue to assessment →**.
4. **AI Underwriting:** the "Building your offer" steps animate, then it reveals **OFFER APPROVED** with amount, rate, EMI and APR.
   - **Sanity-check the decision** (mock data: CIBIL 742, GST turnover ₹68L):
     - Offered amount ≤ what you requested, capped at 40% of turnover (₹27.2L → product ceiling ₹25L).
     - Rate **25.5%** = product base 24% + 1.5% premium for the 742 CIBIL band.
     - EMI and APR are computed from that priced offer.
5. **Accept & Continue** → continues into the rest of the journey (below).

### 6b. References → Disbursal → e-Sign → Disbursed → My Applications
6. **References:** enter 2 references (name + 10-digit mobile, pick a relationship pill). Optionally tick **Add a guarantor**. **Continue**.
7. **Disbursal Account:** type any account number + IFSC → **Verify with ₹1 Penny Drop** → it shows a green **name-matched** card (mock). → **Proceed to Sign** (sets up the NACH mandate).
8. **Sign Agreement:** review the **KFS card** (borrower, PAN, amount, rate, EMI, APR, 3-day cooling-off — all from your real offer). **Download KFS** shows a mocked toast. Tap **e-Sign with Aadhaar**.
9. **Disbursed:** success screen with the **amount**, an **account ending / UTR**, and the **first EMI** date + amount. **Back to Home**, or **View my applications**.
10. **My Applications** (Loans tab → **My Status**): your application now shows **Disbursed**. In-progress applications show their stage with a **Resume ›** that jumps you back to the right step.
11. **Tie-back:** after disbursal a real active loan exists — go to **Loans → Pay your EMI** and it now pays against that loan.

---

## 7. Existing screens — quick smoke test
- **EMI Calculator** tab → enter amount/rate/tenor → EMI computes.
- **CIBIL**, **Refer & Earn** → open, content loads.

---

## 8. Optional: test the backend directly (no app)

Use `curl.exe` (PowerShell users: prefix with `curl.exe`, not `curl`). Get a token first, then reuse it.

```powershell
# 1. Send OTP (mock returns the code as devOtp)
curl.exe -s -X POST http://localhost:5000/api/auth/send-otp -H "Content-Type: application/json" -d "{\"phone\":\"9999999999\"}"

# 2. Verify → returns { token, user }
curl.exe -s -X POST http://localhost:5000/api/auth/verify-otp -H "Content-Type: application/json" -d "{\"phone\":\"9999999999\",\"otp\":\"123456\"}"

# Set the token (paste from step 2)
$T = "PASTE_TOKEN_HERE"

# 3. Products
curl.exe -s http://localhost:5000/api/products

# 4. Start an application
curl.exe -s -X POST http://localhost:5000/api/applications -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d "{\"productKey\":\"samridhi\",\"amount\":1500000,\"tenorMonths\":24}"

# 5. List verification sources (use the application id from step 4)
curl.exe -s "http://localhost:5000/api/verification/sources?applicationId=APP_ID" -H "Authorization: Bearer $T"

# 6. Connect a source (repeat for each type: PAN, AADHAAR, UDYAM, GST, CIBIL, BANK_AA, PENNY_DROP)
curl.exe -s -X POST http://localhost:5000/api/verification/connect -H "Authorization: Bearer $T" -H "Content-Type: application/json" -d "{\"applicationId\":\"APP_ID\",\"sourceType\":\"PAN\"}"

# 7. Underwrite → returns the offer
curl.exe -s -X POST http://localhost:5000/api/applications/APP_ID/underwrite -H "Authorization: Bearer $T"
```

---

## 9. Home parity + Help & Support (parity build)

No new schema this build (uses existing tables — make sure the previous `db push` ran).

1. **Home dashboard** (Home tab) is now data-driven:
   - **Greeting** shows your real name/business/location.
   - **Pre-approved offer card** shows a real eligible amount — 40% of your GST/annual turnover (clamped ₹2L–₹25L), or ₹8,50,000 if turnover is unknown. Tapping it ("Tap to claim · Zero docs") starts the journey at the Product screen.
   - **Quick actions (8)** all navigate: Apply → Product, Free CIBIL → CIBIL, EMI Calc, Status → My Applications, Refer, Profile, **Pay EMI → payment**, **Help → Help & Support**.
   - **Active loan card** (after you've disbursed one) shows outstanding, next EMI, due date, **"X of Y EMIs paid" with a progress bar**, and **Pay Now → payment**. Pay an EMI, return to Home — the paid count goes up.
2. **Help & Support** (Home → Help): three tabs — **Help** (searchable FAQ + popular topics), **Raise Issue** (category + description → mock submit), **Contact** (tap to call/email/WhatsApp). Try searching "documents" to filter the FAQ.

## Known limitations (expected — not bugs)
- The full origination journey (Apply → Verify → Underwrite → References → Bank → e-Sign → Disbursed) is built; everything external is **mocked** by design.
- SMS, payments, the 7 KYC data sources, penny-drop, NACH and Aadhaar e-Sign are all **mocked** (flip-to-live pattern documented in `backend/ORIGINATION_JOURNEY.md`).
- **New tables were added** — run `npx prisma db push` before testing this build.
- The Home screen does not yet have all reference features (pre-approved offer card, news, stats).
- The mobile API URL is hardcoded — see setup §0.

## Troubleshooting
- **"Network error / can't connect":** `DEV_LAN_IP` doesn't match your PC IP, backend not running, different Wi-Fi, or firewall blocking port 5000. Android emulator must use `10.0.2.2`.
- **401 / 403:** token missing/expired — log in again.
- **DB errors on the backend:** confirm `npx prisma db push` succeeded and the `uuid-ossp` extension exists.
- **Profile shows old values:** it refetches on focus — fully leave and re-open the Profile tab.
