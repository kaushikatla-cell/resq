import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, isPast } from 'date-fns';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function fmtExpiry(expiresAt: string): { label: string; urgent: boolean } {
  const date = new Date(expiresAt);
  if (isPast(date)) return { label: 'Expired', urgent: true };
  const minsLeft = (date.getTime() - Date.now()) / 60000;
  return { label: `${formatDistanceToNow(date)} left`, urgent: minsLeft < 60 };
}

export function calcCO2(meals: number)       { return parseFloat((meals * 0.05).toFixed(1)); }
export function calcFoodValue(meals: number) { return parseFloat((meals * 4.5).toFixed(2)); }

export function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
export function fmtNumber(n: number) { return new Intl.NumberFormat('en-US').format(n); }

export function getPickupWindow(): string {
  const now   = new Date();
  const start = new Date(now.getTime() + 30 * 60000);
  const end   = new Date(now.getTime() + 90 * 60000);
  const fmt   = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export const CATEGORY_LABELS: Record<string,string> = {
  hot_entrees: 'Hot Entrées', bakery: 'Bakery', salad: 'Salad Bar',
  produce: 'Produce', dairy: 'Dairy', other: 'Other',
};

export const STATUS_COLORS: Record<string,string> = {
  available: 'bg-blue-50 text-blue-700 border-blue-200',
  urgent:    'bg-red-50 text-red-700 border-red-200',
  matched:   'bg-amber-50 text-amber-700 border-amber-200',
  rescued:   'bg-green-50 text-green-700 border-green-200',
  expired:   'bg-gray-50 text-gray-500 border-gray-200',
};
