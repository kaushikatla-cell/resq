'use server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { calcCO2, calcFoodValue } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function completeRescue(rescueId: string) {
  const supabase = createServerSupabaseClient();
  const { data: rescue, error: rErr } = await supabase
    .from('rescues').select('id, surplus_id, status, surplus_events(quantity)').eq('id', rescueId).single();
  if (rErr || !rescue) return { error: 'Rescue not found' };
  if (rescue.status === 'completed') return { error: 'Already completed' };
  const meals = (rescue as any).surplus_events?.quantity ?? 0;
  await supabase.from('rescues').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', rescueId);
  await supabase.from('surplus_events').update({ status: 'rescued' }).eq('id', rescue.surplus_id);
  await supabase.from('impact_logs').insert({ rescue_id: rescueId, meals_rescued: meals, co2_kg: calcCO2(meals), food_value_usd: calcFoodValue(meals) });
  revalidatePath('/impact');
  revalidatePath('/admin');
  return { success: true, meals };
}
