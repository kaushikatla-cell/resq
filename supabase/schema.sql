CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS donors (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name          text NOT NULL,
  type          text NOT NULL CHECK (type IN ('dining_hall','restaurant','grocery','other')),
  address       text NOT NULL,
  lat           float8 NOT NULL,
  lng           float8 NOT NULL,
  contact_phone text,
  contact_email text,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS food_banks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  address          text NOT NULL,
  lat              float8 NOT NULL,
  lng              float8 NOT NULL,
  contact_phone    text NOT NULL,
  capacity         int NOT NULL DEFAULT 100,
  current_load     int NOT NULL DEFAULT 0,
  avg_response_min int NOT NULL DEFAULT 30,
  active           boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS surplus_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id      uuid NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  category      text NOT NULL CHECK (category IN ('hot_entrees','bakery','salad','produce','dairy','other')),
  quantity      int NOT NULL CHECK (quantity > 0),
  predicted_qty int,
  unit          text NOT NULL DEFAULT 'servings',
  description   text,
  expires_at    timestamptz NOT NULL,
  status        text NOT NULL DEFAULT 'available' CHECK (status IN ('available','urgent','matched','rescued','expired')),
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rescues (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surplus_id      uuid NOT NULL REFERENCES surplus_events(id) ON DELETE CASCADE,
  food_bank_id    uuid NOT NULL REFERENCES food_banks(id) ON DELETE RESTRICT,
  match_score     float8,
  distance_miles  float8,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','declined')),
  pickup_window   text,
  confirmed_at    timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rescue_id   uuid NOT NULL REFERENCES rescues(id) ON DELETE CASCADE,
  recipient   text NOT NULL,
  direction   text NOT NULL CHECK (direction IN ('outbound','inbound')),
  body        text NOT NULL,
  twilio_sid  text,
  status      text DEFAULT 'sent' CHECK (status IN ('sent','delivered','failed','received')),
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS impact_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rescue_id       uuid NOT NULL REFERENCES rescues(id) ON DELETE CASCADE,
  meals_rescued   int NOT NULL,
  co2_kg          float8 NOT NULL,
  food_value_usd  float8 NOT NULL,
  logged_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS historical_surplus_data (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id        uuid REFERENCES donors(id) ON DELETE SET NULL,
  day_of_week     int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_type       text NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner')),
  category        text NOT NULL,
  menu_items      int NOT NULL,
  enrolled        int NOT NULL,
  event_day       boolean DEFAULT false,
  weather_code    int DEFAULT 0 CHECK (weather_code IN (0,1,2)),
  actual_surplus  int NOT NULL CHECK (actual_surplus >= 0),
  recorded_date   date NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_surplus_status  ON surplus_events(status);
CREATE INDEX IF NOT EXISTS idx_surplus_expires ON surplus_events(expires_at);
CREATE INDEX IF NOT EXISTS idx_surplus_donor   ON surplus_events(donor_id);
CREATE INDEX IF NOT EXISTS idx_rescues_status  ON rescues(status);
CREATE INDEX IF NOT EXISTS idx_rescues_surplus ON rescues(surplus_id);
CREATE INDEX IF NOT EXISTS idx_impact_logged   ON impact_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_notif_rescue    ON notifications(rescue_id);
CREATE INDEX IF NOT EXISTS idx_hist_donor      ON historical_surplus_data(donor_id);

ALTER TABLE donors                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_banks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE surplus_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescues                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications            ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_logs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_surplus_data  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read food_banks"  ON food_banks              FOR SELECT USING (true);
CREATE POLICY "public read impact_logs" ON impact_logs             FOR SELECT USING (true);
CREATE POLICY "public read surplus"     ON surplus_events          FOR SELECT USING (true);
CREATE POLICY "public read rescues"     ON rescues                 FOR SELECT USING (true);
CREATE POLICY "public read donors"      ON donors                  FOR SELECT USING (true);
CREATE POLICY "public read notifs"      ON notifications           FOR SELECT USING (true);
CREATE POLICY "public read hist"        ON historical_surplus_data FOR SELECT USING (true);
CREATE POLICY "auth insert surplus"     ON surplus_events          FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth insert rescues"     ON rescues                 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "auth insert donors"      ON donors                  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

ALTER PUBLICATION supabase_realtime ADD TABLE surplus_events;
ALTER PUBLICATION supabase_realtime ADD TABLE rescues;
