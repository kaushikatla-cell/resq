import { createServerSupabaseClient } from '@/lib/supabase-server';
import { completeRescue } from '@/actions/completeRescue';

export const dynamic = 'force-dynamic';

const STATUS_COLOR: Record<string,string> = {
  pending:   'bg-gray-50 text-gray-600 border-gray-200',
  confirmed: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  declined:  'bg-red-50 text-red-600 border-red-200',
};

export default async function AdminPage() {
  const supabase = createServerSupabaseClient();
  const [rescuesRes, notifRes] = await Promise.all([
    supabase.from('rescues').select('*, surplus_events(quantity, category, donors(name)), food_banks(name)').order('created_at', { ascending: false }).limit(30),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
  ]);
  const rescues = rescuesRes.data ?? [];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Admin</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage rescues and view SMS logs</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">All rescues</p>
          <p className="text-xs text-gray-400">{rescues.length} total</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Donor</th>
                <th className="px-5 py-3 text-left font-medium">Bank</th>
                <th className="px-5 py-3 text-left font-medium">Qty</th>
                <th className="px-5 py-3 text-left font-medium">Score</th>
                <th className="px-5 py-3 text-left font-medium">Pickup</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rescues.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">No rescues yet</td></tr>
              ) : rescues.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-900">{r.surplus_events?.donors?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{r.food_banks?.name ?? '—'}</td>
                  <td className="px-5 py-3 font-medium">{r.surplus_events?.quantity ?? '—'}</td>
                  <td className="px-5 py-3 text-green-700 font-medium">{r.match_score ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{r.pickup_window ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[r.status] ?? ''}`}>{r.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    {r.status === 'confirmed' && (
                      <form action={async () => { 'use server'; await completeRescue(r.id); }}>
                        <button type="submit" className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors">Mark complete</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50"><p className="text-sm font-medium text-gray-700">SMS log</p></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left font-medium">To / From</th>
                <th className="px-5 py-3 text-left font-medium">Direction</th>
                <th className="px-5 py-3 text-left font-medium">Message</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(notifRes.data ?? []).length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No SMS sent yet</td></tr>
              ) : (notifRes.data ?? []).map((n: any) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{n.recipient}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${n.direction === 'outbound' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>{n.direction}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-600 max-w-xs truncate text-xs">{n.body}</td>
                  <td className="px-5 py-3"><span className={`text-xs ${n.status === 'failed' ? 'text-red-600' : 'text-gray-400'}`}>{n.status}</span></td>
                  <td className="px-5 py-3 text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
