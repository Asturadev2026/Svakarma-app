// The 7 data sources the AI verification step connects, in display order.
// `provider` is the demo provider; `providerLabel` is what the UI shows
// (matching the reference app's wording).
export interface SourceDef {
  type: 'PAN' | 'AADHAAR' | 'UDYAM' | 'GST' | 'CIBIL' | 'BANK_AA' | 'PENNY_DROP';
  label: string;
  provider: string;       // demo provider key
  providerLabel: string;  // shown in UI
  required: boolean;
}

export const SOURCE_DEFS: SourceDef[] = [
  { type: 'PAN',        label: 'PAN Verification',       provider: 'mock', providerLabel: 'NSDL via Karza API',          required: true },
  { type: 'AADHAAR',    label: 'Aadhaar OKYC',           provider: 'mock', providerLabel: 'UIDAI via DigiLocker',        required: true },
  { type: 'UDYAM',      label: 'Udyam / MSME',           provider: 'mock', providerLabel: 'Udyam Portal API',            required: true },
  { type: 'GST',        label: 'GST Returns Pull',       provider: 'mock', providerLabel: 'GSTN via Perfios',            required: true },
  { type: 'CIBIL',      label: 'CIBIL & Bureau',         provider: 'mock', providerLabel: 'CIBIL + Experian',            required: true },
  { type: 'BANK_AA',    label: 'Bank Statement (12 mo)', provider: 'mock', providerLabel: 'Account Aggregator (Finvu)',  required: true },
  { type: 'PENNY_DROP', label: 'Penny Drop Verify',      provider: 'mock', providerLabel: 'NPCI via Decentro',           required: true },
];

export const SOURCE_TYPES = SOURCE_DEFS.map((s) => s.type);
