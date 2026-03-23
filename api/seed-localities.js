/**
 * Seed locality metadata from india_city_locality_data.pdf
 * Run: node api/seed-localities.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qlfttxrnnjueycffwdmy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Q2sDwYGsgMXv-O5voOjfDQ_9EQDri1t';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Locality metadata from india_city_locality_data.pdf
const LOCALITIES = [
  // BANGALORE
  {
    city: 'Bangalore',
    name: 'Whitefield',
    avg_price_sqft: 13000,
    yoy_growth: 18,
    metro_distance_min: 0.9,
    popular_insights: 'Strong IT corridor demand, metro connectivity, ongoing infrastructure upgrades',
    rank: 1,
  },
  {
    city: 'Bangalore',
    name: 'Marathahalli',
    avg_price_sqft: 12528,
    yoy_growth: 15,
    metro_distance_min: 1.2,
    popular_insights: 'Close to tech hubs, established rental demand, favored by working professionals',
    rank: 2,
  },
  {
    city: 'Bangalore',
    name: 'Sarjapur Road',
    avg_price_sqft: 11050,
    yoy_growth: 20,
    metro_distance_min: 2,
    popular_insights: 'IT corridor growth, upcoming metro impact, strong buyer interest',
    rank: 3,
  },
  {
    city: 'Bangalore',
    name: 'HSR Layout',
    avg_price_sqft: 27050,
    yoy_growth: 12,
    metro_distance_min: 0.8,
    popular_insights: 'Established social infrastructure, premium locality, high demand from salaried buyers',
    rank: 4,
  },
  {
    city: 'Bangalore',
    name: 'Electronic City',
    avg_price_sqft: 43875,
    yoy_growth: 16,
    metro_distance_min: 1.5,
    popular_insights: 'Major employment hub, strong commuter demand, value driven by tech parks',
    rank: 5,
  },

  // NOIDA
  {
    city: 'Noida',
    name: 'Noida Extension',
    avg_price_sqft: 7234,
    yoy_growth: 22,
    metro_distance_min: 3,
    popular_insights: 'Budget-friendly supply, large-scale township activity, strong investor interest',
    rank: 1,
  },
  {
    city: 'Noida',
    name: 'Sector 150',
    avg_price_sqft: 11724,
    yoy_growth: 18,
    metro_distance_min: 2.5,
    popular_insights: 'Premium green sector, expressway connectivity, strong appreciation trend',
    rank: 2,
  },
  {
    city: 'Noida',
    name: 'Sector 137',
    avg_price_sqft: 8712,
    yoy_growth: 15,
    metro_distance_min: 1.8,
    popular_insights: 'Good connectivity, tech corridor demand, established residential communities',
    rank: 3,
  },
  {
    city: 'Noida',
    name: 'Sector 75',
    avg_price_sqft: 12094,
    yoy_growth: 17,
    metro_distance_min: 0.8,
    popular_insights: 'Metro access, developed neighborhood, active resale demand',
    rank: 4,
  },
  {
    city: 'Noida',
    name: 'Sector 107',
    avg_price_sqft: 15886,
    yoy_growth: 14,
    metro_distance_min: 0.6,
    popular_insights: 'High-end housing stock, central Noida access, stronger pricing than surrounding sectors',
    rank: 5,
  },

  // MUMBAI
  {
    city: 'Mumbai',
    name: 'Andheri West',
    avg_price_sqft: 37700,
    yoy_growth: 12,
    metro_distance_min: 1.2,
    popular_insights: 'Prime western suburb, entertainment-business hub, strong lifestyle demand',
    rank: 1,
  },
  {
    city: 'Mumbai',
    name: 'Powai',
    avg_price_sqft: 19350,
    yoy_growth: 14,
    metro_distance_min: 2,
    popular_insights: 'Self-sustained township feel, corporate demand, premium lake-side micro-market',
    rank: 2,
  },
  {
    city: 'Mumbai',
    name: 'Chembur',
    avg_price_sqft: 17750,
    yoy_growth: 11,
    metro_distance_min: 1.5,
    popular_insights: 'Strong east-central connectivity, redevelopment activity, end-user demand',
    rank: 3,
  },
  {
    city: 'Mumbai',
    name: 'Goregaon East',
    avg_price_sqft: 16435,
    yoy_growth: 13,
    metro_distance_min: 2.2,
    popular_insights: 'Strong office access, established suburb, premium mid-segment demand',
    rank: 4,
  },
  {
    city: 'Mumbai',
    name: 'Kharghar',
    avg_price_sqft: 8850,
    yoy_growth: 19,
    metro_distance_min: 3.5,
    popular_insights: 'Planned node, infrastructure-led growth, popular upper-mid budget micro-market',
    rank: 5,
  },
];

async function seedLocalities() {
  console.log('🌍 Seeding 15 locality metadata records...');

  try {
    const { error } = await sb.from('real_localities').insert(LOCALITIES);

    if (error) {
      console.error('❌ Failed:', error.message);
    } else {
      console.log(`✅ Successfully inserted 15 localities:\n`);
      LOCALITIES.forEach(loc => {
        console.log(`   • ${loc.city} - ${loc.name} (₹${loc.avg_price_sqft}/sqft, ${loc.yoy_growth}% YoY)`);
      });
      console.log('\n✨ Locality seeding complete!');
    }
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

seedLocalities();
