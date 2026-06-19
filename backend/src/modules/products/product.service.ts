import { AppError } from '../../shared/errors';

/**
 * Loan product catalog (served from code — no DB seeding).
 * Amounts in ₹, rates in annual %, tenor in months.
 *
 * Each product carries:
 *  - display fields (icon/color/accent/badge) for the Loans list, and
 *  - a `formFields` spec that drives a product-SPECIFIC application form on the
 *    client (rendered dynamically), so every loan collects the right details.
 */
export type FormFieldType = 'text' | 'number' | 'select';

export interface FormField {
  key: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];   // for type === 'select'
}

export interface LoanProduct {
  key: string;
  name: string;
  tagline: string;
  category: string;
  // display
  icon: string;
  color: string;        // card background
  accent: string;       // accent colour
  badge?: string;
  // terms
  minAmount: number;
  maxAmount: number;
  defaultAmount: number;
  minRate: number;
  maxRate: number;
  minTenor: number;
  maxTenor: number;
  tenorOptions: number[];
  defaultTenor: number;
  processingFeePct: number;
  highlights: string[];
  // product-specific application form
  formFields: FormField[];
}

const YEARS = { key: 'yearsInBusiness', label: 'Years in business', type: 'number' as const, placeholder: 'e.g. 4', required: true };
const REVENUE = { key: 'monthlyRevenue', label: 'Average monthly revenue (₹)', type: 'number' as const, placeholder: 'e.g. 500000', required: true };

