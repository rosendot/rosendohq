import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const { data: accounts, error } = await supabase
      .from('account')
      .select('id, name, type, institution, currency')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      accounts: accounts || [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, institution, currency } = body;

    if (!name || !type || !institution || !currency) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get owner_id from an existing account (simple approach)
    const { data: existingAccount } = await supabase
      .from('account')
      .select('owner_id')
      .limit(1)
      .single();

    if (!existingAccount) {
      return NextResponse.json(
        { success: false, error: 'No existing accounts found to determine owner' },
        { status: 404 }
      );
    }

    const ownerId = existingAccount.owner_id;

    // Insert new account
    const { data: account, error } = await supabase
      .from('account')
      .insert({
        owner_id: ownerId,
        name,
        type,
        institution,
        currency,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      account,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
