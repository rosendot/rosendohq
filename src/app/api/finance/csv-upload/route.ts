import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const accountId = formData.get('accountId') as string;
        const source = formData.get('source') as string;

        if (!file || !accountId || !source) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get current user (using a simple query to get owner_id from existing data)
        const { data: existingAccount } = await supabase
            .from('account')
            .select('owner_id')
            .eq('id', accountId)
            .single();

        if (!existingAccount) {
            return NextResponse.json(
                { success: false, error: 'Account not found' },
                { status: 404 }
            );
        }

        const ownerId = existingAccount.owner_id;

        // Read CSV file
        const csvText = await file.text();

        // Parse CSV to get row count
        const parseResult = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        const rows = parseResult.data as Record<string, string>[];

        // Create upload batch
        const { data: batch, error: batchError } = await supabase
            .from('csv_upload_batch')
            .insert({
                owner_id: ownerId,
                source,
                account_id: accountId,
                file_name: file.name,
                row_count: rows.length,
            })
            .select()
            .single();

        if (batchError || !batch) {
            console.error('Batch creation error:', batchError);
            return NextResponse.json(
                { success: false, error: 'Failed to create upload batch' },
                { status: 500 }
            );
        }

        // Insert raw CSV data based on source type
        const rawTableInserts = rows.map((row, index) => {
            const baseData = {
                owner_id: ownerId,
                upload_batch_id: batch.id,
                row_number: index + 1,
            };

            // Map CSV columns to raw table columns based on source
            switch (source) {
                case 'capital-one-360-checking':
                case 'capital-one-360-savings':
                    return {
                        ...baseData,
                        account_number: row['Account Number'],
                        transaction_description: row['Transaction Description'],
                        transaction_date: row['Transaction Date'],
                        transaction_type: row['Transaction Type'],
                        transaction_amount: row['Transaction Amount'],
                        balance: row['Balance'],
                    };

                case 'capital-one-savor':
                case 'capital-one-venture-x':
                    return {
                        ...baseData,
                        transaction_date: row['Transaction Date'],
                        posted_date: row['Posted Date'],
                        card_no: row['Card No.'],
                        description: row['Description'],
                        category: row['Category'],
                        debit: row['Debit'],
                        credit: row['Credit'],
                    };

                case 'chase-amazon':
                    return {
                        ...baseData,
                        transaction_date: row['Transaction Date'],
                        post_date: row['Post Date'],
                        description: row['Description'],
                        category: row['Category'],
                        type: row['Type'],
                        amount: row['Amount'],
                        memo: row['Memo'],
                    };

                case 'discover-it':
                    return {
                        ...baseData,
                        trans_date: row['Trans. Date'],
                        post_date: row['Post Date'],
                        description: row['Description'],
                        amount: row['Amount'],
                        category: row['Category'],
                    };

                default:
                    throw new Error(`Unknown source type: ${source}`);
            }
        });

        // Get the correct raw table name
        const rawTableMap: Record<string, string> = {
            'capital-one-360-checking': 'raw_capital_one_360_checking',
            'capital-one-360-savings': 'raw_capital_one_360_savings',
            'capital-one-savor': 'raw_capital_one_savor',
            'capital-one-venture-x': 'raw_capital_one_venture_x',
            'chase-amazon': 'raw_chase_amazon',
            'discover-it': 'raw_discover_it',
        };

        const rawTableName = rawTableMap[source];
        if (!rawTableName) {
            return NextResponse.json(
                { success: false, error: `Invalid source type: ${source}` },
                { status: 400 }
            );
        }

        // Insert into raw table (triggers will auto-normalize and import)
        const { error: insertError } = await supabase
            .from(rawTableName)
            .insert(rawTableInserts);

        if (insertError) {
            console.error('Raw data insert error:', insertError);
            return NextResponse.json(
                { success: false, error: `Failed to insert raw data: ${insertError.message}` },
                { status: 500 }
            );
        }

        // Update batch status
        await supabase
            .from('csv_upload_batch')
            .update({
                normalized: true,
                normalized_at: new Date().toISOString(),
                imported: true,
                imported_at: new Date().toISOString(),
            })
            .eq('id', batch.id);

        return NextResponse.json({
            success: true,
            batchId: batch.id,
            rowCount: rows.length,
        });

    } catch (error) {
        console.error('CSV upload error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
