import type { FoodBank, FoodBankRanked } from '@/types';

export function scoreBank(bank: FoodBank, distanceMiles: number): number {
  const capacityPct  = Math.max(0, 1 - bank.current_load / bank.capacity);
  const distScore    = Math.max(0, 1 - distanceMiles / 10);
  const responseScore = Math.max(0, 1 - bank.avg_response_min / 90);
  return Math.round((0.5 * capacityPct + 0.3 * distScore + 0.2 * responseScore) * 100);
}

export async function getRankedBanks(donorLat: number, donorLng: number, banks: FoodBank[]): Promise<FoodBankRanked[]> {
  const active = banks.filter(b => b.active);
  if (!active.length) return [];
  const origin       = `${donorLat},${donorLng}`;
  const destinations = active.map(b => `${b.lat},${b.lng}`).join('|');
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations}&units=imperial&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  let elements: any[] = [];
  try {
    const res  = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();
    if (data.rows?.[0]?.elements) elements = data.rows[0].elements;
  } catch {}
  return active.map((bank, i) => {
    const el            = elements[i];
    const distanceMiles = el?.status === 'OK' ? el.distance.value / 1609.34 : 999;
    const durationMin   = el?.status === 'OK' ? el.duration.value / 60     : 60;
    return { ...bank, distance_miles: distanceMiles, duration_minutes: durationMin, score: scoreBank(bank, distanceMiles) };
  }).sort((a, b) => b.score - a.score);
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export async function getRankedBanksFallback(donorLat: number, donorLng: number, banks: FoodBank[]): Promise<FoodBankRanked[]> {
  return banks.filter(b => b.active).map(bank => {
    const distanceMiles = haversineDistance(donorLat, donorLng, bank.lat, bank.lng);
    return { ...bank, distance_miles: distanceMiles, duration_minutes: Math.round(distanceMiles * 3), score: scoreBank(bank, distanceMiles) };
  }).sort((a, b) => b.score - a.score);
}
