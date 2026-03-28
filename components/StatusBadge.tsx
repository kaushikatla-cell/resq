import { cn, STATUS_COLORS } from '@/lib/utils';
interface Props { status: string; size?: 'sm'|'md'; }
export function StatusBadge({ status, size = 'sm' }: Props) {
  return (
    <span className={cn('inline-flex items-center rounded-full border font-medium capitalize', size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm', STATUS_COLORS[status] ?? 'bg-gray-50 text-gray-600 border-gray-200')}>
      {status === 'urgent' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5 animate-pulse" />}
      {status}
    </span>
  );
}