export const PRODUCTS: LoanProduct[] = [
  {
    key: 'samridhi', name: 'Samridhi Loan',
    tagline: 'GST-based · Straight-through process using your GST returns',
    category: 'Working Capital', icon: '⚡', color: '#FFF7ED', accent: '#EA580C', badge: 'STP',
    minAmount: 500000, maxAmount: 2500000, defaultAmount: 1500000,
    minRate: 24, maxRate: 30, minTenor: 12, maxTenor: 60, tenorOptions: [12, 24, 36, 48, 60], defaultTenor: 24, processingFeePct: 3,
    highlights: ['Uses GST returns to unlock capital', 'Straight-through process', 'Minimal documents'],
    formFields: [
      { key: 'gstin', label: 'GSTIN', type: 'text', placeholder: '27ABCDE1234F1Z5', required: true },
      { key: 'monthlyGstSales', label: 'Avg monthly GST sales (₹)', type: 'number', placeholder: 'e.g. 600000', required: true },
      { key: 'purpose', label: 'Purpose of loan', type: 'select', options: ['Inventory purchase', 'Raw material', 'Working capital', 'Other'], required: true },
      YEARS,
    ],
  },
  {
    key: 'business', name: 'Business Loan',
    tagline: 'Working capital to fund daily operations & inventory',
    category: 'Working Capital', icon: '💼', color: '#EEF2FF', accent: '#4F46E5',
    minAmount: 200000, maxAmount: 2500000, defaultAmount: 1000000,
    minRate: 24, maxRate: 30, minTenor: 12, maxTenor: 36, tenorOptions: [12, 24, 36], defaultTenor: 24, processingFeePct: 2,
    highlights: ['Collateral-free', 'Disbursed within 48 hours', 'Flexible tenure'],
    formFields: [
      { key: 'purpose', label: 'Purpose of loan', type: 'select', options: ['Inventory', 'Marketing', 'Hiring', 'Working capital', 'Other'], required: true },
      REVENUE,
      YEARS,
    ],
  },
  {
    key: 'machinery', name: 'Machinery & Asset',
    tagline: 'Finance new or used machinery, paid directly to vendors',
    category: 'Asset Finance', icon: '⚙️', color: '#ECFDF5', accent: '#059669',
    minAmount: 500000, maxAmount: 2500000, defaultAmount: 1200000,
    minRate: 24, maxRate: 30, minTenor: 12, maxTenor: 60, tenorOptions: [12, 24, 36, 48, 60], defaultTenor: 36, processingFeePct: 2,
    highlights: ['Vendor-direct disbursal', 'Up to 5 year tenure', 'New & used assets'],
    formFields: [
      { key: 'machineType', label: 'Machine / asset type', type: 'text', placeholder: 'e.g. CNC lathe', required: true },
      { key: 'vendorName', label: 'Vendor / supplier name', type: 'text', placeholder: 'e.g. Bharat Machines', required: true },
      { key: 'assetCost', label: 'Total asset cost (₹)', type: 'number', placeholder: 'e.g. 1800000', required: true },
      { key: 'condition', label: 'Asset condition', type: 'select', options: ['New', 'Used'], required: true },
    ],
  },
  {
    key: 'damini', name: 'Damini Loan',
    tagline: 'For women entrepreneurs · 1% lower rate, discounted fees',
    category: 'Women Entrepreneurs', icon: '🌸', color: '#FDF2F8', accent: '#DB2777', badge: 'DISCOUNT',
    minAmount: 300000, maxAmount: 2500000, defaultAmount: 800000,
    minRate: 23, maxRate: 29, minTenor: 12, maxTenor: 48, tenorOptions: [12, 24, 36, 48], defaultTenor: 24, processingFeePct: 1.5,
    highlights: ['1% lower interest rate', 'Discounted processing fee', 'Priority processing'],
    formFields: [
      { key: 'ownerName', label: 'Woman owner / promoter name', type: 'text', placeholder: 'Full name', required: true },
      { key: 'womenOwnershipPct', label: 'Women ownership (%)', type: 'number', placeholder: 'e.g. 51', required: true },
      { key: 'purpose', label: 'Purpose of loan', type: 'select', options: ['Inventory', 'Equipment', 'Working capital', 'Expansion', 'Other'], required: true },
      REVENUE,
    ],
  },
  {
    key: 'suryakiran', name: 'SuryaKiran Loan',
    tagline: 'Solar rooftop financing for industrial units',
    category: 'Green Finance', icon: '☀️', color: '#FEFCE8', accent: '#CA8A04',
    minAmount: 200000, maxAmount: 2500000, defaultAmount: 900000,
    minRate: 24, maxRate: 28, minTenor: 12, maxTenor: 60, tenorOptions: [12, 24, 36, 48, 60], defaultTenor: 36, processingFeePct: 2,
    highlights: ['Sustainable power', 'Long tenure', 'Lower rate band'],
    formFields: [
      { key: 'rooftopAreaSqft', label: 'Rooftop area (sq ft)', type: 'number', placeholder: 'e.g. 3000', required: true },
      { key: 'sanctionedLoadKw', label: 'Sanctioned load (kW)', type: 'number', placeholder: 'e.g. 50', required: true },
      { key: 'monthlyBill', label: 'Avg monthly electricity bill (₹)', type: 'number', placeholder: 'e.g. 80000', required: true },
      { key: 'installer', label: 'Preferred solar installer', type: 'text', placeholder: 'e.g. SunPro Energy', required: false },
    ],
  },
  {
    key: 'wash', name: 'WASH Loan',
    tagline: 'Water & sanitation financing for retailers',
    category: 'Impact', icon: '💧', color: '#F0FDF4', accent: '#16A34A',
    minAmount: 200000, maxAmount: 1500000, defaultAmount: 500000,
    minRate: 24, maxRate: 30, minTenor: 12, maxTenor: 36, tenorOptions: [12, 24, 36], defaultTenor: 24, processingFeePct: 2,
    highlights: ['For sanitation retailers', 'Quick approval', 'Collateral-free'],
    formFields: [
      { key: 'role', label: 'Your role', type: 'select', options: ['Retailer', 'Distributor', 'Installer'], required: true },
      { key: 'productCategory', label: 'Product category', type: 'select', options: ['Water purifier', 'Toilet / sanitation', 'Water tanks', 'Other'], required: true },
      REVENUE,
    ],
  },
  {
    key: 'invoice', name: 'Invoice Discounting',
    tagline: 'Unlock cash tied up in unpaid invoices',
    category: 'Receivables', icon: '🧾', color: '#EFF6FF', accent: '#2563EB', badge: 'NEW',
    minAmount: 100000, maxAmount: 2000000, defaultAmount: 500000,
    minRate: 18, maxRate: 26, minTenor: 1, maxTenor: 6, tenorOptions: [1, 2, 3, 6], defaultTenor: 3, processingFeePct: 1,
    highlights: ['Funds against unpaid invoices', 'Short tenure', 'Lower rate band'],
    formFields: [
      { key: 'buyerName', label: 'Buyer / debtor name', type: 'text', placeholder: 'Company that owes you', required: true },
      { key: 'invoiceAmount', label: 'Invoice amount (₹)', type: 'number', placeholder: 'e.g. 700000', required: true },
      { key: 'invoiceDueDays', label: 'Days until invoice is due', type: 'number', placeholder: 'e.g. 45', required: true },
      { key: 'gstin', label: 'Your GSTIN', type: 'text', placeholder: '27ABCDE1234F1Z5', required: false },
    ],
  },
  {
    key: 'dukandar', name: 'Dukandar Loan',
    tagline: 'Working capital for retail shops & kiranas',
    category: 'Retail', icon: '🏪', color: '#FFF1F2', accent: '#E11D48',
    minAmount: 100000, maxAmount: 1000000, defaultAmount: 300000,
    minRate: 26, maxRate: 32, minTenor: 6, maxTenor: 24, tenorOptions: [6, 12, 18, 24], defaultTenor: 12, processingFeePct: 2,
    highlights: ['For shopkeepers', 'Small-ticket', 'Fast approval'],
    formFields: [
      { key: 'shopType', label: 'Shop type', type: 'select', options: ['Kirana / grocery', 'Pharmacy', 'Apparel', 'Electronics', 'Restaurant', 'Other'], required: true },
      { key: 'dailySales', label: 'Average daily sales (₹)', type: 'number', placeholder: 'e.g. 15000', required: true },
      { key: 'shopOwnership', label: 'Shop premises', type: 'select', options: ['Owned', 'Rented'], required: true },
    ],
  },
  {
    key: 'export', name: 'Export Finance',
    tagline: 'Pre & post-shipment finance for exporters',
    category: 'Trade', icon: '🚢', color: '#ECFEFF', accent: '#0891B2', badge: 'NEW',
    minAmount: 500000, maxAmount: 2500000, defaultAmount: 1500000,
    minRate: 20, maxRate: 28, minTenor: 3, maxTenor: 24, tenorOptions: [3, 6, 12, 24], defaultTenor: 12, processingFeePct: 1.5,
    highlights: ['Pre & post-shipment', 'Competitive rates', 'For IEC holders'],
    formFields: [
      { key: 'exportMarket', label: 'Primary export market', type: 'text', placeholder: 'e.g. UAE, USA', required: true },
      { key: 'annualExportTurnover', label: 'Annual export turnover (₹)', type: 'number', placeholder: 'e.g. 12000000', required: true },
      { key: 'iecCode', label: 'IEC code', type: 'text', placeholder: '10-digit IEC', required: true },
    ],
  },
  {
    key: 'term', name: 'Term / Expansion Loan',
    tagline: 'Fund a new branch, renovation or big equipment',
    category: 'Growth', icon: '📈', color: '#F5F3FF', accent: '#7C3AED',
    minAmount: 500000, maxAmount: 2500000, defaultAmount: 1500000,
    minRate: 22, maxRate: 30, minTenor: 12, maxTenor: 60, tenorOptions: [12, 24, 36, 48, 60], defaultTenor: 36, processingFeePct: 2,
    highlights: ['Larger tickets', 'Longer tenure', 'For expansion'],
    formFields: [
      { key: 'purpose', label: 'Use of funds', type: 'select', options: ['New branch / outlet', 'Equipment', 'Renovation', 'Capacity expansion', 'Other'], required: true },
      { key: 'projectCost', label: 'Total project cost (₹)', type: 'number', placeholder: 'e.g. 3000000', required: true },
      { key: 'existingLoans', label: 'Any existing business loans?', type: 'select', options: ['No', 'Yes'], required: true },
      YEARS,
    ],
  },
];

export class ProductService {
  getAll(): LoanProduct[] {
    return PRODUCTS;
  }
  getByKey(key: string): LoanProduct {
    const product = PRODUCTS.find((p) => p.key === key);
    if (!product) throw new AppError(404, `Loan product "${key}" not found.`);
    return product;
  }
}

export const productService = new ProductService();
