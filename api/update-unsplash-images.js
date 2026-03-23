const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlfttxrnnjueycffwdmy.supabase.co';
const supabaseServiceKey = 'sb_secret_ipXzLH_HMaBfGSvSQwDuDA_uAu_xXOs';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CURATED UNSPLASH PROPERTY IMAGES - Pick your favorites!
// Instructions:
// 1. Go to https://unsplash.com and search for "apartment", "real estate", "modern home", etc.
// 2. Right-click image → Open image in new tab
// 3. Copy the URL and add the query params: ?w=800&h=600&fit=crop
// 4. Add to the array below
// 5. Run: node api/update-unsplash-images.js

const propertyImages = [
  // INDIAN APARTMENTS & HIGH-RISE BUILDINGS (6 images)
  'https://images.unsplash.com/photo-1663985139222-6af2f8646104?w=800&h=600&fit=crop', // Confident Atria III - Modern Indian apartment building
  'https://images.unsplash.com/photo-1663231659579-b28d7e2b924b?w=800&h=600&fit=crop', // Indian residential high-rise
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop', // Mumbai skyline buildings
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600&fit=crop', // Modern building architecture
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', // Urban residential tower
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop', // High-rise apartment complex

  // MUMBAI ARCHITECTURE & ICONIC BUILDINGS (6 images)
  'https://images.unsplash.com/photo-1644733868361-245f8f441777?w=800&h=600&fit=crop', // Clock Tower Building Mumbai
  'https://images.unsplash.com/photo-1549887534-f81e9d582faf?w=800&h=600&fit=crop',  // Victorian architecture Mumbai
  'https://images.unsplash.com/photo-1517245386807-6ca0a40ccb4d?w=800&h=600&fit=crop', // Indian building exterior facade
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', // Mumbai coastal buildings
  'https://images.unsplash.com/photo-1486252690062-cddfc97a6370?w=800&h=600&fit=crop', // Modern city architecture
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop', // Urban Indian cityscape

  // INDIAN RESIDENTIAL COMPLEXES & HERITAGE (6 images)
  'https://images.unsplash.com/photo-1633605016186-a8a919b14f5d?w=800&h=600&fit=crop', // Indian residential complex with garden
  'https://images.unsplash.com/photo-1505521585350-fd134ddc20d7?w=800&h=600&fit=crop', // Gated community residential
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop', // Heritage building India
  'https://images.unsplash.com/photo-1517945712202-14c9d9c8f881?w=800&h=600&fit=crop', // Apartment complex courtyard
  'https://images.unsplash.com/photo-1613977257363-1d7265753519?w=800&h=600&fit=crop', // Modern residential society
  'https://images.unsplash.com/photo-1523217311519-55073fcf8e34?w=800&h=600&fit=crop', // Indian property with trees

  // INDIAN HOME INTERIORS (6 images)
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', // Modern living room India
  'https://images.unsplash.com/photo-1560448205-e02f408d3ffa?w=800&h=600&fit=crop',  // Bedroom interior design
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',   // Contemporary kitchen
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop',   // Modern dining area
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop', // Indian apartment interior
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop', // Luxury home interior
];

async function updatePropertyImages() {
  console.log('Fetching all properties...');
  const { data: properties, error: fetchError } = await supabase
    .from('real_properties')
    .select('id, name, locality');

  if (fetchError) {
    console.error('Error fetching properties:', fetchError);
    return;
  }

  console.log(`\n📷 Found ${properties.length} properties`);
  console.log(`🖼️  Using ${propertyImages.length} image URLs\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const imageUrl = propertyImages[i % propertyImages.length];
    
    const { error: updateError } = await supabase
      .from('real_properties')
      .update({ image_url: imageUrl })
      .eq('id', prop.id);

    if (updateError) {
      console.error(`❌ Error: ${prop.name} (${prop.locality})`);
      errorCount++;
    } else {
      successCount++;
      if (successCount % 20 === 0) {
        console.log(`✅ Updated ${successCount} properties...`);
      }
    }
  }

  console.log(`\n✅ Complete!`);
  console.log(`   ${successCount} properties updated with images`);
  if (errorCount > 0) console.log(`   ${errorCount} errors`);
  console.log(`\n🎯 Property images will now show on the homepage!`);
}

updatePropertyImages();
