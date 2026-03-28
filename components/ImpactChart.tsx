'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function ImpactChart({ data }: { data: { date: string; meals: number }[] }) {
  const max = Math.max(...data.map(d => d.meals), 1);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, boxShadow: 'none' }}
          formatter={(v: number) => [`${v} meals`, 'Rescued']} cursor={{ fill: '#F9FAFB' }} />
        <Bar dataKey="meals" radius={[4,4,0,0]}>
          {data.map((entry, i) => <Cell key={i} fill={entry.meals === max ? '#22C55E' : '#D1FAE5'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
