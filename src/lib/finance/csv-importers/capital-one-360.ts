import { createHash } from 'crypto';

export interface CapitalOne360Row {
  'Account Number': string;
  'Transaction Description': string;
  'Transaction Date': string;
  'Transaction Type': 'Credit' | 'Debit';
  'Transaction Amount': string;
  'Balance': string;
}

export interface NormalizedTransaction {
  posted_date: string; // ISO format YYYY-MM-DD
  description: string;
  amount_cents: number; // Negative for expenses, positive for income
  currency: string;
  external_id: string | null;
  dedupe_hash: string;
  raw_balance_cents: number; // For reconciliation
  suggested_category?: string; // Auto-categorization suggestion
  suggested_merchant?: string; // Extracted merchant name
}

/**
 * Parses Capital One 360 date format (MM/DD/YY) to ISO format (YYYY-MM-DD)
 */
function parseCapitalOne360Date(dateStr: string): string {
  const [month, day, year] = dateStr.split('/');
  // Convert 2-digit year to 4-digit (assuming 20xx)
  const fullYear = `20${year}`;
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Parses amount and applies sign based on transaction type
 * Debit = negative (expense), Credit = positive (income)
 */
function parseAmount(amountStr: string, type: 'Credit' | 'Debit'): number {
  const amount = parseFloat(amountStr);
  const cents = Math.round(amount * 100);
  return type === 'Debit' ? -cents : cents;
}

/**
 * Generates a deterministic hash for deduplication
 */
function generateDedupeHash(
  accountId: string,
  date: string,
  description: string,
  amountCents: number
): string {
  const data = `${accountId}|${date}|${description}|${amountCents}`;
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Auto-categorizes transactions based on description patterns
 */
function suggestCategory(description: string): string | undefined {
  const desc = description.toLowerCase();

  // Transfers between own accounts
  if (desc.includes('360 performance savings')) {
    return 'Transfer > Internal Transfer';
  }

  // Credit card payments
  if (desc.includes('chase credit crd') || desc.includes('capital one online pmt')) {
    return 'Transfer > Credit Card Payment';
  }

  // Income
  if (desc.includes('payroll')) {
    return 'Income > Payroll';
  }
  if (desc.includes('interest paid')) {
    return 'Income > Interest';
  }

  // Bills
  if (desc.includes('tmobile')) {
    return 'Bills & Utilities > Phone';
  }
  if (desc.includes('alcove')) {
    return 'Bills & Utilities > Rent';
  }

  // Transportation
  if (desc.includes('toyota')) {
    return 'Transportation > Car Payment';
  }

  // Personal
  if (desc.includes('trufit') || desc.includes('gym') || desc.includes('fitness')) {
    return 'Personal > Fitness';
  }
  if (desc.includes('zelle') || desc.includes('venmo')) {
    return 'Personal > Peer-to-Peer Payment';
  }

  // Services
  if (desc.includes('freelancer')) {
    return 'Financial > Service Fees';
  }

  return undefined;
}

/**
 * Extracts merchant name from transaction description
 */
function extractMerchant(description: string): string | undefined {
  const desc = description.trim();

  // Zelle/Venmo payments - extract recipient
  if (desc.toLowerCase().includes('zelle money sent to')) {
    return desc.replace(/zelle money sent to /i, '').trim();
  }
  if (desc.toLowerCase().includes('venmo payment')) {
    return 'Venmo';
  }

  // Debit card purchases - extract merchant name
  if (desc.toLowerCase().includes('debit card purchase')) {
    const parts = desc.replace(/debit card purchase - /i, '').split(' ');
    // Remove location info (state codes, countries)
    const merchant = parts.filter(p =>
      p.length > 2 &&
      !['WA', 'CA', 'NY', 'TX', 'GB', 'UK'].includes(p.toUpperCase())
    ).slice(0, 3).join(' ');
    return merchant || undefined;
  }

  // Withdrawals - extract service name
  if (desc.toLowerCase().includes('withdrawal from')) {
    const merchant = desc.replace(/withdrawal from /i, '').split(/\s{2,}/)[0].trim();
    return merchant;
  }

  // Deposits - extract source
  if (desc.toLowerCase().includes('deposit from')) {
    const source = desc.replace(/deposit from /i, '').split(/\s{2,}/)[0].trim();
    // Skip internal transfers
    if (!source.toLowerCase().includes('360 performance')) {
      return source;
    }
  }

  return undefined;
}

/**
 * Normalizes a Capital One 360 CSV row to the standard transaction format
 */
export function normalizeCapitalOne360Transaction(
  row: CapitalOne360Row,
  accountId: string
): NormalizedTransaction {
  const postedDate = parseCapitalOne360Date(row['Transaction Date']);
  const description = row['Transaction Description'];
  const amountCents = parseAmount(row['Transaction Amount'], row['Transaction Type']);
  const balanceCents = Math.round(parseFloat(row['Balance']) * 100);

  return {
    posted_date: postedDate,
    description,
    amount_cents: amountCents,
    currency: 'USD',
    external_id: null, // Capital One doesn't provide transaction IDs in CSV
    dedupe_hash: generateDedupeHash(accountId, postedDate, description, amountCents),
    raw_balance_cents: balanceCents,
    suggested_category: suggestCategory(description),
    suggested_merchant: extractMerchant(description),
  };
}

/**
 * Parses a Capital One 360 CSV file and returns normalized transactions
 */
export function parseCapitalOne360CSV(
  csvContent: string,
  accountId: string
): NormalizedTransaction[] {
  const lines = csvContent.trim().split('\n');

  // Skip header row
  const [header, ...dataRows] = lines;

  const transactions: NormalizedTransaction[] = [];

  for (const line of dataRows) {
    // Parse CSV line (simple implementation - may need enhancement for quoted fields)
    const values = line.split(',');

    if (values.length < 6) continue; // Skip invalid rows

    const row: CapitalOne360Row = {
      'Account Number': values[0],
      'Transaction Description': values[1],
      'Transaction Date': values[2],
      'Transaction Type': values[3] as 'Credit' | 'Debit',
      'Transaction Amount': values[4],
      'Balance': values[5],
    };

    const normalized = normalizeCapitalOne360Transaction(row, accountId);
    transactions.push(normalized);
  }

  // Reverse to get chronological order (CSV is reverse chronological)
  return transactions.reverse();
}
