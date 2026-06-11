/**
 * EMI / amortization helpers shared across the loan journey.
 * Reducing-balance EMI: P*r*(1+r)^n / ((1+r)^n - 1), r = monthly rate.
 */
export interface EmiBreakup {
  emi: number;            // monthly EMI (rounded)
  totalInterest: number;  // rounded
  totalPayable: number;   // rounded
  apr: number;            // effective annual %, incl. processing fee (1 dp)
}

export function computeEmi(
  amount: number,
  annualRatePct: number,
  tenorMonths: number,
  processingFeePct = 0
): EmiBreakup {
  const p = Number(amount);
  const n = Number(tenorMonths);
  const r = Number(annualRatePct) / 12 / 100;

  const emiRaw = r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const emi = Math.round(emiRaw);
  const totalPayable = Math.round(emi * n);
  const totalInterest = Math.round(totalPayable - p);

  // APR per RBI Key Fact Statement: the IRR of actual cash flows (net disbursal
  // after the one-time processing fee, minus the EMI stream), annualized.
  const apr = computeApr(p, emi, n, processingFeePct);

  return { emi, totalInterest, totalPayable, apr };
}

/** Effective annual APR via IRR of the cash flows (bisection on monthly rate). */
export function computeApr(principal: number, emi: number, n: number, feePct = 0): number {
  if (principal <= 0 || n <= 0) return 0;
  const net = principal - (principal * feePct) / 100;
  const npv = (i: number) => {
    let s = -net;
    for (let k = 1; k <= n; k++) s += emi / Math.pow(1 + i, k);
    return s;
  };
  let lo = 0, hi = 1; // monthly rate bounds
  for (let it = 0; it < 200; it++) {
    const mid = (lo + hi) / 2;
    if (npv(mid) > 0) lo = mid; else hi = mid;
  }
  const monthly = (lo + hi) / 2;
  return Math.round((Math.pow(1 + monthly, 12) - 1) * 1000) / 10; // effective annual %, 1 dp
}
