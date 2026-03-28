export interface Donor {
  id: string; user_id?: string; name: string;
  type: 'dining_hall'|'restaurant'|'grocery'|'other';
  address: string; lat: number; lng: number;
  contact_phone?: string; contact_email?: string; created_at: string;
}
export interface FoodBank {
  id: string; name: string; address: string; lat: number; lng: number;
  contact_phone: string; capacity: number; current_load: number;
  avg_response_min: number; active: boolean; created_at: string;
}
export interface FoodBankRanked extends FoodBank {
  distance_miles: number; duration_minutes: number; score: number;
}
export interface SurplusEvent {
  id: string; donor_id: string;
  category: 'hot_entrees'|'bakery'|'salad'|'produce'|'dairy'|'other';
  quantity: number; predicted_qty?: number; unit: string; description?: string;
  expires_at: string;
  status: 'available'|'urgent'|'matched'|'rescued'|'expired';
  created_at: string; donors?: Donor;
}
export interface Rescue {
  id: string; surplus_id: string; food_bank_id: string;
  match_score?: number; distance_miles?: number;
  status: 'pending'|'confirmed'|'completed'|'declined';
  pickup_window?: string; confirmed_at?: string; completed_at?: string;
  created_at: string; surplus_events?: SurplusEvent; food_banks?: FoodBank;
}
export interface Notification {
  id: string; rescue_id: string; recipient: string;
  direction: 'outbound'|'inbound'; body: string; twilio_sid?: string;
  status: 'sent'|'delivered'|'failed'|'received'; created_at: string;
}
export interface ImpactLog {
  id: string; rescue_id: string; meals_rescued: number;
  co2_kg: number; food_value_usd: number; logged_at: string;
}
export interface PredictFeatures {
  day_of_week: number; meal_type: string; category: string;
  menu_items: number; enrolled: number; event_day: boolean; weather_code: number;
}
export interface ImpactStats {
  meals: number; co2_kg: number; food_value_usd: number;
  by_day: { date: string; meals: number }[];
}
