import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  const period   = req.nextUrl.searchParams.get('period') ?? '30d';
  const since = period === 'all' ? '2000-01-01T00:00:00Z'
    : period === '7d' ? new Date(Date.now() - 7  * 86400000).toISOString()
    :                   new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: logs, error } = await supabase
    .from('impact_logs').select('meals_rescued, co2_kg, food_value_usd, logged_at')
    .gte('logged_at', since).order('logged_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const meals = logs?.reduce((s, l) => s + l.meals_rescued, 0) ?? 0;
  const co2   = logs?.reduce((s, l) => s + l.co2_kg, 0) ?? 0;
  const value = logs?.reduce((s, l) => s + l.food_value_usd, 0) ?? 0;
  const byDayMap: Record<string,number> = {};
  for (const log of logs ?? []) {
    const d = log.logged_at.split('T')[0];
    byDayMap[d] = (byDayMap[d] ?? 0) + log.meals_rescued;
  }
  return NextResponse.json({
    meals, co2_kg: parseFloat(co2.toFixed(1)),
    food_value_usd: parseFloat(value.toFixed(2)),
    by_day: Object.entries(byDayMap).map(([date, meals]) => ({ date, meals })),
  });
}
