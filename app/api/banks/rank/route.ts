import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getRankedBanks, getRankedBanksFallback } from '@/lib/maps';
import { NextRequest, NextResponse } from 'next/server';
import type { FoodBank } from '@/types';

export async function GET(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  const donorId  = req.nextUrl.searchParams.get('donorId');
  if (!donorId) return NextResponse.json({ error: 'donorId required' }, { status: 400 });
  const [donorRes, banksRes] = await Promise.all([
    supabase.from('donors').select('*').eq('id', donorId).single(),
    supabase.from('food_banks').select('*').eq('active', true),
  ]);
  if (donorRes.error) return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
  const donor  = donorRes.data;
  const banks  = (banksRes.data ?? []) as FoodBank[];
  const ranked = process.env.GOOGLE_MAPS_API_KEY
    ? await getRankedBanks(donor.lat, donor.lng, banks)
    : await getRankedBanksFallback(donor.lat, donor.lng, banks);
  return NextResponse.json({ banks: ranked, donor });
}
