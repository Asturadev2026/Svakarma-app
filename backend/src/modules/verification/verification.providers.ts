import crypto from 'crypto';
import { SourceDef } from './sources';

/**
 * Mock verification provider.
 *
 * Returns realistic, structured data for each source — the same shape a real
 * KYC/bureau vendor (Karza, DigiLocker, Perfios, Experian, Finvu, Decentro)
 * would return. The underwriting engine reads this data, so the demo decision
 * is computed from "pulled" data exactly as it would be live.
 *
 * To go live, add a real provider keyed off env (e.g. VERIFICATION_PROVIDER)
 * implementing the same { referenceId, data } contract per source.
 */
export interface VerificationResult {
  referenceId: string;
  status: 'verified';
  data: Record<string, any>;
}

function refId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

export function getMockResult(def: SourceDef): VerificationResult {
  switch (def.type) {
    case 'PAN':
      return { referenceId: refId('pan'), status: 'verified',
        data: { name: 'Rajesh Kumar Mehta', pan: 'ABCDE1234F', panStatus: 'VALID', nameMatch: true } };
    case 'AADHAAR':
      return { referenceId: refId('akyc'), status: 'verified',
        data: { nameMatch: true, maskedAadhaar: 'XXXX XXXX 4527', address: 'Pune, Maharashtra', okyc: true } };
    case 'UDYAM':
      return { referenceId: refId('udyam'), status: 'verified',
        data: { udyam: 'UDYAM-MH-18-0034521', enterpriseType: 'Small', activity: 'Manufacturing', registered: true } };
    case 'GST':
      return { referenceId: refId('gst'), status: 'verified',
        data: { gstin: '27ABCDE1234F1Z5', filingStatus: 'Regular', annualTurnover: 6800000, avgMonthlySales: 566000, returnsFiled12m: 12 } };
    case 'CIBIL':
      return { referenceId: refId('cibil'), status: 'verified',
        data: { score: 742, band: 'EXCELLENT', enquiriesLast6m: 2, activeLoans: 1, overduesLast12m: 0 } };
    case 'BANK_AA':
      return { referenceId: refId('aa'), status: 'verified',
        data: { months: 12, avgMonthlyCredit: 540000, avgBalance: 210000, bouncesLast12m: 0, lender: 'HDFC Bank' } };
    case 'PENNY_DROP':
      return { referenceId: refId('pd'), status: 'verified',
        data: { accountName: 'Rajesh Kumar Mehta', nameMatch: true, bank: 'HDFC Bank', accountLast4: '2345' } };
    default:
      return { referenceId: refId('src'), status: 'verified', data: {} };
  }
}
