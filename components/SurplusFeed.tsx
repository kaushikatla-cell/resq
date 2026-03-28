'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { SurplusCard } from './SurplusCard';
import type { SurplusEvent } from '@/types';

export function SurplusFeed({ initialEvents }: { initialEvents: SurplusEvent[] }) {
  const [events, setEvents] = useState<SurplusEvent[]>(initialEvents);
  const supabase = createClient();
  useEffect(() => {
    const channel = supabase.channel('surplus_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surplus_events' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const { data } = await supabase.from('surplus_events').select('*, donors(*)').eq('id', (payload.new as SurplusEvent).id).single();
          if (data) setEvents(prev => [data, ...prev]);
        }
        if (payload.eventType === 'UPDATE') {
          setEvents(prev => prev.map(e => e.id === (payload.new as SurplusEvent).id ? { ...e, ...(payload.new as SurplusEvent) } : e));
        }
        if (payload.eventType === 'DELETE') {
          setEvents(prev => prev.filter(e => e.id !== (payload.old as SurplusEvent).id));
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);
  const urgent    = events.filter(e => e.status === 'urgent');
  const available = events.filter(e => e.status === 'available');
  const other     = events.filter(e => !['urgent','available'].includes(e.status));
  if (events.length === 0) return (
    <div className="text-center py-12 text-gray-400">
      <div className="text-4xl mb-3">🌱</div>
      <p className="text-sm">No active surplus events. Add one above.</p>
    </div>
  );
  return (
    <div className="flex flex-col gap-3">
      {urgent.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />Urgent — expires soon
          </p>
          {urgent.map(e => <SurplusCard key={e.id} event={e} />)}
        </div>
      )}
      {available.length > 0 && (
        <div className={urgent.length > 0 ? 'mt-2' : ''}>
          {urgent.length > 0 && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Available</p>}
          {available.map(e => <SurplusCard key={e.id} event={e} />)}
        </div>
      )}
      {other.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Recent</p>
          {other.map(e => <SurplusCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}
