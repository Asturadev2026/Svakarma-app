import { AppError } from '../../shared/errors';

/**
 * Loan product catalog. Served from code (no DB) so the demo works with zero
 * seeding. Amounts in ₹, rates in annual %, tenor in months.
 */
export interface LoanProduct {
  key: string;
  name: string;
  tagline: string;
  category: string;
  minAmount: number;
  maxAmount: number;
  defaultAmount: number;
  minRate: number;
  maxRate: number;
  minTenor: number;        // months
  maxTenor: number;        // months
  tenorOptions: number[];  // suggested tenor pills
  defaultTenor: number;
  processingFeePct: number;
  highlights: string[];
}

export const PRODUCTS: LoanProduct[] = [
  {
    key: 'samridhi', name: 'Samridhi Loan',
    tagline: 'GST-based · Straight-through process using your GST returns',
    category: 'Working Capital',
    minAmount: 500000, maxAmount: 2500000, defaultAmount: 1500000,
    minRate: 24, maxRate: 30, minTenor: 12, maxTenor: 60,
    tenorOptions: [12, 24, 36, 48, 60], defaultTenor: 24, processingFeePct: 3,
    highlights: ['Uses GST returns to unlock capital', 'Straight-through process', 'Minimal documents'],
  },
  {
    key: 'business', name: 'Business Loan',
    tagline: 'Working capital to fund daily operations & inventory',
    category: 'Working Capital',
    minAmount: 200000, maxAmount: 2500000, defaultAmount: 1000000,
    minRate: 24, maxRate: 30, minTenor: 12, maxTenor: 36,
    tenorOptions: [12, 24, 36], defaultTenor: 24, processingFeePct: 2,
    highlights: ['Collateral-free', 'Disbursed within 48 hours', 'Flexible tenure'],
  },
  {
    key: 'machinery', name: 'Machinery & Asset',
    tagline: 'Finance new or used machinery, paid directly to vendors',
    category: 'Asset Finance',
    minAmount: 500000, maxAmount: 2500000, defaultAmount: 1200000,
    minRate: 24, maxRate: 30, minTenor: 12, maxTenor: 60,
    tenorOptions: [12, 24, 36, 48, 60], defaultTenor: 36, processingFeePct: 2,
    highlights: ['Vendor-direct disbursal', 'Up to 5 year tenure', 'New & used assets'],
  },
  {
    key: 'damini', name: 'Damini Loan',
    tagline: 'For women entrepreneurs · 1% lower rate, discounted fees',
    category: 'Women Entrepreneurs',
    minAmount: 300000, maxAmount: 2500000, defaultAmount: 800000,
    minRate: 23, maxRate: 29, minTenor: 12, maxTenor: 48,
    tenorOptions: [12, 24, 36, 48], defaultTenor: 24, processingFeePct: 1.5,
    highlights: ['1% lower interest rate', 'Discounted processing fee', 'Priority processing'],
  },
  {
    key: 'suryakiran', name: 'SuryaKiran Loan',
    tagline: 'Solar rooftop financing for industrial units',
    category: 'Green Finance',
    minAmount: 200000, maxAmount: 2500000, defaultAmount: 900000,
    minRate: 24, maxRate: 28, minTenor: 12, maxTenor: 60,
    tenorOptions: [12, 24, 36, 48, 60], defaultTenor: 36, processingFeePct: 2,
    highlights: ['Sustainable power', 'Long tenure', 'Lower rate band'],
  },
  {
    key: 'wash', name: 'WASH Loan',
    tagline: 'Water & sanitation financing for retailers',
    category: 'Impact',
    minAmount: 200000, maxAmount: 1500000, defaultAmount: 500000,
    minRate: 24, maxRate: 30, minTenor: 12, maxTenor: 36,
    tenorOptions: [12, 24, 36], defaultTenor: 24, processingFeePct: 2,
    highlights: ['For sanitation retailers', 'Quick approval', 'Collateral-free'],
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
