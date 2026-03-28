import { createServerSupabaseClient } from '@/lib/supabase-server';
import { MetricCard }     from '@/components/MetricCard';
import { SurplusFeed }    from '@/components/SurplusFeed';
import { AddSurplusForm } from '@/components/AddSurplusForm';
import { fmtNumber, calcCO2 } from '@/lib/utils';
import type { SurplusEvent } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const [surplusRes, impactRes, donorsRes] = await Promise.all([
    supabase.from('surplus_events').select('*, donors(*)').order('created_at', { ascending: false }).limit(50),
    supabase.from('impact_logs').select('meals_rescued').gte('logged_at', new Date(Date.now() - 86_400_000).toISOString()),
    supabase.from('donors').select('id, name').order('name'),
  ]);
  const events      = (surplusRes.data ?? []) as SurplusEvent[];
  const todayMeals  = (impactRes.data ?? []).reduce((s, r) => s + r.meals_rescued, 0);
  const activeCount = events.filter(e => ['available','urgent'].includes(e.status)).length;
  const urgentCount = events.filter(e => e.status === 'urgent').length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Surplus Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live feed of food surplus events — Cambridge area</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Meals rescued today" value={fmtNumber(todayMeals)} accent="green" live />
        <MetricCard label="Active alerts"        value={activeCount} accent="blue" />
        <MetricCard label="Urgent (<1 hr)"       value={urgentCount} accent="amber" />
        <MetricCard label="CO₂ saved (kg)"       value={calcCO2(todayMeals)} sub="Today" />
      </div>
      <AddSurplusForm donors={donorsRes.data ?? []} />
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Live Surplus Feed</h2>
          <span className="text-xs text-gray-400">{events.length} events</span>
        </div>
        <SurplusFeed initialEvents={events} />
      </div>
    </div>
  );
}
