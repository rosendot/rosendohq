import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // Format: YYYY-MM
  const accountId = searchParams.get('accountId');

  try {
    let query = supabase
      .from('transaction')
      .select(`
        *,
        account:account_id (id, name, type),
        category:category_id (id, name)
      `)
      .order('posted_date', { ascending: false });

    // Filter by month if provided
    if (month) {
      const [year, monthNum] = month.split('-');
      const startDate = `${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
      const endDate = `${month}-${lastDay.toString().padStart(2, '0')}`;
      query = query
        .gte('posted_date', startDate)
        .lte('posted_date', endDate);
    }

    // Filter by account if provided
    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
