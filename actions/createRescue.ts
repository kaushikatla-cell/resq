'use server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendSMS, buildPickupSMS } from '@/lib/twilio';
import { getPickupWindow } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createRescue(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const surplusId     = formData.get('surplusId')     as string;
  const bankId        = formData.get('bankId')        as string;
  const matchScore    = parseFloat(formData.get('matchScore')    as string);
  const distanceMiles = parseFloat(formData.get('distanceMiles') as string);
  if (!surplusId || !bankId) throw new Error('surplusId and bankId are required');
  const window = getPickupWindow();
  const { data: rescue, error: rErr } = await supabase
    .from('rescues')
    .insert({ surplus_id: surplusId, food_bank_id: bankId, match_score: matchScore, distance_miles: distanceMiles, pickup_window: window, status: 'pending' })
    .select('id').single();
  if (rErr || !rescue) throw new Error(rErr?.message ?? 'Failed to create rescue');
  await supabase.from('surplus_events').update({ status: 'matched' }).eq('id', surplusId);
  const [surplusRes, bankRes] = await Promise.all([
    supabase.from('surplus_events').select('quantity, category, donors(name, address, contact_phone)').eq('id', surplusId).single(),
    supabase.from('food_banks').select('name, contact_phone').eq('id', bankId).single(),
  ]);
  const surplus = surplusRes.data;
  const bank    = bankRes.data;
  if (surplus && bank) {
    const donor   = (surplus as any).donors as { name: string; address: string; contact_phone: string } | null;
    const smsBody = buildPickupSMS({ qty: surplus.quantity, category: surplus.category, donorName: donor?.name ?? 'Donor', donorAddress: donor?.address ?? 'Cambridge, MA', window });
    const sid     = await sendSMS(bank.contact_phone, smsBody);
    await supabase.from('notifications').insert({ rescue_id: rescue.id, recipient: bank.contact_phone, direction: 'outbound', body: smsBody, twilio_sid: sid ?? null, status: sid ? 'sent' : 'failed' });
  }
  revalidatePath('/dashboard');
  redirect('/dashboard?rescued=1');
}
