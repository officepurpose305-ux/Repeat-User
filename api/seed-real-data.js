/**
 * Seed Real Properties and Localities Data
 *
 * This script populates the Supabase real_properties and real_localities tables
 * with actual 99acres property data extracted from the Excel/PDF documents.
 *
 * Run with: node api/seed-real-data.js
 *
 * Requires:
 * - SUPABASE_URL environment variable
 * - SUPABASE_SERVICE_KEY environment variable
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client (requires service role key for seeding)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  console.error('Set these in .env file before running this script');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * LOCALITIES DATA
 * This object will be filled with actual locality metadata from the Excel sheet
 * Structure: { city: [{ name, avg_price_sqft, yoy_growth, metro_distance_min, insights, ... }, ...] }
 */
const LOCALITIES_DATA = {
  noida: [
    // TODO: Fill in with data from india_city_locality_data.xlsx
    // Example structure:
    // {
    //   name: 'Sector 75',
    //   avg_price_sqft: 5200,
    //   yoy_growth: 8.5,
    //   metro_distance_min: 2.1,
    //   schools_count: 8,
    //   hospitals_count: 3,
    //   markets_count: 4,
    //   popular_insights: 'Metro proximity, established residential area',
    //   rank: 1
    // }
  ],
  bangalore: [
    // TODO: Fill in with Bangalore localities
  ],
  mumbai: [
    // TODO: Fill in with Mumbai localities
  ],
  gurgaon: [
    // TODO: Fill in with Gurgaon localities
  ],
  delhi: [
    // TODO: Fill in with Delhi localities
  ]
};

/**
 * PROPERTIES DATA
 * This array will be filled with actual property listings from the PDF
 * Each property must have: city, locality, name, bhk, price_min, price_max, etc.
 */
const PROPERTIES_DATA = [
  // TODO: Fill in with data from India_Properties_99acres_1.pdf
  // Example structure:
  // {
  //   city: 'Noida',
  //   locality: 'Sector 75',
  //   name: 'Emaar Emerald Estate',
  //   developer: 'Emaar MGF Land Ltd',
  //   bhk: ['2BHK', '3BHK'],
  //   price_min: 65,
  //   price_max: 95,
  //   price_avg_sqft: 5200,
  //   area_sqft: 1200,
  //   status: 'Under Construction',
  //   ready_to_move: false,
  //   rera_number: 'RERA/UP/NOIDA/PR/1234',
  //   possession_date: '2026-06',
  //   landmarks: {
  //     metro: '2.1 km',
  //     school: '0.8 km',
  //     hospital: '1.2 km',
  //     market: '0.5 km'
  //   },
  //   amenities: ['Swimming Pool', 'Gym', 'Playground', 'Security'],
  //   image_url: 'https://...',
  //   listing_url: 'https://99acres.com/...'
  // }
];

/**
 * Seed localities into real_localities table
 */
async function seedLocalities() {
  console.log('Seeding localities...');

  let localityCount = 0;
  for (const [city, localities] of Object.entries(LOCALITIES_DATA)) {
    for (const locality of localities) {
      const { error } = await supabase
        .from('real_localities')
        .upsert({
          city,
          name: locality.name,
          avg_price_sqft: locality.avg_price_sqft,
          yoy_growth: locality.yoy_growth,
          metro_distance_min: locality.metro_distance_min,
          schools_count: locality.schools_count || 0,
          hospitals_count: locality.hospitals_count || 0,
          markets_count: locality.markets_count || 0,
          popular_insights: locality.popular_insights,
          rank: locality.rank
        }, {
          onConflict: 'city,name'
        });

      if (error) {
        console.error(`Error seeding locality ${city}/${locality.name}:`, error);
      } else {
        localityCount++;
        console.log(`✓ Seeded ${city}/${locality.name}`);
      }
    }
  }

  console.log(`✓ Seeded ${localityCount} localities`);
  return localityCount;
}

/**
 * Seed properties into real_properties table
 */
async function seedProperties() {
  console.log('Seeding properties...');

  const results = await supabase
    .from('real_properties')
    .insert(
      PROPERTIES_DATA.map(p => ({
        city: p.city,
        locality: p.locality,
        name: p.name,
        developer: p.developer,
        bhk: p.bhk,
        price_min: p.price_min,
        price_max: p.price_max,
        price_avg_sqft: p.price_avg_sqft,
        area_sqft: p.area_sqft,
        status: p.status,
        ready_to_move: p.ready_to_move || false,
        rera_number: p.rera_number,
        possession_date: p.possession_date,
        landmarks: p.landmarks,
        amenities: p.amenities,
        image_url: p.image_url,
        listing_url: p.listing_url
      }))
    );

  if (results.error) {
    console.error('Error seeding properties:', results.error);
    return 0;
  }

  console.log(`✓ Seeded ${PROPERTIES_DATA.length} properties`);
  return PROPERTIES_DATA.length;
}

/**
 * Main seed function
 */
async function seed() {
  console.log('Starting data seed...\n');

  if (PROPERTIES_DATA.length === 0 || Object.values(LOCALITIES_DATA).every(arr => arr.length === 0)) {
    console.warn('⚠ WARNING: No data to seed!');
    console.warn('Please fill in PROPERTIES_DATA and LOCALITIES_DATA in this script first.');
    console.warn('Reference the Excel sheet: india_city_locality_data.xlsx');
    console.warn('Reference the PDF: India_Properties_99acres_1.pdf');
    return;
  }

  try {
    const localityCount = await seedLocalities();
    const propertyCount = await seedProperties();

    console.log('\n✓ Seed complete!');
    console.log(`  - ${localityCount} localities seeded`);
    console.log(`  - ${propertyCount} properties seeded`);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

seed();
