'use server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getPrediction } from '@/lib/ml';
import type { PredictFeatures } from '@/types';

const ENROLLED: Record<string,number> = {
  'MIT Baker House Dining': 350, 'MIT W20 Dining Hall': 420,
  'Harvard Annenberg Hall': 1200, 'Whole Foods Market Cambridge': 200, 'Panera Bread Kendall Sq': 180,
};

export async function createSurplus(formData: FormData) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const donorId    = formData.get('donorId')    as string;
  const category   = formData.get('category')   as string;
  const quantity   = parseInt(formData.get('quantity') as string, 10);
  const expiresAt  = formData.get('expiresAt')  as string;
  const description = (formData.get('description') as string) || null;
  if (!donorId || !category || !quantity || !expiresAt) return { error: 'Missing required fields' };
  const minsToExpiry = (new Date(expiresAt).getTime() - Date.now()) / 60000;
  const status = minsToExpiry < 60 ? 'urgent' : 'available';
  const { data: donor } = await supabase.from('donors').select('name').eq('id', donorId).single();
  const enrolled = ENROLLED[donor?.name ?? ''] ?? 300;
  const now = new Date();
  const features: PredictFeatures = {
    day_of_week:  now.getDay() === 0 ? 6 : now.getDay() - 1,
    meal_type:    now.getHours() < 11 ? 'breakfast' : now.getHours() < 15 ? 'lunch' : 'dinner',
    category, menu_items: 8, enrolled, event_day: false, weather_code: 0,
  };
  const predicted_qty = await getPrediction(features);
  const { data, error } = await supabase
    .from('surplus_events')
    .insert({ donor_id: donorId, category, quantity, predicted_qty, unit: 'servings', description, expires_at: expiresAt, status })
    .select('id').single();
  if (error) return { error: error.message };
  return { surplusId: data.id, predictedQty: predicted_qty };
}
