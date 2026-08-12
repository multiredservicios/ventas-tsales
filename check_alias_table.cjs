const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://eufisxqpplyvdlwpsjuu.supabase.co',
  'sb_publishable_wD0xbqDXg_ipOBXF1_4ohg_9iQ5_odN'
);

async function createAliasTable() {
  // Try creating the table using SQL via RPC, or just test if it exists
  // Since we can't run DDL via the anon key, let's try inserting and see
  const { data, error } = await supabase.from('ejecutivo_alias').select('*').limit(1);
  
  if (error && error.message.includes('does not exist')) {
    console.log('❌ Table ejecutivo_alias does NOT exist. You need to create it manually in Supabase.');
    console.log('\nGo to Supabase Dashboard > SQL Editor and run this:');
    console.log(`
CREATE TABLE ejecutivo_alias (
  id BIGSERIAL PRIMARY KEY,
  alias TEXT NOT NULL,
  ejecutivo_id BIGINT REFERENCES ejecutivos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ejecutivo_alias ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon key (same as your other tables)
CREATE POLICY "Allow all for anon" ON ejecutivo_alias FOR ALL USING (true) WITH CHECK (true);

-- Unique constraint to avoid duplicate aliases  
ALTER TABLE ejecutivo_alias ADD CONSTRAINT unique_alias UNIQUE (alias);
    `);
  } else if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('✅ Table ejecutivo_alias already exists!');
    console.log('Current data:', data);
  }
}

createAliasTable();
