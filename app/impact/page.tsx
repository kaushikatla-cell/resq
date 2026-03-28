import { createServerSupabaseClient } from '@/lib/supabase-server';
import { MetricCard }  from '@/components/MetricCard';
import { ImpactChart } from '@/components/ImpactChart';
import { fmtNumber, fmtCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ImpactPage() {
  const supabase = createServerSupabaseClient();
  const [logsRes, rescuesRes] = await Promise.all([
    supabase.from('impact_logs').select('meals_rescued, co2_kg, food_value_usd, logged_at').order('logged_at'),
    supabase.from('rescues').select('*, surplus_events(quantity, category, donors(name)), food_banks(name)')
      .in('status', ['completed','confirmed']).order('created_at', { ascending: false }).limit(20),
  ]);
  const logs       = logsRes.data ?? [];
  const totalMeals = logs.reduce((s, l) => s + l.meals_rescued, 0);
  const totalCO2   = logs.reduce((s, l) => s + l.co2_kg, 0);
  const totalValue = logs.reduce((s, l) => s + l.food_value_usd, 0);
  const last7: Record<string,number> = {};
  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * 86_400_000).toISOString().split('T')[0];
    last7[d] = 0;
  }
  for (const log of logs) { const d = log.logged_at.split('T')[0]; if (d in last7) last7[d] += log.meals_rescued; }
  const chartData = Object.entries(last7).map(([date, meals]) => ({
    date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), meals,
  }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Impact Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-world outcomes from ResQ food rescues</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total meals rescued" value={fmtNumber(totalMeals)} accent="green" />
        <MetricCard label="CO₂ prevented (kg)"  value={totalCO2.toFixed(1)}   accent="green" sub="≈ planting trees" />
        <MetricCard label="Food value saved"     value={fmtCurrency(totalValue)} accent="blue" />
        <MetricCard label="Rescues completed"    value={logs.length} sub="All time" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-sm font-medium text-gray-700 mb-4">Meals rescued — past 7 days</p>
        <ImpactChart data={chartData} />
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
        <strong>Methodology:</strong> CO₂ at 0.05 kg/meal (EPA WARM). Food value at $4.50/serving (USDA 2024).
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50"><p className="text-sm font-medium text-gray-700">Recent rescues</p></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Donor</th>
                <th className="px-5 py-3 text-left font-medium">Food Bank</th>
                <th className="px-5 py-3 text-left font-medium">Category</th>
                <th className="px-5 py-3 text-left font-medium">Meals</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rescuesRes.data && rescuesRes.data.length > 0 ? rescuesRes.data.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900">{r.surplus_events?.donors?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{r.food_banks?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{r.surplus_events?.category ?? '—'}</td>
                  <td className="px-5 py-3 font-medium text-green-700">+{r.surplus_events?.quantity ?? 0}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${r.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{r.status}</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">No rescues yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
