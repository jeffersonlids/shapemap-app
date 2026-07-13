import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('c:/Users/jeffe/Desktop/Avaliação Física/App/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
let url = '';
let anonKey = '';

lines.forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    url = line.split('VITE_SUPABASE_URL=')[1].trim();
  }
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    anonKey = line.split('VITE_SUPABASE_ANON_KEY=')[1].trim();
  }
});

const supabase = createClient(url, anonKey);

async function run() {
  console.log('Testing update with unit_system...');
  const { error } = await supabase
    .from('trainers')
    .update({
      unit_system: 'imperial'
    })
    .eq('id', '00000000-0000-0000-0000-000000000000'); // dummy ID

  if (error) {
    console.log('Update result error:', error);
  } else {
    console.log('Update query parsed successfully (no schema error).');
  }
}

run();
