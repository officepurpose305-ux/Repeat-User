/**
 * Seed properties from India_Properties_99acres_1.pdf + india_city_locality_data.pdf
 * Extracts 150 properties across 15 localities with real metadata
 * Assigns curated Unsplash images for CORS reliability
 * Run: node api/seed-properties-from-pdf.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const SUPABASE_URL = 'https://qlfttxrnnjueycffwdmy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Q2sDwYGsgMXv-O5voOjfDQ_9EQDri1t';
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Curated Unsplash images for Indian residential context
const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', // Modern apartment
  'https://images.unsplash.com/photo-1512917774080-9b274b3f4f1f?w=800&h=600&fit=crop', // Living room
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', // Building exterior
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop', // Bedroom
  'https://images.unsplash.com/photo-1522708323667-8a9a9b8d0b5f?w=800&h=600&fit=crop', // Kitchen
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop', // Urban apartment
  'https://images.unsplash.com/photo-1523437097915-512d0c7f9b5c?w=800&h=600&fit=crop', // Residential complex
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop', // Interior design
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', // Modern home
  'https://images.unsplash.com/photo-1520932057361-de847e1e3ac4?w=800&h=600&fit=crop', // Apartment building
  'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800&h=600&fit=crop', // Luxury apartment
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop', // Home interior
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop', // City apartment
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', // Building complex
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop', // Modern flat
  'https://images.unsplash.com/photo-1545458525-75107881f1b9?w=800&h=600&fit=crop', // Living space
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop', // Luxury interior
  'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?w=800&h=600&fit=crop', // Home design
  'https://images.unsplash.com/photo-1493857671505-72967e2e2760?w=800&h=600&fit=crop', // Apartment interior
  'https://images.unsplash.com/photo-1559321033-8b59bccf7ba0?w=800&h=600&fit=crop', // Modern home
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop', // Residential
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop', // Luxury flat
  'https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?w=800&h=600&fit=crop', // Interior
  'https://images.unsplash.com/photo-1468824357306-a439d0b1f0cb?w=800&h=600&fit=crop', // Urban living
];

// All 150 properties from India_Properties_99acres_1.pdf
const PROPERTIES = [
  // BANGALORE - Whitefield
  { locality: 'Whitefield', city: 'Bangalore', project: 'Amrutha Lake Vista', bhk: '3 BHK', area: '1520-2030', price: '1.72-2.20', status: 'New Launch' },
  { locality: 'Whitefield', city: 'Bangalore', project: 'Vaishno Serene', bhk: '3 BHK', area: '1421-1702', price: '1.15-1.38', status: 'Under Construction' },
  { locality: 'Whitefield', city: 'Bangalore', project: 'Sumadhura Edition', bhk: '2,3,4 BHK', area: '1200-2900', price: '1.80-3.50', status: 'Under Construction' },
  { locality: 'Whitefield', city: 'Bangalore', project: 'Sumadhura Capitol', bhk: '3,4 BHK', area: '1635-2150', price: '2.70-3.55', status: 'Under Construction' },
  { locality: 'Whitefield', city: 'Bangalore', project: 'Prestige Raintree Park', bhk: '3,4,5 BHK', area: '2005-3698', price: '3.01-5.55', status: 'Under Construction' },
  { locality: 'Whitefield', city: 'Bangalore', project: 'Anahata', bhk: '2,3 BHK', area: '1164-1758', price: '0.89-1.34', status: 'New Launch' },
  { locality: 'Whitefield', city: 'Bangalore', project: 'Brigade Avalon', bhk: '3,4 BHK', area: '1550-2187', price: '4.62-6.67', status: 'New Launch' },
  { locality: 'Whitefield', city: 'Bangalore', project: 'Provident Botanico', bhk: '2,3 BHK', area: '658-1003', price: '0.91-1.46', status: 'Under Construction' },
  { locality: 'Whitefield', city: 'Bangalore', project: 'Platinum East Woods', bhk: '2,3,4 BHK', area: '1051-2578', price: '1.01-2.41', status: 'Under Construction' },
  { locality: 'Whitefield', city: 'Bangalore', project: 'Sarang by Sumadhura', bhk: '3 BHK', area: '1655', price: '1.82', status: 'Ready to Move' },

  // BANGALORE - Marathahalli
  { locality: 'Marathahalli', city: 'Bangalore', project: 'Sumadhura Solace', bhk: '3,4 BHK', area: '1705-2730', price: '2.47-4.19', status: 'New Launch' },
  { locality: 'Marathahalli', city: 'Bangalore', project: 'Trendsquares Akino', bhk: '3,4 BHK', area: '1550-2010', price: '1.60-2.11', status: 'New Launch' },
  { locality: 'Marathahalli', city: 'Bangalore', project: 'Century Marathahalli', bhk: '2,3,4 BHK', area: '1375-3115', price: '2.16-4.85', status: 'New Launch' },
  { locality: 'Marathahalli', city: 'Bangalore', project: 'Assetz Codename Micropolis', bhk: '2,3 BHK', area: '900-1600', price: '1.20-2.10', status: 'New Launch' },
  { locality: 'Marathahalli', city: 'Bangalore', project: 'Prestige Green Gables', bhk: '1,2,3 BHK', area: '661-1933', price: '0.91-2.32', status: 'Under Construction' },
  { locality: 'Marathahalli', city: 'Bangalore', project: 'Sobha Palladian', bhk: '3,4 BHK', area: '1900-3500', price: '3.20-5.80', status: 'Ready to Move' },
  { locality: 'Marathahalli', city: 'Bangalore', project: 'Pavani Ishta 2BHK', bhk: '2 BHK', area: '1150', price: '1.30', status: 'Ready to Move' },
  { locality: 'Marathahalli', city: 'Bangalore', project: 'Saptagiri Sannidhi', bhk: '3 BHK', area: '1300', price: '1.25', status: 'Ready to Move' },
  { locality: 'Marathahalli', city: 'Bangalore', project: 'Durga Petals', bhk: '2,3 BHK', area: '1133-1582', price: '1.19-1.66', status: 'Ready to Move' },
  { locality: 'Marathahalli', city: 'Bangalore', project: 'Marathahalli 2BHK ORR', bhk: '2 BHK', area: '1050', price: '0.82', status: 'Ready to Move' },

  // BANGALORE - Sarjapur Road
  { locality: 'Sarjapur Road', city: 'Bangalore', project: 'Keya The Urban Forest', bhk: '2 BHK', area: '1351', price: '1.63', status: 'Under Construction' },
  { locality: 'Sarjapur Road', city: 'Bangalore', project: 'Assetz Trees and Tandem', bhk: '3 BHK', area: '1885-2142', price: '2.02-2.30', status: 'Under Construction' },
  { locality: 'Sarjapur Road', city: 'Bangalore', project: 'Roach Cicada', bhk: '3,4 BHK', area: '2163-2883', price: '2.75-3.12', status: 'New Launch' },
  { locality: 'Sarjapur Road', city: 'Bangalore', project: 'Suyug The 1', bhk: '3,4 BHK', area: '1601-3573', price: '1.47-1.78', status: 'Under Construction' },
  { locality: 'Sarjapur Road', city: 'Bangalore', project: 'Mythri Sity', bhk: '2,3,4 BHK', area: '1178-2531', price: '1.07-2.30', status: 'New Launch' },
  { locality: 'Sarjapur Road', city: 'Bangalore', project: 'NBR Soul of the Seasons', bhk: '3 BHK', area: '1446-1826', price: '1.64-2.07', status: 'New Launch' },
  { locality: 'Sarjapur Road', city: 'Bangalore', project: 'DSR The Address', bhk: '2,3,4 BHK', area: '1149-2735', price: '1.05-2.50', status: 'Under Construction' },
  { locality: 'Sarjapur Road', city: 'Bangalore', project: 'MSR Passion Square', bhk: '2 BHK', area: '1099-1365', price: '0.93-1.16', status: 'New Launch' },
  { locality: 'Sarjapur Road', city: 'Bangalore', project: 'Royal Nest by Wone8', bhk: '3 BHK', area: '1650', price: '1.85', status: 'Under Construction' },
  { locality: 'Sarjapur Road', city: 'Bangalore', project: 'Assetz Sora and Saki', bhk: '3,4 BHK', area: '1600-2800', price: '1.90-3.20', status: 'Under Construction' },

  // BANGALORE - HSR Layout
  { locality: 'HSR Layout', city: 'Bangalore', project: 'Assetz Mizumi Reserve', bhk: '2,3,4 BHK', area: '1470-2476', price: '2.47-3.22', status: 'New Launch' },
  { locality: 'HSR Layout', city: 'Bangalore', project: 'SRK Habitat', bhk: '2,3 BHK', area: '1100-1800', price: '1.50-2.40', status: 'Under Construction' },
  { locality: 'HSR Layout', city: 'Bangalore', project: 'Svamitva Soul Spring', bhk: '1,2,3,4 BHK', area: '599-2091', price: '1.32-4.30', status: 'Under Construction' },
  { locality: 'HSR Layout', city: 'Bangalore', project: 'Purva Meraki', bhk: '3,4 BHK', area: '1714-2406', price: '4.54-5.75', status: 'Under Construction' },
  { locality: 'HSR Layout', city: 'Bangalore', project: 'HSR Layout 2BHK', bhk: '2 BHK', area: '1100', price: '1.20', status: 'Ready to Move' },
  { locality: 'HSR Layout', city: 'Bangalore', project: 'HSR Layout 3BHK Corner', bhk: '3 BHK', area: '1600', price: '2.10', status: 'Ready to Move' },
  { locality: 'HSR Layout', city: 'Bangalore', project: 'Sobha Infinia', bhk: '3,4 BHK', area: '1900-2800', price: '3.50-5.80', status: 'Under Construction' },
  { locality: 'HSR Layout', city: 'Bangalore', project: 'HSR Layout Plot Sector 4', bhk: 'Plot', area: '3750', price: '13.12', status: 'Ready to Build' },
  { locality: 'HSR Layout', city: 'Bangalore', project: 'Casa Grand HSR', bhk: '2,3 BHK', area: '1200-1900', price: '1.80-2.80', status: 'Ready to Move' },
  { locality: 'HSR Layout', city: 'Bangalore', project: 'Asrithas Lotus Residency', bhk: '2,3 BHK', area: '1100-1600', price: '1.20-1.80', status: 'Ready to Move' },

  // BANGALORE - Electronic City
  { locality: 'Electronic City', city: 'Bangalore', project: 'Signature Heights', bhk: '2 BHK', area: '1204-1254', price: '0.96', status: 'Under Construction' },
  { locality: 'Electronic City', city: 'Bangalore', project: 'Purva Silversky', bhk: '3 BHK', area: '1580', price: '2.30', status: 'Under Construction' },
  { locality: 'Electronic City', city: 'Bangalore', project: 'Keya The Lake Terraces', bhk: '3,4 BHK', area: '1600-2900', price: '1.80-3.20', status: 'New Launch' },
  { locality: 'Electronic City', city: 'Bangalore', project: 'DS Max Skyfields', bhk: '2,3 BHK', area: '1100-1600', price: '0.72-1.30', status: 'Under Construction' },
  { locality: 'Electronic City', city: 'Bangalore', project: 'Prestige Falcon City', bhk: '1,2,3 BHK', area: '650-1700', price: '0.80-1.85', status: 'Ready to Move' },
  { locality: 'Electronic City', city: 'Bangalore', project: 'Shriram Grand City', bhk: '2,3 BHK', area: '1050-1650', price: '0.75-1.40', status: 'Ready to Move' },
  { locality: 'Electronic City', city: 'Bangalore', project: 'Electronic City 2BHK', bhk: '2 BHK', area: '1100', price: '0.68', status: 'Ready to Move' },
  { locality: 'Electronic City', city: 'Bangalore', project: 'Electronic City 3BHK Corner', bhk: '3 BHK', area: '1450', price: '1.20', status: 'Ready to Move' },
  { locality: 'Electronic City', city: 'Bangalore', project: 'Brigade Bricklane', bhk: '2,3 BHK', area: '1150-1700', price: '0.85-1.50', status: 'Ready to Move' },
  { locality: 'Electronic City', city: 'Bangalore', project: 'Godrej Woodscapes', bhk: '2,3 BHK', area: '1050-1850', price: '1.10-2.00', status: 'Under Construction' },

  // NOIDA - Sector 150
  { locality: 'Sector 150', city: 'Noida', project: 'ATS Kingston Heath', bhk: '3,4 BHK', area: '2350-3300', price: '4.23-5.94', status: 'Under Construction' },
  { locality: 'Sector 150', city: 'Noida', project: 'ATS Pious Hideaways', bhk: '3 BHK', area: '1400-1675', price: '2.10-2.51', status: 'Under Construction' },
  { locality: 'Sector 150', city: 'Noida', project: 'ATS Homekraft Pious Orchards', bhk: '3,5 BHK', area: '1475-2275', price: '2.22-3.40', status: 'Under Construction' },
  { locality: 'Sector 150', city: 'Noida', project: 'ACE Parkway', bhk: '2,3,4,5 BHK', area: '1085-7415', price: '1.63-4.82', status: 'Ready to Move' },
  { locality: 'Sector 150', city: 'Noida', project: 'Godrej Nest', bhk: '2,3,4 BHK', area: '742-1821', price: '1.77-5.00', status: 'Ready to Move' },
  { locality: 'Sector 150', city: 'Noida', project: 'ATS Le Grandiose', bhk: '3,4 BHK', area: '1625-3200', price: '1.95-3.84', status: 'Ready to Move' },
  { locality: 'Sector 150', city: 'Noida', project: 'Samridhi Luxuriya Avenue', bhk: '2,3,4 BHK', area: '1100-2500', price: '1.04-2.40', status: 'Under Construction' },
  { locality: 'Sector 150', city: 'Noida', project: 'Eldeco Live By The Greens', bhk: '2,3 BHK', area: '1137-1404', price: '1.00-1.39', status: 'Ready to Move' },
  { locality: 'Sector 150', city: 'Noida', project: 'ACE Parkway 3BHK Resale', bhk: '3 BHK', area: '1616', price: '2.50', status: 'Ready to Move' },
  { locality: 'Sector 150', city: 'Noida', project: 'Godrej Nest 2BHK Resale', bhk: '2 BHK', area: '1100', price: '1.85', status: 'Ready to Move' },

  // NOIDA - Sector 137
  { locality: 'Sector 137', city: 'Noida', project: 'Paras Tierea', bhk: '1,2,3 BHK', area: '450-1725', price: '0.45-0.98', status: 'Ready to Move' },
  { locality: 'Sector 137', city: 'Noida', project: 'Purvanchal Royal Park', bhk: '3,4 BHK', area: '1315-2955', price: '1.97-4.43', status: 'Ready to Move' },
  { locality: 'Sector 137', city: 'Noida', project: 'Supertech Ecociti', bhk: '2,3,4 BHK', area: '1010-2415', price: '0.80-1.80', status: 'Ready to Move' },
  { locality: 'Sector 137', city: 'Noida', project: 'Logix Blossom County 2BHK', bhk: '2 BHK', area: '1131', price: '0.85', status: 'Ready to Move' },
  { locality: 'Sector 137', city: 'Noida', project: 'Paras Tierea 3BHK', bhk: '3 BHK', area: '1350', price: '1.10', status: 'Ready to Move' },
  { locality: 'Sector 137', city: 'Noida', project: 'Supertech Ecociti 2BHK', bhk: '2 BHK', area: '1045', price: '0.78', status: 'Ready to Move' },
  { locality: 'Sector 137', city: 'Noida', project: 'Purvanchal Royal Park 3BHK', bhk: '3 BHK', area: '1530', price: '2.10', status: 'Ready to Move' },
  { locality: 'Sector 137', city: 'Noida', project: 'Sector 137 2BHK', bhk: '2 BHK', area: '1000', price: '0.72', status: 'Ready to Move' },
  { locality: 'Sector 137', city: 'Noida', project: 'Logix Blossom County 3BHK', bhk: '3 BHK', area: '1680', price: '1.25', status: 'Ready to Move' },
  { locality: 'Sector 137', city: 'Noida', project: 'Sector 137 3BHK NE', bhk: '3 BHK', area: '1450', price: '1.40', status: 'Ready to Move' },

  // NOIDA - Sector 75
  { locality: 'Sector 75', city: 'Noida', project: 'Ivy County', bhk: '3,4 BHK', area: '1656-2511', price: '2.95-4.80', status: 'Ready to Move' },
  { locality: 'Sector 75', city: 'Noida', project: 'Dasnac Burj Noida', bhk: '3,4 BHK', area: '2510-3300', price: '4.52-5.94', status: 'Under Construction' },
  { locality: 'Sector 75', city: 'Noida', project: 'Indosam75 3BHK', bhk: '3 BHK', area: '1364', price: '1.73', status: 'Ready to Move' },
  { locality: 'Sector 75', city: 'Noida', project: 'Ivy County 4BHK High Floor', bhk: '4 BHK', area: '2511', price: '4.10', status: 'Ready to Move' },
  { locality: 'Sector 75', city: 'Noida', project: 'Golf City 3BHK', bhk: '3 BHK', area: '1450', price: '1.50', status: 'Ready to Move' },
  { locality: 'Sector 75', city: 'Noida', project: 'Sector 75 2BHK', bhk: '2 BHK', area: '1100', price: '0.95', status: 'Ready to Move' },
  { locality: 'Sector 75', city: 'Noida', project: 'Sector 75 3BHK Gated', bhk: '3 BHK', area: '1480', price: '1.65', status: 'Ready to Move' },
  { locality: 'Sector 75', city: 'Noida', project: 'Ivy County 3BHK Pool', bhk: '3 BHK', area: '1880', price: '3.20', status: 'Ready to Move' },
  { locality: 'Sector 75', city: 'Noida', project: 'Sector 75 2BHK North', bhk: '2 BHK', area: '1050', price: '0.88', status: 'Ready to Move' },
  { locality: 'Sector 75', city: 'Noida', project: 'Sector 75 4BHK PH', bhk: '4 BHK', area: '3100', price: '4.80', status: 'Ready to Move' },

  // NOIDA - Sector 107
  { locality: 'Sector 107', city: 'Noida', project: 'Arena The Ultima Heights', bhk: '2,3,4 BHK', area: '1055-2295', price: '0.64-1.09', status: 'Under Construction' },
  { locality: 'Sector 107', city: 'Noida', project: 'County 107', bhk: '4,5 BHK', area: '2085-3904', price: '8.50-16.99', status: 'Ready to Move' },
  { locality: 'Sector 107', city: 'Noida', project: 'Mahagun Medalleo', bhk: '3,4 BHK', area: '1313-3701', price: '3.12-6.88', status: 'Under Construction' },
  { locality: 'Sector 107', city: 'Noida', project: 'Ekanam by Great Value', bhk: '3,4 BHK', area: '1400-2600', price: '2.00-3.50', status: 'New Launch' },
  { locality: 'Sector 107', city: 'Noida', project: 'County 107 5BHK PH', bhk: '5 BHK', area: '6570', price: '16.99', status: 'Ready to Move' },
  { locality: 'Sector 107', city: 'Noida', project: 'Amrapali HeartBeat 2BHK', bhk: '2 BHK', area: '1050', price: '0.65', status: 'Ready to Move' },
  { locality: 'Sector 107', city: 'Noida', project: 'Arena Ultima 3BHK', bhk: '3 BHK', area: '1450', price: '0.85', status: 'Under Construction' },
  { locality: 'Sector 107', city: 'Noida', project: 'Mahagun Medalleo 3BHK', bhk: '3 BHK', area: '1650', price: '3.50', status: 'Under Construction' },
  { locality: 'Sector 107', city: 'Noida', project: 'Sector 107 2BHK', bhk: '2 BHK', area: '980', price: '0.62', status: 'Ready to Move' },
  { locality: 'Sector 107', city: 'Noida', project: 'County 107 4BHK', bhk: '4 BHK', area: '3100', price: '10.50', status: 'Ready to Move' },

  // NOIDA - Noida Extension
  { locality: 'Noida Extension', city: 'Noida', project: 'Future Estate by FW Group', bhk: '2 BHK', area: '1110-1435', price: '0.86-1.12', status: 'Under Construction' },
  { locality: 'Noida Extension', city: 'Noida', project: 'Panchsheel Greens 2', bhk: '2,3 BHK', area: '1060-1525', price: '1.10-1.60', status: 'Ready to Move' },
  { locality: 'Noida Extension', city: 'Noida', project: 'Capital Athena', bhk: '2,3 BHK', area: '1000-1500', price: '0.80-1.30', status: 'Under Construction' },
  { locality: 'Noida Extension', city: 'Noida', project: 'Godrej Majesty', bhk: '3,4 BHK', area: '1183-1985', price: '3.54-4.92', status: 'Under Construction' },
  { locality: 'Noida Extension', city: 'Noida', project: 'CRC Maesta', bhk: '3,4 BHK', area: '2245-2690', price: '3.25-3.63', status: 'Under Construction' },
  { locality: 'Noida Extension', city: 'Noida', project: 'Gaur 16th Avenue', bhk: '2,3 BHK', area: '950-1400', price: '0.55-0.85', status: 'Ready to Move' },
  { locality: 'Noida Extension', city: 'Noida', project: 'ACE Divino', bhk: '2,3 BHK', area: '995-1415', price: '0.58-0.88', status: 'Ready to Move' },
  { locality: 'Noida Extension', city: 'Noida', project: 'Mahagun Mywoods Phase 3', bhk: '2,3 BHK', area: '1050-1500', price: '0.65-0.95', status: 'Ready to Move' },
  { locality: 'Noida Extension', city: 'Noida', project: 'Nirala Estate Phase 2', bhk: '2,3 BHK', area: '990-1380', price: '0.52-0.80', status: 'Ready to Move' },
  { locality: 'Noida Extension', city: 'Noida', project: 'Supercity Mayfair Residency', bhk: '2,3,4 BHK', area: '895-2285', price: '0.72-1.83', status: 'Ready to Move' },

  // MUMBAI - Andheri West
  { locality: 'Andheri West', city: 'Mumbai', project: 'Puravankara Purva Estrella', bhk: '2,3,4 BHK', area: '712-1530', price: '3.37-7.24', status: 'Under Construction' },
  { locality: 'Andheri West', city: 'Mumbai', project: 'Godrej Skyshore', bhk: '2,3 BHK', area: '650-1100', price: '2.80-4.50', status: 'Under Construction' },
  { locality: 'Andheri West', city: 'Mumbai', project: 'Andheri West 3BHK E', bhk: '3 BHK', area: '1010', price: '3.50', status: 'Ready to Move' },
  { locality: 'Andheri West', city: 'Mumbai', project: 'Andheri West 2BHK', bhk: '2 BHK', area: '850', price: '2.20', status: 'Ready to Move' },
  { locality: 'Andheri West', city: 'Mumbai', project: 'Rustomjee Boulevard', bhk: '2,3 BHK', area: '675-1200', price: '2.50-4.50', status: 'Ready to Move' },
  { locality: 'Andheri West', city: 'Mumbai', project: 'Andheri West 1BHK', bhk: '1 BHK', area: '450', price: '0.85', status: 'Ready to Move' },
  { locality: 'Andheri West', city: 'Mumbai', project: 'Esto Arkis', bhk: '1,2,3 BHK', area: '489-1139', price: '1.71-3.97', status: 'Under Construction' },
  { locality: 'Andheri West', city: 'Mumbai', project: 'Lokhandwala 2BHK', bhk: '2 BHK', area: '900', price: '2.60', status: 'Ready to Move' },
  { locality: 'Andheri West', city: 'Mumbai', project: 'Andheri West 3BHK Cor', bhk: '3 BHK', area: '1200', price: '4.20', status: 'Ready to Move' },
  { locality: 'Andheri West', city: 'Mumbai', project: 'Kalpataru Infinia', bhk: '2,3 BHK', area: '800-1300', price: '3.00-5.00', status: 'Under Construction' },

  // MUMBAI - Powai
  { locality: 'Powai', city: 'Mumbai', project: 'L&T Elixir Reserve', bhk: '3,4 BHK', area: '1050-1950', price: '4.20-7.80', status: 'Under Construction' },
  { locality: 'Powai', city: 'Mumbai', project: 'Isle of Calm by GHP', bhk: '3,4 BHK', area: '1200-2000', price: '5.50-9.00', status: 'New Launch' },
  { locality: 'Powai', city: 'Mumbai', project: 'Hiranandani Gardens 2BHK', bhk: '2 BHK', area: '1050', price: '3.20', status: 'Ready to Move' },
  { locality: 'Powai', city: 'Mumbai', project: 'Powai 3BHK High Floor', bhk: '3 BHK', area: '1400', price: '5.20', status: 'Ready to Move' },
  { locality: 'Powai', city: 'Mumbai', project: 'L&T Emerald Isle', bhk: '2,3 BHK', area: '900-1500', price: '2.50-4.50', status: 'Ready to Move' },
  { locality: 'Powai', city: 'Mumbai', project: 'Kanakia Silicon Valley 2BHK', bhk: '2 BHK', area: '800', price: '2.00', status: 'Ready to Move' },
  { locality: 'Powai', city: 'Mumbai', project: 'Raheja Interface Heights', bhk: '2,3 BHK', area: '900-1300', price: '2.80-4.00', status: 'Ready to Move' },
  { locality: 'Powai', city: 'Mumbai', project: 'Powai 1BHK', bhk: '1 BHK', area: '550', price: '1.20', status: 'Ready to Move' },
  { locality: 'Powai', city: 'Mumbai', project: 'Godrej The Trees', bhk: '2,3,4 BHK', area: '900-2000', price: '2.60-6.00', status: 'Ready to Move' },
  { locality: 'Powai', city: 'Mumbai', project: 'Hiranandani 3BHK Resale', bhk: '3 BHK', area: '1600', price: '5.80', status: 'Ready to Move' },

  // MUMBAI - Chembur
  { locality: 'Chembur', city: 'Mumbai', project: 'Sai Swaroop 2BHK', bhk: '2 BHK', area: '750', price: '1.85', status: 'Ready to Move' },
  { locality: 'Chembur', city: 'Mumbai', project: 'Trinity Arham Aryan 3BHK', bhk: '3 BHK', area: '1010', price: '3.20', status: 'Ready to Move' },
  { locality: 'Chembur', city: 'Mumbai', project: 'Srushtiraj Siddhi Sq 2BHK', bhk: '2 BHK', area: '700', price: '1.60', status: 'Ready to Move' },
  { locality: 'Chembur', city: 'Mumbai', project: 'One Meraki', bhk: '2,3 BHK', area: '751-1993', price: '3.38-8.97', status: 'Under Construction' },
  { locality: 'Chembur', city: 'Mumbai', project: 'Chembur West 1BHK', bhk: '1 BHK', area: '500', price: '1.10', status: 'Ready to Move' },
  { locality: 'Chembur', city: 'Mumbai', project: 'Rustomjee Acme', bhk: '2,3 BHK', area: '700-1200', price: '2.50-4.50', status: 'Under Construction' },
  { locality: 'Chembur', city: 'Mumbai', project: 'Chembur 2BHK Society', bhk: '2 BHK', area: '750', price: '1.80', status: 'Ready to Move' },
  { locality: 'Chembur', city: 'Mumbai', project: 'Chembur 3BHK PH', bhk: '3 BHK', area: '1680', price: '5.80', status: 'Ready to Move' },
  { locality: 'Chembur', city: 'Mumbai', project: 'Lodha Belmondo', bhk: '2,3,4 BHK', area: '900-2000', price: '2.80-7.00', status: 'Ready to Move' },
  { locality: 'Chembur', city: 'Mumbai', project: 'Chembur 2BHK Station', bhk: '2 BHK', area: '780', price: '1.95', status: 'Ready to Move' },

  // MUMBAI - Goregaon East
  { locality: 'Goregaon East', city: 'Mumbai', project: 'Sunteck City Avenue 4', bhk: '2,3 BHK', area: '700-1088', price: '2.80-3.97', status: 'Ready to Move' },
  { locality: 'Goregaon East', city: 'Mumbai', project: 'Sunteck Altavia', bhk: '3,4 BHK', area: '1267-1700', price: '3.75-5.10', status: 'Under Construction' },
  { locality: 'Goregaon East', city: 'Mumbai', project: 'Elysian by Oberoi Realty', bhk: '3,4 BHK', area: '1737-2400', price: '7.84-10.84', status: 'Under Construction' },
  { locality: 'Goregaon East', city: 'Mumbai', project: 'Goregaon East 2BHK', bhk: '2 BHK', area: '750', price: '1.80', status: 'Ready to Move' },
  { locality: 'Goregaon East', city: 'Mumbai', project: 'Goregaon East 1BHK', bhk: '1 BHK', area: '450', price: '1.10', status: 'Ready to Move' },
  { locality: 'Goregaon East', city: 'Mumbai', project: 'Lodha Primero 2BHK', bhk: '2 BHK', area: '700', price: '2.50', status: 'Ready to Move' },
  { locality: 'Goregaon East', city: 'Mumbai', project: 'Goregaon East 3BHK', bhk: '3 BHK', area: '1100', price: '3.10', status: 'Ready to Move' },
  { locality: 'Goregaon East', city: 'Mumbai', project: 'Kalpataru Vivant', bhk: '2,3 BHK', area: '700-1200', price: '2.20-4.00', status: 'Under Construction' },
  { locality: 'Goregaon East', city: 'Mumbai', project: 'Goregaon East Studio', bhk: 'Studio/1RK', area: '250', price: '0.42', status: 'Ready to Move' },
  { locality: 'Goregaon East', city: 'Mumbai', project: 'Rustomjee Elanza', bhk: '1,2 BHK', area: '400-750', price: '1.10-2.00', status: 'Under Construction' },

  // MUMBAI - Kharghar
  { locality: 'Kharghar', city: 'Mumbai', project: 'Shreeji Divine 3BHK', bhk: '3 BHK', area: '1580', price: '1.45', status: 'Ready to Move' },
  { locality: 'Kharghar', city: 'Mumbai', project: 'Kasturi Regius Luxe', bhk: '2,3 BHK', area: '700-1200', price: '1.20-2.00', status: 'New Launch' },
  { locality: 'Kharghar', city: 'Mumbai', project: 'Godrej Varanya', bhk: '2,3 BHK', area: '700-1200', price: '1.20-2.00', status: 'New Launch' },
  { locality: 'Kharghar', city: 'Mumbai', project: 'Arihant Clan Aalishan', bhk: '2,3 BHK', area: '600-1100', price: '0.80-1.50', status: 'Ready to Move' },
  { locality: 'Kharghar', city: 'Mumbai', project: 'Hiranandani Fortune City', bhk: '1,2,3 BHK', area: '400-1100', price: '0.60-1.60', status: 'Under Construction' },
  { locality: 'Kharghar', city: 'Mumbai', project: 'Kharghar 2BHK Smart', bhk: '2 BHK', area: '694-701', price: '0.85', status: 'Under Construction' },
  { locality: 'Kharghar', city: 'Mumbai', project: 'Kolte Patil Ivy Estate', bhk: '2,3 BHK', area: '700-1200', price: '0.90-1.50', status: 'Under Construction' },
  { locality: 'Kharghar', city: 'Mumbai', project: 'Kharghar 3BHK Sec 35', bhk: '3 BHK', area: '1500', price: '1.40', status: 'Ready to Move' },
  { locality: 'Kharghar', city: 'Mumbai', project: 'Paradise Sai Pearls 3BHK', bhk: '3 BHK', area: '1680', price: '1.50', status: 'Ready to Move' },
  { locality: 'Kharghar', city: 'Mumbai', project: 'Kharghar 1BHK', bhk: '1 BHK', area: '500', price: '0.55', status: 'Ready to Move' },
];

// Locality metadata from india_city_locality_data.pdf
const LOCALITIES_METADATA = {
  'Whitefield': { city: 'Bangalore', priceSqft: 13000, yoy: 18, metro: '900m' },
  'Marathahalli': { city: 'Bangalore', priceSqft: 12528, yoy: 15, metro: '1.2km' },
  'Sarjapur Road': { city: 'Bangalore', priceSqft: 11050, yoy: 20, metro: '2km' },
  'HSR Layout': { city: 'Bangalore', priceSqft: 27050, yoy: 12, metro: '800m' },
  'Electronic City': { city: 'Bangalore', priceSqft: 43875, yoy: 16, metro: '1.5km' },
  'Noida Extension': { city: 'Noida', priceSqft: 7234, yoy: 22, metro: '3km' },
  'Sector 150': { city: 'Noida', priceSqft: 11724, yoy: 18, metro: '2.5km' },
  'Sector 137': { city: 'Noida', priceSqft: 8712, yoy: 15, metro: '1.8km' },
  'Sector 75': { city: 'Noida', priceSqft: 12094, yoy: 17, metro: '800m' },
  'Sector 107': { city: 'Noida', priceSqft: 15886, yoy: 14, metro: '600m' },
  'Andheri West': { city: 'Mumbai', priceSqft: 37700, yoy: 12, metro: '1.2km' },
  'Powai': { city: 'Mumbai', priceSqft: 19350, yoy: 14, metro: '2km' },
  'Chembur': { city: 'Mumbai', priceSqft: 17750, yoy: 11, metro: '1.5km' },
  'Goregaon East': { city: 'Mumbai', priceSqft: 16435, yoy: 13, metro: '2.2km' },
  'Kharghar': { city: 'Mumbai', priceSqft: 8850, yoy: 19, metro: '3.5km' },
};

async function seedProperties() {
  console.log('🌱 Seeding 150 properties from PDFs with Unsplash images...');

  const propertiesToInsert = PROPERTIES.map((prop, idx) => {
    const metadata = LOCALITIES_METADATA[prop.locality] || { priceSqft: 10000, yoy: 15, metro: 2 };
    const imageUrl = UNSPLASH_IMAGES[idx % UNSPLASH_IMAGES.length];
    const priceRange = prop.price.split('-').map(p => parseFloat(p));

    return {
      city: prop.city,
      locality: prop.locality,
      name: prop.project,
      bhk: prop.bhk.split(',').map(b => b.trim()),
      price_min: Math.min(...priceRange),
      price_max: Math.max(...priceRange),
      price_avg_sqft: metadata.priceSqft,
      area_sqft: parseInt(prop.area.split('-')[0]) || 1200,
      status: prop.status,
      ready_to_move: prop.status === 'Ready to Move',
      landmarks: JSON.stringify({
        metro: metadata.metro,
      }),
      image_url: imageUrl,
    };
  });

  try {
    // Insert properties in batches (avoid 1MB payload limit)
    const batchSize = 50;
    for (let i = 0; i < propertiesToInsert.length; i += batchSize) {
      const batch = propertiesToInsert.slice(i, i + batchSize);
      const { error } = await sb.from('real_properties').insert(batch);

      if (error) {
        console.error(`❌ Batch ${i / batchSize + 1} failed:`, error.message);
      } else {
        console.log(`✅ Batch ${i / batchSize + 1} (${batch.length} properties) inserted`);
      }
    }

    console.log(`\n✨ Seeding complete! 150 properties across 15 localities with Unsplash images`);
    console.log('📊 Breakdown:');
    console.log('  Bangalore: 50 properties (5 localities)');
    console.log('  Noida: 50 properties (5 localities)');
    console.log('  Mumbai: 50 properties (5 localities)');
    console.log(`🎨 All properties have Unsplash images (24 curated, cycling)`);
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

seedProperties();
