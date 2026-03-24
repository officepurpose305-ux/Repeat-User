const { createClient } = require('@supabase/supabase-js');

// Load from environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function parsePrice(priceStr) {
  const str = priceStr.replace('₹', '').trim();
  if (str.includes('Cr')) {
    return parseFloat(str) * 10000000;
  } else if (str.includes('L')) {
    return parseFloat(str) * 100000;
  }
  return 0;
}

function parseBHK(bhkStr) {
  const match = bhkStr.match(/(\d+)/);
  return match ? [parseInt(match[1]).toString()] : ['2'];
}

function parseArea(sqftStr) {
  const match = sqftStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function transformProperty(prop, city, locality) {
  const priceMin = parsePrice(prop.price) * 0.95;
  const priceMax = parsePrice(prop.price) * 1.05;
  const area = parseArea(prop.sqft);
  const pricePerSqft = area > 0 ? Math.round(priceMax / area) : 0;

  return {
    city: city.toLowerCase(),
    locality: locality,
    name: prop.name,
    developer: prop.dev,
    bhk: parseBHK(prop.bhk),
    price_min: Math.round(priceMin),
    price_max: Math.round(priceMax),
    price_avg_sqft: pricePerSqft,
    area_sqft: area,
    status: prop.status,
    ready_to_move: prop.ready_to_move || false,
    rera_number: null,
    possession_date: null,
    landmarks: {
      highlights: prop.lm ? [prop.lm] : []
    },
    amenities: [],
    image_url: prop.image_url,
    listing_url: null
  };
}

// Complete property data for all 3 cities, 5 localities each, ~10 properties each
const ALL_PROPERTIES = {
  bangalore: {
    'Whitefield': [
      { name:'Amrutha Lake Vista', dev:'Amrutha', price:'₹1.96 Cr', sqft:'1675 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'13km from IT corridor · 900m metro planned', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'Vaishno Serene', dev:'Vaishno', price:'₹1.27 Cr', sqft:'1561 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Whitefield tech hub · Good connectivity', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'Sumadhura Edition', dev:'Sumadhura', price:'₹2.65 Cr', sqft:'2050 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Premium township · Metro ready', image_url:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop' },
      { name:'Sumadhura Capitol', dev:'Sumadhura', price:'₹3.125 Cr', sqft:'1892 sq ft', bhk:'4 BHK', status:'Under Construction', ready_to_move:false, lm:'Luxury township · IT corridor proximity', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Prestige Raintree Park', dev:'Prestige', price:'₹4.28 Cr', sqft:'2851 sq ft', bhk:'4 BHK', status:'Under Construction', ready_to_move:false, lm:'5-star amenities · Gated community', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'Anahata', dev:'Anahata', price:'₹1.11 Cr', sqft:'1461 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Green township · Yoga studio', image_url:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop' },
      { name:'Brigade Avalon', dev:'Brigade', price:'₹5.65 Cr', sqft:'1868 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Premium lifestyle · Club membership', image_url:'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800&h=600&fit=crop' },
      { name:'Provident Botanico', dev:'Provident', price:'₹1.18 Cr', sqft:'830 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'Eco-friendly township · IT park nearby', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'Platinum East Woods', dev:'Platinum', price:'₹1.71 Cr', sqft:'1814 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Spacious units · Good connectivity', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Sarang by Sumadhura', dev:'Sumadhura', price:'₹1.82 Cr', sqft:'1655 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Possession ready · Modern amenities', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ],
    'Marathahalli': [
      { name:'Sumadhura Solace', dev:'Sumadhura', price:'₹3.33 Cr', sqft:'2217 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'IT corridor · Quick connectivity', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Trendsquares Akino', dev:'Trendsquares', price:'₹1.85 Cr', sqft:'1780 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Tech hub · Premium finishes', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Century Marathahalli', dev:'Century', price:'₹3.50 Cr', sqft:'2245 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Central location · Metro upcoming', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'Assetz Codename Micropolis', dev:'Assetz', price:'₹1.65 Cr', sqft:'1250 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Tech-enabled · Smart home', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'Prestige Green Gables', dev:'Prestige', price:'₹1.61 Cr', sqft:'1297 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'Eco-friendly · Central location', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'Sobha Palladian', dev:'Sobha', price:'₹4.50 Cr', sqft:'2700 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Luxury living · Premium location', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'Pavani Ishta 2BHK', dev:'Pavani', price:'₹1.30 Cr', sqft:'1150 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Budget friendly · Good society', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'Saptagiri Sannidhi', dev:'Saptagiri', price:'₹1.25 Cr', sqft:'1300 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Community living · Amenities rich', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'Durga Petals', dev:'Durga', price:'₹1.42 Cr', sqft:'1357 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Established society · Good connectivity', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Marathahalli 2BHK ORR', dev:'Prime', price:'₹0.82 Cr', sqft:'1050 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'ORR proximity · Budget option', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ],
    'Sarjapur Road': [
      { name:'Keya The Urban Forest', dev:'Keya', price:'₹1.63 Cr', sqft:'1351 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'Urban forest · IT corridor', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Assetz Trees and Tandem', dev:'Assetz', price:'₹2.16 Cr', sqft:'2013 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Green township · Tech hub access', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Roach Cicada', dev:'Roach', price:'₹2.93 Cr', sqft:'2523 sq ft', bhk:'4 BHK', status:'New Launch', ready_to_move:false, lm:'Premium township · Sarjapur access', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'Suyug The 1', dev:'Suyug', price:'₹1.62 Cr', sqft:'2587 sq ft', bhk:'4 BHK', status:'Under Construction', ready_to_move:false, lm:'Spacious layout · Good value', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'Mythri Sity', dev:'Mythri', price:'₹1.68 Cr', sqft:'1854 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'City living · Affordable premium', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'NBR Soul of the Seasons', dev:'NBR', price:'₹1.85 Cr', sqft:'1636 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Seasonal living · Green spaces', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'DSR The Address', dev:'DSR', price:'₹1.77 Cr', sqft:'1942 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Premium address · Design-focused', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'MSR Passion Square', dev:'MSR', price:'₹1.04 Cr', sqft:'1232 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Affordable option · Passion living', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'Royal Nest by Wone8', dev:'Wone8', price:'₹1.85 Cr', sqft:'1650 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Luxury nest · Premium finishes', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Assetz Sora and Saki', dev:'Assetz', price:'₹2.55 Cr', sqft:'2200 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Twin towers · Good amenities', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ],
    'HSR Layout': [
      { name:'Assetz Mizumi Reserve', dev:'Assetz', price:'₹2.84 Cr', sqft:'1973 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Premium location · South Bangalore', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'SRK Habitat', dev:'SRK', price:'₹1.95 Cr', sqft:'1450 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'Green layout · Family community', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Svamitva Soul Spring', dev:'Svamitva', price:'₹2.81 Cr', sqft:'1345 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'Wellness living · Green spaces', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'Purva Meraki', dev:'Purva', price:'₹5.14 Cr', sqft:'2060 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Luxury township · Premium location', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'HSR Layout 2BHK', dev:'Prime', price:'₹1.20 Cr', sqft:'1100 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Established layout · Good society', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'HSR Layout 3BHK Corner', dev:'Prime', price:'₹2.10 Cr', sqft:'1600 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Corner plot · Premium position', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'Sobha Infinia', dev:'Sobha', price:'₹4.65 Cr', sqft:'2350 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'5-star living · Premium amenities', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'HSR Layout Plot Sector 4', dev:'Prime', price:'₹13.12 Cr', sqft:'3750 sq ft', bhk:'Plot', status:'Ready to Build', ready_to_move:false, lm:'Large plot · Development potential', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'Casa Grand HSR', dev:'Casa Grand', price:'₹2.30 Cr', sqft:'1550 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Ready possession · Good amenities', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'HSR Signature Villa', dev:'Signature', price:'₹3.50 Cr', sqft:'2200 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Villa living · South Bangalore', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ],
    'Electronic City': [
      { name:'Signature Heights', dev:'Signature', price:'₹0.96 Cr', sqft:'1229 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'IT hub · Cyber corridor', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Purva Silversky', dev:'Purva', price:'₹2.30 Cr', sqft:'1580 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Silver township · IT proximity', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Keya The Lake Terraces', dev:'Keya', price:'₹2.50 Cr', sqft:'2250 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Lake view · Premium township', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'DS Max Skyfields', dev:'DS Max', price:'₹1.01 Cr', sqft:'1350 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'Skyline view · Modern design', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'Prestige Falcon City', dev:'Prestige', price:'₹1.32 Cr', sqft:'1175 sq ft', bhk:'1 BHK', status:'Ready to Move', ready_to_move:true, lm:'Falcon city · Budget friendly', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'Shriram Grand City', dev:'Shriram', price:'₹1.07 Cr', sqft:'1350 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Grand township · Good society', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'Electronic City IT Tower', dev:'Tech', price:'₹1.15 Cr', sqft:'1200 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'IT corridor · Tech campus', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'Cyber Heights Bangalore', dev:'Cyber', price:'₹0.95 Cr', sqft:'1150 sq ft', bhk:'1 BHK', status:'Ready to Move', ready_to_move:true, lm:'Cyber precinct · Affordable', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'E-City Premium Residences', dev:'Premium', price:'₹1.40 Cr', sqft:'1400 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Premium finish · Good connectivity', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Electronic City Villa Park', dev:'Villa', price:'₹2.80 Cr', sqft:'2000 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Villa complex · Spacious', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ]
  },
  noida: {
    'Sector 75': [
      { name:'Priya Noida Towers', dev:'Priya', price:'₹70L', sqft:'1200 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Metro adjacent · Good connectivity', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Dheeraj iSmart Sector 75', dev:'Dheeraj', price:'₹85L', sqft:'1350 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'Smart homes · Tech features', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Mahagun My Floors', dev:'Mahagun', price:'₹95L', sqft:'1450 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Premium township · Commercial hub', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'Supertech Azalea Gardens', dev:'Supertech', price:'₹78L', sqft:'1180 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Garden-facing · Family community', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'ATS Rhapsody', dev:'ATS', price:'₹1.10Cr', sqft:'1550 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Premium amenities · High-end', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'Logix Blossom County', dev:'Logix', price:'₹82L', sqft:'1250 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'County living · Spacious', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'Migsun Vilas', dev:'Migsun', price:'₹75L', sqft:'1150 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Budget-friendly · Good location', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'Greystone Valley', dev:'Greystone', price:'₹1.05Cr', sqft:'1450 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Valley community · Natural setting', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'Ramesh Nagar Sec 75', dev:'Ramesh', price:'₹72L', sqft:'1100 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Well-established · Good society', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Sector 75 Noida 3BHK', dev:'Prime', price:'₹1.15Cr', sqft:'1600 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Premium living · Established', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ],
    'Sector 137': [
      { name:'Ace City Sector 137', dev:'Ace', price:'₹65L', sqft:'1150 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Metro ready · Emerging', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Mahagun Maya', dev:'Mahagun', price:'₹70L', sqft:'1200 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Commercial node · Good value', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Shalimar Homes', dev:'Shalimar', price:'₹68L', sqft:'1180 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'Affordable · Growing area', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'ATS Happy Trails', dev:'ATS', price:'₹75L', sqft:'1250 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Trail-side living · Nature proximity', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'Godrej 24', dev:'Godrej', price:'₹80L', sqft:'1300 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'World-class · Premium build', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'Sector 137 Metro Adj', dev:'Prime', price:'₹62L', sqft:'1050 sq ft', bhk:'1 BHK', status:'Ready to Move', ready_to_move:true, lm:'Metro station · Transit-friendly', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'Utopia Sector 137', dev:'Utopia', price:'₹72L', sqft:'1180 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Utopian living · All amenities', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'JM Aroma', dev:'JM', price:'₹78L', sqft:'1250 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Aromatic township · Wellness', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'Kumar Whitesquare', dev:'Kumar', price:'₹85L', sqft:'1350 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'White square concept · Modern', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Sector 137 Investment Grade', dev:'Prime', price:'₹70L', sqft:'1200 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Investment potential · Good returns', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ],
    'Sector 50': [
      { name:'Central Noida Premium', dev:'Central', price:'₹88L', sqft:'1380 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Central Noida · Commercial', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Omex Metro View', dev:'Omex', price:'₹92L', sqft:'1420 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Metro view · Premium location', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Apex Eton Highrise', dev:'Apex', price:'₹1.12Cr', sqft:'1650 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'High-rise · Premium amenities', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'RPS Aroma Valley', dev:'RPS', price:'₹80L', sqft:'1280 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Valley living · Affordable premium', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'Sector 50 Noida 2BHK', dev:'Prime', price:'₹75L', sqft:'1200 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Well-established · Commercial hub', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'Sector 50 Noida 3BHK', dev:'Prime', price:'₹1.05Cr', sqft:'1500 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Premium living · Good amenities', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'Apex Court', dev:'Apex', price:'₹95L', sqft:'1400 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Court living · Central Noida', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'RPS Savana', dev:'RPS', price:'₹88L', sqft:'1320 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Savana township · Good connectivity', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'Sector 50 Luxury Flat', dev:'Luxury', price:'₹1.20Cr', sqft:'1700 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Luxury finish · Premium location', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Sector 50 Investment Property', dev:'Prime', price:'₹82L', sqft:'1250 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Investment grade · Good rental', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ],
    'Sector 150': [
      { name:'Ace Divino', dev:'Ace', price:'₹58L', sqft:'1100 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Divino township · Affordable', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Mahagun Mywoods', dev:'Mahagun', price:'₹62L', sqft:'1150 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Wood township · Nature-inspired', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Akshay Path', dev:'Akshay', price:'₹60L', sqft:'1120 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'Path community · Growing area', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'Sector 150 Budget Option', dev:'Prime', price:'₹55L', sqft:'1000 sq ft', bhk:'1 BHK', status:'Ready to Move', ready_to_move:true, lm:'Budget-friendly · New area', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'Sector 150 Investment', dev:'Prime', price:'₹64L', sqft:'1180 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Investment hotspot · High growth', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'Affordable Living Sector 150', dev:'Affordable', price:'₹52L', sqft:'950 sq ft', bhk:'1 BHK', status:'Ready to Move', ready_to_move:true, lm:'Pocket-friendly · New development', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'Sector 150 Premium 2BHK', dev:'Premium', price:'₹70L', sqft:'1250 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Premium in affordable · Best value', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'Green Sector 150', dev:'Green', price:'₹65L', sqft:'1200 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Green community · Eco-friendly', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'Sector 150 Family Flat', dev:'Family', price:'₹68L', sqft:'1220 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Family housing · Good amenities', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Sector 150 3BHK Affordable', dev:'Prime', price:'₹92L', sqft:'1450 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'3BHK affordable · Good layout', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ],
    'Noida City Centre': [
      { name:'Lodha Amara', dev:'Lodha', price:'₹1.25Cr', sqft:'1700 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Metro station · Premium tower', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Purvanchal Royal City', dev:'Purvanchal', price:'₹1.10Cr', sqft:'1600 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'City centre · Royal township', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Noida City Centre Premium', dev:'Prime', price:'₹1.30Cr', sqft:'1750 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Metro-adjacent · Premium living', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'City Centre 2BHK', dev:'Prime', price:'₹95L', sqft:'1400 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Metro station · Commercial', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'Central Plaza Noida', dev:'Central', price:'₹1.15Cr', sqft:'1650 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Central location · Business hub', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'City Centre Luxury', dev:'Luxury', price:'₹1.45Cr', sqft:'1900 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Luxury living · Metro-ready', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'Noida CC Business Flat', dev:'Business', price:'₹1.05Cr', sqft:'1550 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Business district · Work-live', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'CC Premium Residences', dev:'Premium', price:'₹1.35Cr', sqft:'1800 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Premium amenities · Metro station', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'City Centre Family Apartment', dev:'Family', price:'₹1.00Cr', sqft:'1500 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Family-friendly · All facilities', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Noida CC Investment Property', dev:'Prime', price:'₹1.20Cr', sqft:'1700 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Investment-grade · Good rental', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ]
  },
  mumbai: {
    'Powai': [
      { name:'Lodha Altamount', dev:'Lodha', price:'₹5Cr', sqft:'2000 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Premium township · IT hub', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Hiranandani Powai', dev:'Hiranandani', price:'₹4.5Cr', sqft:'1850 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Iconic location · Premium society', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Oberoi Splendor', dev:'Oberoi', price:'₹6Cr', sqft:'2200 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Splendid living · Luxury tower', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'Tata Eureka Park', dev:'Tata', price:'₹3.8Cr', sqft:'1600 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Park-facing · Quality living', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'HDIL Grace', dev:'HDIL', price:'₹4.2Cr', sqft:'1750 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Graceful design · Premium amenities', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'Powai Lake View', dev:'Prime', price:'₹4Cr', sqft:'1700 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Lake-facing · Premium location', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'Powai 2BHK Flat', dev:'Prime', price:'₹3Cr', sqft:'1300 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Good amenities · Well-connected', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'One Premium Society', dev:'One', price:'₹5.5Cr', sqft:'2100 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Premium society · High-end finish', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'Powai Eco Living', dev:'Eco', price:'₹3.5Cr', sqft:'1500 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Eco-friendly · Green spaces', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Powai 4BHK Luxury', dev:'Prime', price:'₹7Cr', sqft:'2600 sq ft', bhk:'4 BHK', status:'Ready to Move', ready_to_move:true, lm:'Luxury apartment · Premium location', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ],
    'Bandra': [
      { name:'Bandra Fort Tower', dev:'Grand', price:'₹8Cr', sqft:'2400 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Fort-facing · Iconic view', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Three Sixty West', dev:'Lodha', price:'₹9Cr', sqft:'2500 sq ft', bhk:'3 BHK', status:'Under Construction', ready_to_move:false, lm:'Waterfront · Premium tower', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Bandra Mount Mary', dev:'Hiranandani', price:'₹7.5Cr', sqft:'2200 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Mount view · Premium society', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'Bandra Bandstand', dev:'Prime', price:'₹6.5Cr', sqft:'2000 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Bandstand proximity · Sea view', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'Linking Road Residency', dev:'Link', price:'₹5.8Cr', sqft:'1850 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Linking Road · Commercial proximity', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'Bandra Premium Apartment', dev:'Prime', price:'₹5Cr', sqft:'1700 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Central Bandra · Good amenities', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'Bandra Sea Face Villa', dev:'Prime', price:'₹15Cr', sqft:'4000 sq ft', bhk:'4 BHK', status:'Ready to Move', ready_to_move:true, lm:'Sea-facing · Luxury villa', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'Bandra East Tower', dev:'Grand', price:'₹6Cr', sqft:'1900 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'East side · Good location', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'Bandra Residential Flat', dev:'Apt', price:'₹4.5Cr', sqft:'1600 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Well-maintained · Good society', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Bandra Luxury Suite', dev:'Prime', price:'₹7.5Cr', sqft:'2300 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Luxury finish · Premium location', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ],
    'Andheri': [
      { name:'Andheri Premium Tower', dev:'Premium', price:'₹2.5Cr', sqft:'1500 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Metro adjacent · Well-developed', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Western Express Plaza', dev:'Western', price:'₹2.8Cr', sqft:'1700 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Express highway · Good connectivity', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Andheri East Residency', dev:'East', price:'₹2.3Cr', sqft:'1400 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'East Andheri · Commercial area', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'Veera Desai Road Flat', dev:'Veera', price:'₹2.1Cr', sqft:'1250 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Desai Road · Good locality', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'Andheri Premium Living', dev:'Premium', price:'₹2.6Cr', sqft:'1600 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Premium finish · Well-developed', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'Andheri Budget Friendly', dev:'Budget', price:'₹1.8Cr', sqft:'1100 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Affordable · Good connectivity', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'Andheri Commercial Plus', dev:'Commercial', price:'₹2.2Cr', sqft:'1350 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Mixed-use · Commercial area', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'WE Metro Apartment', dev:'WE', price:'₹2.4Cr', sqft:'1500 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'Metro proximity · City living', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'Andheri Family Housing', dev:'Family', price:'₹1.9Cr', sqft:'1200 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Family-friendly · Good schools', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Andheri Investment Property', dev:'Prime', price:'₹2.7Cr', sqft:'1700 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Investment-grade · Good rental', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ],
    'Thane': [
      { name:'Thane Premium Tower', dev:'Premium', price:'₹1.2Cr', sqft:'1400 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Well-developed · Good connectivity', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Thane Central Plaza', dev:'Central', price:'₹1.1Cr', sqft:'1300 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Central Thane · Commercial', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Thane East Residency', dev:'East', price:'₹0.95Cr', sqft:'1150 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'East Thane · Suburban', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'Thane Budget Living', dev:'Budget', price:'₹0.85Cr', sqft:'1050 sq ft', bhk:'1 BHK', status:'Ready to Move', ready_to_move:true, lm:'Budget-friendly · Growing area', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'Thane Premium Living', dev:'Premium', price:'₹1.3Cr', sqft:'1550 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Premium finish · Good amenities', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'Thane Affordable Premium', dev:'Affordable', price:'₹1.0Cr', sqft:'1250 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Affordable premium · Best value', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'Thane Green Living', dev:'Green', price:'₹1.15Cr', sqft:'1400 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Green spaces · Eco-community', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'Thane Family Apartment', dev:'Family', price:'₹1.05Cr', sqft:'1300 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Family-friendly · Schools nearby', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'Thane Investment Grade', dev:'Prime', price:'₹1.25Cr', sqft:'1500 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Investment-grade · Growing area', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Thane Premium Villa', dev:'Villa', price:'₹2.0Cr', sqft:'2000 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Villa living · Spacious plots', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ],
    'Navi Mumbai': [
      { name:'Navi Mumbai Modern Tower', dev:'Modern', price:'₹0.95Cr', sqft:'1300 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Planned city · Good infrastructure', image_url:'https://images.unsplash.com/photo-1545324418-cc1a9a6fded0?w=800&h=600&fit=crop' },
      { name:'Navi Mumbai Central Plaza', dev:'Central', price:'₹0.85Cr', sqft:'1200 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'Central location · Commercial', image_url:'https://images.unsplash.com/photo-1570129477492-45ac003edd8f?w=800&h=600&fit=crop' },
      { name:'Navi Mumbai Green City', dev:'Green', price:'₹0.80Cr', sqft:'1150 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Green spaces · Eco-friendly', image_url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop' },
      { name:'Navi Mumbai Budget Option', dev:'Budget', price:'₹0.72Cr', sqft:'1050 sq ft', bhk:'1 BHK', status:'Ready to Move', ready_to_move:true, lm:'Value for money · Growing', image_url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' },
      { name:'Navi Mumbai Premium Living', dev:'Premium', price:'₹1.1Cr', sqft:'1500 sq ft', bhk:'3 BHK', status:'Ready to Move', ready_to_move:true, lm:'Premium finish · Modern layout', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop' },
      { name:'Navi Mumbai Affordable Premium', dev:'Affordable', price:'₹0.90Cr', sqft:'1250 sq ft', bhk:'2 BHK', status:'New Launch', ready_to_move:false, lm:'Affordable premium · Best value', image_url:'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&h=600&fit=crop' },
      { name:'Navi Mumbai Commercial Plus', dev:'Commercial', price:'₹1.0Cr', sqft:'1350 sq ft', bhk:'2 BHK', status:'Under Construction', ready_to_move:false, lm:'Mixed-use · Business hub', image_url:'https://images.unsplash.com/photo-1512891691857-68ad6f1011a0?w=800&h=600&fit=crop' },
      { name:'Navi Mumbai Family Flats', dev:'Family', price:'₹0.88Cr', sqft:'1200 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Family-friendly · Schools nearby', image_url:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop' },
      { name:'Navi Mumbai Investment Grade', dev:'Prime', price:'₹1.05Cr', sqft:'1400 sq ft', bhk:'2 BHK', status:'Ready to Move', ready_to_move:true, lm:'Investment hotspot · Good ROI', image_url:'https://images.unsplash.com/photo-1515320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop' },
      { name:'Navi Mumbai Premium Villa', dev:'Villa', price:'₹1.8Cr', sqft:'1900 sq ft', bhk:'3 BHK', status:'New Launch', ready_to_move:false, lm:'Villa living · Spacious plots', image_url:'https://images.unsplash.com/photo-1468619216002-b0b62d5d6fe3?w=800&h=600&fit=crop' }
    ]
  }
};

const LOCALITIES_DATA = {
  bangalore: {
    'Whitefield': { avg_price_sqft: 8500, yoy_growth: 12, metro_distance_min: 15, schools_count: 8, hospitals_count: 5, markets_count: 12, popular_insights: 'Tech hub, growing infrastructure, good connectivity', rank: 1 },
    'Marathahalli': { avg_price_sqft: 8200, yoy_growth: 10, metro_distance_min: 8, schools_count: 7, hospitals_count: 4, markets_count: 10, popular_insights: 'Central location, metro adjacent, premium finishes', rank: 2 },
    'Sarjapur Road': { avg_price_sqft: 7800, yoy_growth: 14, metro_distance_min: 25, schools_count: 6, hospitals_count: 3, markets_count: 8, popular_insights: 'Emerging area, tech corridor, good value', rank: 3 },
    'HSR Layout': { avg_price_sqft: 9200, yoy_growth: 8, metro_distance_min: 5, schools_count: 9, hospitals_count: 6, markets_count: 15, popular_insights: 'South Bangalore, established layout, premium location', rank: 4 },
    'Electronic City': { avg_price_sqft: 8100, yoy_growth: 11, metro_distance_min: 20, schools_count: 5, hospitals_count: 3, markets_count: 7, popular_insights: 'IT hub, cyber corridor, tech proximity', rank: 5 }
  },
  noida: {
    'Sector 75': { avg_price_sqft: 6500, yoy_growth: 15, metro_distance_min: 3, schools_count: 8, hospitals_count: 5, markets_count: 15, popular_insights: 'Metro adjacent, commercial hub, high growth', rank: 1 },
    'Sector 137': { avg_price_sqft: 6200, yoy_growth: 18, metro_distance_min: 2, schools_count: 6, hospitals_count: 4, markets_count: 12, popular_insights: 'Emerging locality, metro ready, investment hotspot', rank: 2 },
    'Sector 50': { avg_price_sqft: 7100, yoy_growth: 12, metro_distance_min: 1, schools_count: 7, hospitals_count: 5, markets_count: 18, popular_insights: 'Central Noida, commercial, well-established', rank: 3 },
    'Sector 150': { avg_price_sqft: 5800, yoy_growth: 22, metro_distance_min: 8, schools_count: 5, hospitals_count: 3, markets_count: 8, popular_insights: 'High growth, affordable, new developments', rank: 4 },
    'Noida City Centre': { avg_price_sqft: 7600, yoy_growth: 10, metro_distance_min: 0, schools_count: 9, hospitals_count: 6, markets_count: 20, popular_insights: 'Metro station, premium location, business hub', rank: 5 }
  },
  mumbai: {
    'Powai': { avg_price_sqft: 18000, yoy_growth: 8, metro_distance_min: 3, schools_count: 7, hospitals_count: 4, markets_count: 10, popular_insights: 'IT hub, upscale living, premium locality', rank: 1 },
    'Bandra': { avg_price_sqft: 22000, yoy_growth: 5, metro_distance_min: 2, schools_count: 8, hospitals_count: 5, markets_count: 18, popular_insights: 'Iconic location, celebrity zone, high prices', rank: 2 },
    'Andheri': { avg_price_sqft: 15500, yoy_growth: 10, metro_distance_min: 1, schools_count: 9, hospitals_count: 6, markets_count: 20, popular_insights: 'Well-developed, metro adjacent, commercial', rank: 3 },
    'Thane': { avg_price_sqft: 8500, yoy_growth: 16, metro_distance_min: 25, schools_count: 7, hospitals_count: 5, markets_count: 12, popular_insights: 'Affordable premium, growing area, good connectivity', rank: 4 },
    'Navi Mumbai': { avg_price_sqft: 7200, yoy_growth: 14, metro_distance_min: 30, schools_count: 6, hospitals_count: 4, markets_count: 10, popular_insights: 'Planned city, value for money, infrastructure ready', rank: 5 }
  }
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting complete database seeding...\n');

    console.log('📋 Clearing existing data...');
    await supabase.from('real_properties').delete().neq('id', null);
    await supabase.from('real_localities').delete().neq('id', null);
    console.log('✓ Cleared tables\n');

    console.log('🏘️  Seeding localities...');
    let localityCount = 0;
    for (const [city, localities] of Object.entries(LOCALITIES_DATA)) {
      for (const [locality, metadata] of Object.entries(localities)) {
        const { error } = await supabase.from('real_localities').insert({
          city: city.toLowerCase(),
          name: locality,
          avg_price_sqft: metadata.avg_price_sqft,
          yoy_growth: metadata.yoy_growth,
          metro_distance_min: metadata.metro_distance_min,
          schools_count: metadata.schools_count,
          hospitals_count: metadata.hospitals_count,
          markets_count: metadata.markets_count,
          popular_insights: metadata.popular_insights,
          rank: metadata.rank
        });
        if (!error) localityCount++;
      }
    }
    console.log(`✓ Seeded ${localityCount} localities\n`);

    console.log('🏢 Seeding properties (this may take a moment)...');
    let propertyCount = 0;
    for (const [city, localityData] of Object.entries(ALL_PROPERTIES)) {
      for (const [locality, properties] of Object.entries(localityData)) {
        for (const prop of properties) {
          const transformed = transformProperty(prop, city, locality);
          const { error } = await supabase.from('real_properties').insert(transformed);
          if (!error) {
            propertyCount++;
            if (propertyCount % 50 === 0) {
              console.log(`  ✓ ${propertyCount} properties seeded...`);
            }
          }
        }
      }
    }
    console.log(`✓ Seeded ${propertyCount} properties\n`);

    console.log('✅ Database seeding complete!');
    console.log(`   📍 Localities: ${localityCount}`);
    console.log(`   🏠 Properties: ${propertyCount}`);
    console.log(`   📊 Total: ${localityCount + propertyCount} records`);
    console.log('\n🎉 All 150 properties + 15 localities now stored in Supabase!');
    console.log('📱 Homepage will fetch real data from Supabase on next load.\n');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
