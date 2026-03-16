/**
 * Mock 99acres API server for local dev.
 * Serves: /debug/entities, /debug/search-urls, /search, /listings
 * Run: node api/99acres-mock-server.js
 * Default: http://localhost:5003
 */
const http = require('http');
const url = require('url');

const PORT = parseInt(process.env.PORT, 10) || 5003;
const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=220&fit=crop',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=220&fit=crop',
];

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function parseQuery(searchQuery) {
  const q = (searchQuery || '').trim().toLowerCase();
  let city = 'Noida';
  let locality = '';
  let bedroom = '2';
  const readyToMove = q.indexOf('ready to move') !== -1 || q.indexOf('ready-to-move') !== -1;
  const bhkMatch = q.match(/(\d)\s*bhk/);
  if (bhkMatch) bedroom = bhkMatch[1];
  const parts = q.replace(/\s*bhk\s*/gi, ' ').replace(/\s*ready\s*to\s*move\s*/gi, ' ').replace(/\s*flat\s*for\s*sale\s*in\s*/gi, ' ').trim().split(/\s+/).filter(Boolean);
  const cityNames = ['noida', 'bangalore', 'bengaluru', 'gurgaon', 'gurugram', 'mumbai', 'pune', 'ghaziabad', 'faridabad', 'hyderabad', 'chennai', 'delhi'];
  for (let i = parts.length - 1; i >= 0; i--) {
    const w = parts[i].replace(/[,.]/g, '');
    if (cityNames.includes(w)) {
      city = w.charAt(0).toUpperCase() + w.slice(1);
      if (city === 'Bengaluru') city = 'Bangalore';
      locality = parts.slice(0, i).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || city;
      break;
    }
  }
  if (!locality && parts.length > 0) locality = parts.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || city;
  return { city, locality: locality || city, bedroom, readyToMove };
}

function mockListings(entities, limit = 8) {
  const city = entities.city || 'Noida';
  const locality = entities.locality || city;
  const bhk = entities.bedroom || '2';
  const rtmOnly = !!entities.readyToMove;
  const list = [];
  for (let i = 0; i < limit; i++) {
    const isRtm = rtmOnly ? true : (i % 2 === 0);
    list.push({
      id: `mock-${i + 1}`,
      property_id: `mock-${i + 1}`,
      name: `${bhk} BHK in ${locality} — Project ${i + 1}`,
      project_name: `Project ${i + 1}`,
      title: `${bhk} BHK Apartment`,
      location: `${locality}, ${city}`,
      locality_name: locality,
      address: `${locality}, ${city}`,
      min_price: (70 + i * 3) * 100000,
      listed_price: (70 + i * 3) * 100000,
      price_str: `₹${70 + i * 3}L`,
      carpet_area: 950 + i * 50,
      built_up_area: 1000 + i * 50,
      bedroom: bhk,
      bhk_types: `${bhk} BHK`,
      status: isRtm ? 'Ready to move' : 'Under construction',
      ready_to_move: isRtm,
      image_url: FALLBACK_IMGS[i % FALLBACK_IMGS.length],
      is_new_launch: i === 0 && isRtm,
      price_drop: i === 2,
    });
  }
  return list;
}

const server = http.createServer((req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const query = parsed.query;

  if (pathname === '/debug/entities') {
    const searchQuery = query.query || '';
    const entities = parseQuery(searchQuery);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(entities));
    return;
  }

  if (pathname === '/debug/search-urls') {
    let entities = {};
    try {
      entities = typeof query.entities === 'string' ? JSON.parse(decodeURIComponent(query.entities)) : {};
    } catch (_) {}
    const city = entities.city || 'Noida';
    const locality = entities.locality || city;
    const searchUrl = `https://www.99acres.com/search/property/buy/${(city + '-' + locality).toLowerCase().replace(/\s+/g, '-')}`;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url: searchUrl, search_url: searchUrl, buy_url: searchUrl }));
    return;
  }

  if (pathname === '/search' || pathname === '/listings') {
    let entities = {};
    try {
      entities = typeof query.entities === 'string' ? JSON.parse(decodeURIComponent(query.entities)) : {};
    } catch (_) {}
    const limit = parseInt(query.limit, 10) || 8;
    const list = mockListings(entities, limit);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ results: list, listings: list, properties: list }));
    return;
  }

  if (pathname === '/api/properties') {
    const city = query.city || 'Noida';
    const locality = query.locality || city;
    const bedroom = query.bedroom || '2';
    const limit = parseInt(query.limit, 10) || 8;
    const list = mockListings({ city, locality, bedroom }, limit);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ results: list, listings: list, properties: list }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('99acres mock API at http://localhost:' + PORT);
  console.log('  GET /debug/entities?query=...');
  console.log('  GET /debug/search-urls?entities=...');
  console.log('  GET /search?entities=...&limit=8');
  console.log('  GET /listings?entities=...&limit=8');
  console.log('  GET /api/properties?city=...&locality=...&bedroom=...&limit=8');
});
