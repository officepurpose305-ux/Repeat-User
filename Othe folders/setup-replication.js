#!/usr/bin/env node
/**
 * Enable real-time replication for live_config table
 * Usage: node setup-replication.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://qlfttxrnnjueycffwdmy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Q2sDwYGsgMXv-O5voOjfDQ_9EQDri1t';

async function enableReplication() {
  console.log('Setting up Supabase real-time replication...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Check if live_config table exists
    const { data, error } = await supabase
      .from('live_config')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error connecting to live_config table:', error.message);
      console.log('\n⚠️  Make sure you have created the table in Supabase SQL Editor:');
      console.log(`
create table if not exists public.live_config (
  id text primary key default 'default',
  config jsonb not null,
  updated_at timestamptz default now()
);

alter table public.live_config enable row level security;

create policy "Allow all for live_config" on public.live_config
  for all using (true) with check (true);
      `);
      return;
    }

    console.log('✅ live_config table found\n');

    // Try to insert a test record
    const testConfig = {
      stage: 2,
      location: { primary: 'Test', city: 'Test' },
      filters: { budgetMin: 50, budgetMax: 100, bhk: ['2BHK'] }
    };

    const { data: insertData, error: insertError } = await supabase
      .from('live_config')
      .upsert({ id: 'default', config: testConfig })
      .select();

    if (insertError) {
      console.error('❌ Error upserting test config:', insertError.message);
      return;
    }

    console.log('✅ Test config inserted/updated\n');

    console.log('📝 To enable real-time replication:');
    console.log('1. Open: https://app.supabase.com/project/qlfttxrnnjueycffwdmy/database/publications');
    console.log('2. Under "Replication", find "live_config" table');
    console.log('3. Toggle the switch to ON (blue)');
    console.log('\n✨ After enabling replication, your panel and homepage will sync in real-time!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

enableReplication();
