import { NextRequest, NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase-server';
import { sendSMS, buildConfirmSMS, buildDeclineSMS } from '@/lib/twilio';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = (formData.get('From') as string)?.trim();
  const body = (formData.get('Body') as string)?.trim();
  if (!from || !body) return twiml();
  const supabase = createServiceSupabaseClient();
  const { data: bank } = await supabase.from('food_banks').select('id, name').eq('contact_phone', from).single();
  if (!bank) return twiml();
  const { data: rescue } = await supabase
    .from('rescues')
    .select('id, surplus_id, pickup_window, surplus_events(quantity, donors(contact_phone, name))')
    .eq('food_bank_id', bank.id).eq('status', 'pending')
    .order('created_at', { ascending: false }).limit(1).single();
  if (!rescue) return twiml();
  await supabase.from('notifications').insert({ rescue_id: rescue.id, recipient: from, direction: 'inbound', body, status: 'received' });
  const donorPhone = (rescue as any).surplus_events?.donors?.contact_phone as string | undefined;
  if (body === '1') {
    await supabase.from('rescues').update({ status: 'confirmed', confirmed_at: new Date().toISOString() }).eq('id', rescue.id);
    if (donorPhone) {
      const sms = buildConfirmSMS(bank.name, rescue.pickup_window ?? 'TBD');
      const sid = await sendSMS(donorPhone, sms);
      await supabase.from('notifications').insert({ rescue_id: rescue.id, recipient: donorPhone, direction: 'outbound', body: sms, twilio_sid: sid, status: 'sent' });
    }
  } else if (body === '2') {
    await supabase.from('rescues').update({ status: 'declined' }).eq('id', rescue.id);
    await supabase.from('surplus_events').update({ status: 'available' }).eq('id', rescue.surplus_id);
    if (donorPhone) {
      const sms = buildDeclineSMS(bank.name);
      const sid = await sendSMS(donorPhone, sms);
      await supabase.from('notifications').insert({ rescue_id: rescue.id, recipient: donorPhone, direction: 'outbound', body: sms, twilio_sid: sid, status: 'sent' });
    }
  }
  return twiml();
}

function twiml() {
  return new NextResponse('<?xml version="1.0"?><Response></Response>', {
    status: 200, headers: { 'Content-Type': 'text/xml' },
  });
}
