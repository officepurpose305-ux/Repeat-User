#!/usr/bin/env node

/**
 * Phase 1 Setup Script — Create location_cache table in Supabase
 * Run: node setup-phase1.js
 */

const https = require('https');

const SUPABASE_URL = 'https://qlfttxrnnjueycffwdmy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Q2sDwYGsgMXv-O5voOjfDQ_9EQDri1t';

const SQL = `
-- Create location_cache table
create table if not exists public.location_cache (
  id uuid primary key default gen_random_uuid(),
  location_key text unique not null,
  payload jsonb not null,
  expires_at timestamptz not null,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.location_cache enable row level security;

-- Allow all reads/writes (public research data)
create policy if not exists "Allow all access to location_cache" on public.location_cache
  for all using (true) with check (true);

-- Create indexes
create index if not exists idx_location_key on public.location_cache(location_key);
create index if not exists idx_expires_at on public.location_cache(expires_at);
`;

async function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'qlfttxrnnjueycffwdmy.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query: sql }));
    req.end();
  });
}

async function checkTableExists() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'qlfttxrnnjueycffwdmy.supabase.co',
      port: 443,
      path: '/rest/v1/location_cache?limit=1',
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // If 200/OK, table exists. If 404, doesn't exist.
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', () => resolve(false));
    req.end();
  });
}

async function main() {
  console.log('🔧 Phase 1 Setup — Creating Supabase location_cache table\n');

  // Check if table already exists
  console.log('1️⃣  Checking if location_cache table exists...');
  const exists = await checkTableExists();

  if (exists) {
    console.log('✅ Table already exists!\n');
    process.exit(0);
  }

  console.log('❌ Table not found, creating...\n');

  // Create table using direct REST API call
  // Note: Supabase REST API doesn't have direct SQL execution for security reasons
  // We'll use the dashboard SQL approach instead

  console.log('📋 SQL to run in Supabase Dashboard:');
  console.log('─'.repeat(60));
  console.log(SQL);
  console.log('─'.repeat(60));
  console.log('\n⚠️  Manual Step Required:\n');
  console.log('1. Open: https://qlfttxrnnjueycffwdmy.supabase.co/project/default/sql/new');
  console.log('2. Paste the SQL above');
  console.log('3. Click "Run"');
  console.log('4. Then run: node setup-phase1.js (again to verify)');
  console.log('\nOr copy from PHASE1-SUPABASE-SQL.sql and run in SQL Editor.\n');

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
