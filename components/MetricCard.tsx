interface Props {
  label: string; value: string | number; sub?: string;
  accent?: 'green'|'amber'|'blue'|'default'; live?: boolean;
}
const ACCENT = { green: 'text-green-700', amber: 'text-amber-700', blue: 'text-blue-700', default: 'text-gray-900' };
export function MetricCard({ label, value, sub, accent = 'default', live }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        {live && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
      </div>
      <p className={`text-2xl font-semibold tracking-tight ${ACCENT[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
