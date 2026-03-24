const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlfttxrnnjueycffwdmy.supabase.co';
const supabaseServiceKey = 'sb_secret_ipXzLH_HMaBfGSvSQwDuDA_uAu_xXOs';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Array of Unsplash image URLs for properties
const imageUrls = [
  'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1565641741995-a3d28b94c7fa?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop',
];

async function updateImages() {
  console.log('Fetching all properties...');
  const { data: properties, error } = await supabase
    .from('real_properties')
    .select('id, name');

  if (error) {
    console.error('Error fetching properties:', error);
    return;
  }

  console.log(`Found ${properties.length} properties. Updating images...`);

  let updated = 0;
  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const imageUrl = imageUrls[i % imageUrls.length];
    
    const { error: updateError } = await supabase
      .from('real_properties')
      .update({ image_url: imageUrl })
      .eq('id', prop.id);

    if (updateError) {
      console.error(`Error updating ${prop.name}:`, updateError);
    } else {
      updated++;
      if (updated % 20 === 0) console.log(`  ✓ Updated ${updated} properties...`);
    }
  }

  console.log(`✓ All done! Updated ${updated} properties with Unsplash images`);
}

updateImages();
