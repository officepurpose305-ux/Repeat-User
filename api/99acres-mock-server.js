/**
 * Mock 99acres API server for local dev.
 * Serves: /debug/entities, /debug/search-urls, /search, /listings
 * Also serves: /proxy/* → forwards to REAL_API_BASE (Anurag's server) with CORS headers added.
 *
 * Run: node api/99acres-mock-server.js
 * Default port: 5003
 *
 * To use the real API via proxy, set in config.js:
 *   window.NINETY_NINE_ACRES_API_BASE = 'http://localhost:5003/proxy';
 *
 * To override the real API target (default: http://10.10.17.143:5003):
 *   REAL_API_BASE=http://192.168.1.50:5003 node api/99acres-mock-server.js
 */
const http = require('http');

const REAL_API_BASE = process.env.REAL_API_BASE || 'http://10.10.17.143:5003';

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

// Generate mock listing page content in the format expected by homepage's parseApiListings()
function generateMockPageContent(entities, limit = 8) {
  const city = entities.city || 'Noida';
  const locality = entities.locality || city;
  const bhk = entities.bedroom || '2';
  const rtmOnly = !!entities.readyToMove;
  const listings = [];

  for (let i = 0; i < limit; i++) {
    const isRtm = rtmOnly ? true : (i % 2 === 0);
    const priceL = 70 + i * 3;
    const sqft = 950 + i * 50;
    const devs = ['ABC Builders', 'XYZ Developers', 'Premier Constructions', 'Diamond Projects'];

    listings.push(
      `Landing URL: https://www.99acres.com/property-${i + 1}\n` +
      `Listing Title: ${bhk} BHK Luxury Apartment in ${locality}, ${city}\n` +
      `Listing Image URL: ${FALLBACK_IMGS[i % FALLBACK_IMGS.length]}\n` +
      `Listing Description: Premium ${bhk} bedroom apartment with modern amenities, ${sqft} sq ft carpet area. ₹${priceL}L. Located in ${locality}, ${city}.\n` +
      `Posted by: ${devs[i % devs.length]}\n` +
      `Possession Status: ${isRtm ? 'Ready to move' : 'Possession in 12-18 months'}`
    );
  }

  return listings.join('\n\n');
}

const server = http.createServer((req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  const parsed = new URL(req.url, 'http://localhost');
  const pathname = parsed.pathname;
  const query = Object.fromEntries(parsed.searchParams);

  if (pathname === '/debug/entities') {
    // Accept both ?text= (real API param) and ?query= (legacy mock param)
    const searchQuery = query.text || query.query || '';
    const entities = parseQuery(searchQuery);
    // Wrap in { entities: {...} } to match real API response shape
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ entities }));
    return;
  }

  if (pathname === '/debug/search-urls') {
    let entities = {};
    try {
      entities = typeof query.entities === 'string' ? JSON.parse(decodeURIComponent(query.entities)) : {};
    } catch (_) {}
    const pageContent = generateMockPageContent(entities, 8);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      content: [{ page_content: pageContent }]
    }));
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

  // ── Proxy to real 99acres API (adds CORS headers so browser can call it) ──────
  // Browser calls http://localhost:5003/proxy/debug/entities?...
  // This server forwards to http://10.10.17.143:5003/debug/entities?... server-to-server
  // (no CORS restriction in Node), then returns the response with CORS headers set.
  if (pathname.startsWith('/proxy/')) {
    const targetPath = pathname.slice('/proxy'.length) + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
    const targetUrl = new URL(REAL_API_BASE + targetPath);
    const proxyReq = http.request(
      { host: targetUrl.hostname, port: targetUrl.port || 80, path: targetUrl.pathname + targetUrl.search, method: 'GET' },
      (proxyRes) => {
        cors(res);
        res.writeHead(proxyRes.statusCode, { 'Content-Type': proxyRes.headers['content-type'] || 'application/json' });
        proxyRes.pipe(res);
      }
    );
    proxyReq.on('error', (err) => {
      cors(res);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy error — real API unreachable', detail: err.message }));
    });
    proxyReq.end();
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
  console.log('  GET /proxy/* → forwards to ' + REAL_API_BASE + ' (CORS-enabled)');
  console.log('  To use real API: set NINETY_NINE_ACRES_API_BASE = "http://localhost:' + PORT + '/proxy" in config.js');
});
