import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DONORS = [
  { name: 'MIT Baker House Dining',      type: 'dining_hall', address: '362 Memorial Dr, Cambridge, MA 02139',        lat: 42.3583, lng: -71.0956, contact_phone: '+16175550101', contact_email: 'baker@mit.edu' },
  { name: 'MIT W20 Dining Hall',         type: 'dining_hall', address: '84 Massachusetts Ave, Cambridge, MA 02139',   lat: 42.3601, lng: -71.0942, contact_phone: '+16175550102', contact_email: 'w20@mit.edu' },
  { name: 'Harvard Annenberg Hall',      type: 'dining_hall', address: '45 Quincy St, Cambridge, MA 02138',            lat: 42.3744, lng: -71.1162, contact_phone: '+16175550103', contact_email: 'dining@harvard.edu' },
  { name: 'Whole Foods Market Cambridge',type: 'grocery',     address: '340 River St, Cambridge, MA 02139',            lat: 42.3683, lng: -71.1025, contact_phone: '+16175550104', contact_email: 'community@wfm.com' },
  { name: 'Panera Bread Kendall Sq',     type: 'restaurant',  address: '300 Main St, Cambridge, MA 02142',             lat: 42.3625, lng: -71.0826, contact_phone: '+16175550105', contact_email: 'manager@panera.com' },
];

const FOOD_BANKS = [
  { name: 'Cambridge Food Pantry',    address: '2029 Massachusetts Ave, Cambridge, MA 02140', lat: 42.3736, lng: -71.1097, contact_phone: '+16175550201', capacity: 150, current_load: 40,  avg_response_min: 20 },
  { name: 'Greater Boston Food Bank', address: '70 South Bay Ave, Boston, MA 02136',          lat: 42.3351, lng: -71.0475, contact_phone: '+16175550202', capacity: 500, current_load: 120, avg_response_min: 35 },
  { name: "Rosie's Place Shelter",    address: '889 Harrison Ave, Boston, MA 02118',           lat: 42.3398, lng: -71.0750, contact_phone: '+16175550203', capacity: 80,  current_load: 20,  avg_response_min: 25 },
  { name: 'Margaret Fuller House',    address: '71 Cherry St, Cambridge, MA 02139',            lat: 42.3751, lng: -71.1167, contact_phone: '+16175550204', capacity: 100, current_load: 30,  avg_response_min: 15 },
];

const CATEGORIES = ['hot_entrees','bakery','salad','produce','dairy'] as const;
const MEAL_TYPES = ['breakfast','lunch','dinner'] as const;
const ENROLLMENTS: Record<string,number> = {
  'MIT Baker House Dining': 350, 'MIT W20 Dining Hall': 420,
  'Harvard Annenberg Hall': 1200, 'Whole Foods Market Cambridge': 200, 'Panera Bread Kendall Sq': 180,
};
const CATEGORY_MULT: Record<string,number> = { bakery:1.8, hot_entrees:1.0, salad:1.2, produce:1.4, dairy:0.9, other:1.0 };

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function calcSurplus(enrolled: number, category: string, dow: number, isEvent: boolean) {
  const dayMult   = [5,6].includes(dow) ? 0.6 : dow === 0 ? 1.2 : 1.0;
  const eventMult = isEvent ? 0.5 : 1.0;
  const base      = enrolled * 0.08 * (0.7 + Math.random() * 0.6);
  return Math.max(5, Math.round(base * (CATEGORY_MULT[category] ?? 1) * dayMult * eventMult));
}

async function seed() {
  console.log('🌱 Seeding ResQ database...\n');
  const tables = ['notifications','impact_logs','rescues','surplus_events','historical_surplus_data','food_banks','donors'];
  for (const t of tables) {
    await supabase.from(t).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }

  const { data: donors, error: dErr } = await supabase.from('donors').insert(DONORS).select();
  if (dErr) { console.error(dErr); process.exit(1); }
  console.log(`  ✓ ${donors!.length} donors`);

  await supabase.from('food_banks').insert(FOOD_BANKS);
  console.log(`  ✓ ${FOOD_BANKS.length} food banks`);

  const now = Date.now();
  const SLOTS = [
    { status:'urgent',    mins: 35 },{ status:'urgent',    mins: 50 },
    { status:'available', mins: 90 },{ status:'available', mins: 120 },
    { status:'available', mins: 180 },{ status:'available', mins: 240 },
    { status:'matched',   mins: 75 },{ status:'rescued',   mins: -60 },
    { status:'rescued',   mins: -120 },{ status:'expired',  mins: -30 },
  ];
  const surplusRows = Array.from({ length: 30 }, (_, i) => {
    const donor = donors![i % donors!.length];
    const slot  = SLOTS[i % SLOTS.length];
    return { donor_id: donor.id, category: CATEGORIES[i % CATEGORIES.length], quantity: randInt(15,180), unit:'servings', expires_at: new Date(now + slot.mins * 60000).toISOString(), status: slot.status };
  });
  await supabase.from('surplus_events').insert(surplusRows);
  console.log(`  ✓ 30 surplus events`);

  const histRows: any[] = [];
  for (const donor of donors!) {
    const enrolled = ENROLLMENTS[donor.name] ?? 200;
    for (let i = 0; i < 100; i++) {
      const dow     = i % 7;
      const isEvent = Math.random() < 0.15;
      const cat     = CATEGORIES[i % CATEGORIES.length];
      histRows.push({
        donor_id: donor.id, day_of_week: dow, meal_type: MEAL_TYPES[i % 3],
        category: cat, menu_items: randInt(4,18), enrolled, event_day: isEvent,
        weather_code: Math.random() < 0.15 ? 1 : Math.random() < 0.05 ? 2 : 0,
        actual_surplus: calcSurplus(enrolled, cat, dow, isEvent),
        recorded_date: new Date(now - (i+1) * 86400000).toISOString().split('T')[0],
      });
    }
  }
  for (let i = 0; i < histRows.length; i += 100) {
    await supabase.from('historical_surplus_data').insert(histRows.slice(i, i+100));
  }
  console.log(`  ✓ 500 historical rows\n`);
  console.log('✅ Seed complete! Open http://localhost:3000/dashboard');
}

seed().catch(err => { console.error(err); process.exit(1); });
