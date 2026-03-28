import 'server-only';
import twilio from 'twilio';

let _client: ReturnType<typeof twilio> | null = null;
function getClient() {
  if (!_client) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) throw new Error('Twilio credentials not configured');
    _client = twilio(sid, token);
  }
  return _client;
}

export async function sendSMS(to: string, body: string): Promise<string | null> {
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!from || !process.env.TWILIO_ACCOUNT_SID) {
    console.warn('[Twilio] Not configured — skipping SMS to', to);
    return null;
  }
  try {
    const msg = await getClient().messages.create({ from, to, body });
    return msg.sid;
  } catch (err) { console.error('[Twilio] Send failed:', err); return null; }
}

export function buildPickupSMS(o: { qty: number; category: string; donorName: string; donorAddress: string; window: string }) {
  return `[ResQ] Pickup available: ${o.qty} servings of ${o.category} from ${o.donorName} at ${o.donorAddress}. Window: ${o.window}. Reply 1 CONFIRM or 2 DECLINE.`;
}
export function buildConfirmSMS(bankName: string, window: string) {
  return `[ResQ] Confirmed by ${bankName}. Pickup by ${window}. Thank you for donating!`;
}
export function buildDeclineSMS(bankName: string) {
  return `[ResQ] ${bankName} couldn't make this pickup. Finding another match now.`;
}
