import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { parseCapitalOne360CSV } from '@/lib/finance/csv-importers/capital-one-360';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const csvFile = formData.get('file') as File;
    const accountId = formData.get('accountId') as string;
    const source = formData.get('source') as string;
    const dryRun = formData.get('dryRun') === 'true';

    if (!csvFile) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'No account ID provided' },
        { status: 400 }
      );
    }

    // Read CSV content
    const csvContent = await csvFile.text();

    // Parse CSV based on source
    let normalizedTransactions;
    if (source === 'capital-one-360') {
      normalizedTransactions = parseCapitalOne360CSV(csvContent, accountId);
    } else {
      return NextResponse.json(
        { success: false, error: `Unsupported source: ${source}` },
        { status: 400 }
      );
    }

    // Create import run record
    const { data: importRun, error: runError } = await supabase
      .from('import_run')
      .insert({
        module: 'finance',
        source,
        dry_run: dryRun,
        stats: {
          total: normalizedTransactions.length,
          imported: 0,
          duplicates: 0,
          errors: 0,
        },
      })
      .select()
      .single();

    if (runError || !importRun) {
      return NextResponse.json(
        { success: false, error: runError?.message || 'Failed to create import run' },
        { status: 500 }
      );
    }

    // Check for duplicates
    const dedupeHashes = normalizedTransactions.map(t => t.dedupe_hash);
    const { data: existingTransactions } = await supabase
      .from('transaction')
      .select('dedupe_hash')
      .in('dedupe_hash', dedupeHashes);

    const existingHashes = new Set(existingTransactions?.map(t => t.dedupe_hash) || []);

    // Filter out duplicates
    const newTransactions = normalizedTransactions.filter(
      t => !existingHashes.has(t.dedupe_hash)
    );

    const stats = {
      total: normalizedTransactions.length,
      imported: 0,
      duplicates: normalizedTransactions.length - newTransactions.length,
      errors: 0,
    };

    // If dry run, just return stats
    if (dryRun) {
      await supabase
        .from('import_run')
        .update({ stats })
        .eq('id', importRun.id);

      return NextResponse.json({
        success: true,
        importRunId: importRun.id,
        stats,
      });
    }

    // Build category map for auto-categorization
    const categoryMap = await buildCategoryMap();

    // Insert transactions
    const transactionsToInsert = newTransactions.map(t => ({
      account_id: accountId,
      posted_date: t.posted_date,
      description: t.description,
      amount_cents: t.amount_cents,
      currency: t.currency,
      external_id: t.external_id,
      dedupe_hash: t.dedupe_hash,
      import_run_id: importRun.id,
      category_id: t.suggested_category ? categoryMap.get(t.suggested_category) : null,
    }));

    if (transactionsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('transaction')
        .insert(transactionsToInsert);

      if (insertError) {
        stats.errors = transactionsToInsert.length;
        await supabase
          .from('import_run')
          .update({ stats })
          .eq('id', importRun.id);

        return NextResponse.json(
          {
            success: false,
            importRunId: importRun.id,
            stats,
            error: insertError.message,
          },
          { status: 500 }
        );
      }

      stats.imported = transactionsToInsert.length;
    }

    // Mark import as committed
    await supabase
      .from('import_run')
      .update({
        stats,
        committed_at: new Date().toISOString(),
      })
      .eq('id', importRun.id);

    return NextResponse.json({
      success: true,
      importRunId: importRun.id,
      stats,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * Builds a map of category path -> category ID
 */
async function buildCategoryMap(): Promise<Map<string, string>> {
  const { data: categories } = await supabase
    .from('category')
    .select('id, name, parent_id');

  if (!categories) return new Map();

  // Build parent map
  const parentMap = new Map<string, string>();
  const nameMap = new Map<string, { id: string; name: string }>();

  for (const category of categories) {
    nameMap.set(category.id, { id: category.id, name: category.name });
    if (category.parent_id) {
      parentMap.set(category.id, category.parent_id);
    }
  }

  // Build path -> ID map
  const pathMap = new Map<string, string>();

  for (const category of categories) {
    const path: string[] = [];
    let currentId: string | undefined = category.id;

    // Walk up the tree
    while (currentId) {
      const current = nameMap.get(currentId);
      if (current) {
        path.unshift(current.name);
      }
      currentId = parentMap.get(currentId);
    }

    const pathStr = path.join(' > ');
    pathMap.set(pathStr, category.id);
  }

  return pathMap;
}
