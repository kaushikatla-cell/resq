import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getRankedBanks, getRankedBanksFallback } from '@/lib/maps';
import { BankMatchCard } from '@/components/BankMatchCard';
import { MapView }       from '@/components/MapView';
import { StatusBadge }   from '@/components/StatusBadge';
import { fmtExpiry, CATEGORY_LABELS } from '@/lib/utils';
import { notFound } from 'next/navigation';
import type { FoodBank, SurplusEvent } from '@/types';

export const dynamic = 'force-dynamic';

export default async function RescuePage({ params }: { params: { surplusId: string } }) {
  const supabase = createServerSupabaseClient();
  const [surplusRes, banksRes] = await Promise.all([
    supabase.from('surplus_events').select('*, donors(*)').eq('id', params.surplusId).single(),
    supabase.from('food_banks').select('*').eq('active', true),
  ]);
  if (surplusRes.error || !surplusRes.data) notFound();
  const surplus = surplusRes.data as SurplusEvent;
  const banks   = (banksRes.data ?? []) as FoodBank[];
  const donor   = surplus.donors!;
  const rankedBanks = process.env.GOOGLE_MAPS_API_KEY
    ? await getRankedBanks(donor.lat, donor.lng, banks)
    : await getRankedBanksFallback(donor.lat, donor.lng, banks);
  const { label: expiryLabel, urgent } = fmtExpiry(surplus.expires_at);
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <a href="/dashboard" className="hover:text-gray-900">← Dashboard</a>
        <span>/</span><span>Rescue</span>
      </div>
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Match food bank</h1>
        <p className="text-sm text-gray-500 mt-0.5">Select the best pickup partner for this surplus event</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Surplus from</p>
            <p className="font-semibold text-gray-900">{donor.name}</p>
            <p className="text-sm text-gray-500 mt-0.5">{donor.address}</p>
          </div>
          <StatusBadge status={surplus.status} size="md" />
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
          <div><p className="text-xs text-gray-400 mb-1">Category</p><p className="text-sm font-medium">{CATEGORY_LABELS[surplus.category] ?? surplus.category}</p></div>
          <div><p className="text-xs text-gray-400 mb-1">Quantity</p><p className="text-sm font-medium">{surplus.quantity} {surplus.unit}</p></div>
          <div><p className="text-xs text-gray-400 mb-1">Expires</p><p className={`text-sm font-medium ${urgent ? 'text-red-600' : 'text-gray-700'}`}>{expiryLabel}</p></div>
        </div>
        {surplus.predicted_qty != null && surplus.predicted_qty > 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 flex items-center gap-2">
            <span className="text-amber-500">⚡</span>
            <p className="text-sm text-amber-700"><strong>AI prediction:</strong> {surplus.predicted_qty} servings estimated at risk without rescue</p>
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Nearby food banks</p>
          <p className="text-xs text-gray-400">Ranked by AI score</p>
        </div>
        <MapView donorLat={donor.lat} donorLng={donor.lng} banks={rankedBanks} apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ''} />
      </div>
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">AI-ranked matches</h2>
        {rankedBanks.length === 0
          ? <p className="text-sm text-gray-400">No active food banks found.</p>
          : rankedBanks.slice(0,4).map((bank, i) => <BankMatchCard key={bank.id} bank={bank} rank={i} surplusId={surplus.id} />)
        }
      </div>
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Estimated impact if rescued</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'Meals saved',   value: `+${surplus.quantity}` },
            { label: 'CO₂ prevented', value: `+${(surplus.quantity * 0.05).toFixed(1)} kg` },
            { label: 'Food value',    value: `~$${(surplus.quantity * 4.5).toFixed(0)}` },
          ].map(s => (
            <div key={s.label}>
              <p className="text-lg font-semibold text-green-700">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
