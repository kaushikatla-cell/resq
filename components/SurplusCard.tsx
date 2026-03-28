import Link from 'next/link';
import { fmtExpiry, CATEGORY_LABELS } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import type { SurplusEvent } from '@/types';

const ICONS: Record<string,string> = { hot_entrees:'🍲', bakery:'🍞', salad:'🥗', produce:'🥦', dairy:'🥛', other:'📦' };

export function SurplusCard({ event }: { event: SurplusEvent }) {
  const { label: expiryLabel, urgent } = fmtExpiry(event.expires_at);
  const isActionable = event.status === 'available' || event.status === 'urgent';
  return (
    <div className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all ${event.status === 'rescued' || event.status === 'expired' ? 'opacity-50' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}>
      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">{ICONS[event.category] ?? '📦'}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-medium text-sm text-gray-900 truncate">{event.donors?.name ?? 'Unknown donor'}</p>
          <StatusBadge status={event.status} />
        </div>
        <p className="text-sm text-gray-500 truncate">
          {event.quantity} {event.unit} · {CATEGORY_LABELS[event.category] ?? event.category}
        </p>
        {event.predicted_qty != null && event.predicted_qty > 0 && (
          <p className="text-xs text-amber-600 mt-0.5">AI risk: <span className="font-medium">{event.predicted_qty} servings predicted surplus</span></p>
        )}
      </div>
      <div className={`text-xs font-medium flex-shrink-0 text-right ${urgent ? 'text-red-600' : 'text-gray-400'}`}>{expiryLabel}</div>
      {isActionable && (
        <Link href={`/rescue/${event.id}`} className="flex-shrink-0 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors px-3 py-1.5 rounded-lg">Rescue ↗</Link>
      )}
    </div>
  );
}
