# Loan Origination Journey — Build 1 (Product → Verification → AI Underwriting)

First slice of the digital loan journey from the reference app, built end-to-end
with mock providers (same mock→live pattern as SMS/payments).

## Flow

```
Loans tab → Product detail → Apply → Verification (7 data sources) → AI Underwriting → Offer
```

## What runs for real (vs mocked)

Real: amount/tenor clamping, EMI math (reducing balance), APR (IRR of cash flows
per RBI KFS), the underwriting rules engine (eligibility cap + risk-based pricing),
and the application/verification state machine.
Mocked: the external data pulls (PAN/Aadhaar/Udyam/GST/CIBIL/Bank-AA/Penny-drop)
return realistic structured data; the underwriter reads that data to decide.

## New backend endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/products` | Loan product catalog |
| GET | `/api/products/:key` | One product (samridhi, business, machinery, damini, suryakiran, wash) |
| POST | `/api/applications` | Start an application `{ productKey, amount, tenorMonths }` → seeds 7 verification sources |
| GET | `/api/applications` | List the user's applications |
| GET | `/api/applications/:id` | One application (+ verifications + offer) |
| POST | `/api/applications/:id/underwrite` | Run AI underwriting → `{ offer }` or `{ rejected, reason }` |
| GET | `/api/verification/sources?applicationId=` | The 7 sources + connected count |
| POST | `/api/verification/connect` | Connect (pull) one source `{ applicationId, sourceType }` |

## Underwriting rules (demo, deterministic)

- Reject if CIBIL < 600.
- Eligibility cap = min(40% of GST annual turnover, product ceiling); offer = min(requested, cap).
- Rate = product base rate + risk premium by CIBIL band (≥750: +0 · 700–749: +1.5 · 650–699: +3 · else +5), capped at the product max.
- EMI/APR computed from the priced offer; APR is the IRR of net-disbursal-vs-EMI cash flows incl. processing fee.

## New screens (mobile)

- `ProductDetailScreen` — amount stepper + tenor pills + live indicative EMI + Apply.
- `VerificationScreen` — 7 source rows, tap-to-connect or "Connect all", AI engine card, progress.
- `AIUnderwritingScreen` — animated decisioning that calls `/underwrite` and reveals the offer (amount, rate, EMI, APR) or a rejection.

Entry points wired: Loans tab → product cards and "Apply Now" → ProductDetail.

## Required before running

A new migration is needed (extends `LoanApplication`, adds `VerificationSource`):

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate     # needs DB access
npm run build && npm run dev
```

(Products are served from code, so no seeding required.)

## Build 2 — Offer → References → Disbursal → e-Sign → Disbursed → My Applications

The journey is now complete end-to-end (all mocked, same flip-to-live pattern).

### Flow
```
Offer → Accept → References (2 + optional guarantor) → Disbursal Account
(₹1 penny drop + NACH e-mandate) → Sign Agreement (KFS + Aadhaar e-Sign)
→ Disbursed (UTR + first EMI) → My Applications
```

### Added endpoints (all under `/api/applications/:id`)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/accept` | Accept the offer → stage `references` |
| POST | `/references` | Save 2 references (+ optional guarantor) → stage `bank` |
| POST | `/bank-account` | Save disbursal account (stores only last 4 digits) |
| POST | `/penny-drop` | Mock NPCI/Decentro ₹1 penny drop → confirms name match |
| POST | `/nach` | Mock NACH e-mandate setup → stage `esign` |
| GET | `/kfs` | Key Fact Statement summary (borrower, PAN, amount, rate, EMI, APR, cooling-off) |
| POST | `/esign` | Mock Aadhaar e-Sign **+ disburse**: creates the active Loan + Disbursement (UTR, first-EMI date) → stage `disbursed` |

### What runs for real vs mocked
Real: the stage state machine, reference validation, bank last-4 storage, EMI/loan
creation, UTR + first-EMI scheduling, and the new active Loan (so "Pay EMI" works
on it afterwards). Mocked: penny drop (name match), NACH mandate id, and the
Aadhaar e-Sign step.

### New DB models
`Reference`, `BankAccount` (last-4 only), `Disbursement`; plus `LoanApplication`
gains `esignStatus / signedAt / coolingOffEndsAt` and relations. Disbursement
creates a `Loan` row, tying the finished application to an active loan.

### New screens (mobile)
`ReferencesScreen`, `DisbursalAccountScreen`, `SignAgreementScreen`,
`DisbursedScreen`, `MyApplicationsScreen` (with resume-where-you-left-off).
Entry: AI offer "Accept & Continue" → References; Loans "My Status" → My Applications.

### Run note
This build adds tables — re-sync the schema before running:
```
npx prisma db push
```
(Then `npm run dev`. As before, prefer `db push` over `migrate dev` for this DB.)
