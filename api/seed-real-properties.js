const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qlfttxrnnjueycffwdmy.supabase.co';
const supabaseServiceKey = 'sb_secret_ipXzLH_HMaBfGSvSQwDuDA_uAu_xXOs';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Transform price string to number (e.g., "₹1.96 Cr" → 19600000)
function parsePrice(priceStr) {
  const str = priceStr.replace('₹', '').trim();
  if (str.includes('Cr')) {
    return parseFloat(str) * 10000000;
  } else if (str.includes('L')) {
    return parseFloat(str) * 100000;
  }
  return 0;
}

// Extract BHK number (e.g., "3 BHK" → 3)
function parseBHK(bhkStr) {
  const match = bhkStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

// Extract area in sqft
function parseArea(sqftStr) {
  const match = sqftStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// Transform property object to Supabase schema
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
    bhk: [parseBHK(prop.bhk)],
    price_min: Math.round(priceMin),
    price_max: Math.round(priceMax),
    price_avg_sqft: pricePerSqft,
    area_sqft: area,
    status: prop.status,
    ready_to_move: prop.ready_to_move || false,
    rera_number: null,
    possession_date: null,
    landmarks: {
      highlights: [prop.lm] || []
    },
    amenities: [],
    image_url: prop.image_url,
    listing_url: null
  };
}

// Locality metadata
const LOCALITIES_DATA = {
  bangalore: {
    'Whitefield': {
      avg_price_sqft: 8500,
      yoy_growth: 12,
      metro_distance_min: 15,
      schools_count: 8,
      hospitals_count: 5,
      markets_count: 12,
      popular_insights: ['Tech hub', 'Growing infrastructure', 'Good connectivity'],
      rank: 1
    },
    'Marathahalli': {
      avg_price_sqft: 8200,
      yoy_growth: 10,
      metro_distance_min: 8,
      schools_count: 7,
      hospitals_count: 4,
      markets_count: 10,
      popular_insights: ['Central location', 'Metro adjacent', 'Premium finishes'],
      rank: 2
    },
    'Sarjapur Road': {
      avg_price_sqft: 7800,
      yoy_growth: 14,
      metro_distance_min: 25,
      schools_count: 6,
      hospitals_count: 3,
      markets_count: 8,
      popular_insights: ['Emerging area', 'Tech corridor', 'Good value'],
      rank: 3
    },
    'HSR Layout': {
      avg_price_sqft: 9200,
      yoy_growth: 8,
      metro_distance_min: 5,
      schools_count: 9,
      hospitals_count: 6,
      markets_count: 15,
      popular_insights: ['South Bangalore', 'Established layout', 'Premium location'],
      rank: 4
    },
    'Electronic City': {
      avg_price_sqft: 8100,
      yoy_growth: 11,
      metro_distance_min: 20,
      schools_count: 5,
      hospitals_count: 3,
      markets_count: 7,
      popular_insights: ['IT hub', 'Cyber corridor', 'Tech proximity'],
      rank: 5
    }
  },
  noida: {
    'Sector 75': {
      avg_price_sqft: 6500,
      yoy_growth: 15,
      metro_distance_min: 3,
      schools_count: 8,
      hospitals_count: 5,
      markets_count: 15,
      popular_insights: ['Metro adjacent', 'Commercial hub', 'High growth'],
      rank: 1
    },
    'Sector 137': {
      avg_price_sqft: 6200,
      yoy_growth: 18,
      metro_distance_min: 2,
      schools_count: 6,
      hospitals_count: 4,
      markets_count: 12,
      popular_insights: ['Emerging locality', 'Metro ready', 'Investment hotspot'],
      rank: 2
    },
    'Sector 50': {
      avg_price_sqft: 7100,
      yoy_growth: 12,
      metro_distance_min: 1,
      schools_count: 7,
      hospitals_count: 5,
      markets_count: 18,
      popular_insights: ['Central Noida', 'Commercial', 'Well-established'],
      rank: 3
    },
    'Sector 150': {
      avg_price_sqft: 5800,
      yoy_growth: 22,
      metro_distance_min: 8,
      schools_count: 5,
      hospitals_count: 3,
      markets_count: 8,
      popular_insights: ['High growth', 'Affordable', 'New developments'],
      rank: 4
    },
    'Noida City Centre': {
      avg_price_sqft: 7600,
      yoy_growth: 10,
      metro_distance_min: 0,
      schools_count: 9,
      hospitals_count: 6,
      markets_count: 20,
      popular_insights: ['Metro station', 'Premium location', 'Business hub'],
      rank: 5
    }
  },
  mumbai: {
    'Powai': {
      avg_price_sqft: 18000,
      yoy_growth: 8,
      metro_distance_min: 3,
      schools_count: 7,
      hospitals_count: 4,
      markets_count: 10,
      popular_insights: ['IT hub', 'Upscale living', 'Premium locality'],
      rank: 1
    },
    'Bandra': {
      avg_price_sqft: 22000,
      yoy_growth: 5,
      metro_distance_min: 2,
      schools_count: 8,
      hospitals_count: 5,
      markets_count: 18,
      popular_insights: ['Iconic location', 'Celebrity zone', 'High prices'],
      rank: 2
    },
    'Andheri': {
      avg_price_sqft: 15500,
      yoy_growth: 10,
      metro_distance_min: 1,
      schools_count: 9,
      hospitals_count: 6,
      markets_count: 20,
      popular_insights: ['Well-developed', 'Metro adjacent', 'Commercial'],
      rank: 3
    },
    'Thane': {
      avg_price_sqft: 8500,
      yoy_growth: 16,
      metro_distance_min: 25,
      schools_count: 7,
      hospitals_count: 5,
      markets_count: 12,
      popular_insights: ['Affordable premium', 'Growing area', 'Good connectivity'],
      rank: 4
    },
    'Navi Mumbai': {
      avg_price_sqft: 7200,
      yoy_growth: 14,
      metro_distance_min: 30,
      schools_count: 6,
      hospitals_count: 4,
      markets_count: 10,
      popular_insights: ['Planned city', 'Value for money', 'Infrastructure ready'],
      rank: 5
    }
  }
};

// Mock property data (simplified version - in production you'd extract from MOCK_DATA)
const MOCK_PROPERTIES = {
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
    ]
  }
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Step 1: Clear existing data (optional)
    console.log('📋 Clearing existing data...');
    await supabase.from('real_properties').delete().neq('id', null);
    await supabase.from('real_localities').delete().neq('id', null);
    console.log('✓ Cleared existing tables\n');

    // Step 2: Seed localities
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

    // Step 3: Seed properties
    console.log('🏢 Seeding properties...');
    let propertyCount = 0;
    for (const [city, localityData] of Object.entries(MOCK_PROPERTIES)) {
      for (const [locality, properties] of Object.entries(localityData)) {
        for (const prop of properties) {
          const transformed = transformProperty(prop, city, locality);
          const { error } = await supabase.from('real_properties').insert(transformed);
          if (!error) propertyCount++;
        }
      }
    }
    console.log(`✓ Seeded ${propertyCount} properties\n`);

    console.log('✅ Database seeding complete!');
    console.log(`   📍 Localities: ${localityCount}`);
    console.log(`   🏠 Properties: ${propertyCount}`);
    console.log('\n🎉 Homepage will now fetch real data from Supabase on next load!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
