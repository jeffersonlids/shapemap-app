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
  console.log('--- TESTING STUDENTS ---');
  const colsStudents = ['trainer_id', 'user_id', 'created_at', 'id'];
  for (const c of colsStudents) {
    const { error } = await supabase.from('students').update({ [c]: 'test' }).eq('id', 'dummy');
    console.log(`students.${c}:`, error ? error.message : 'OK (column exists)');
  }

  console.log('\n--- TESTING EVALUATIONS ---');
  const colsEvals = ['student_id', 'trainer_id', 'created_at', 'id'];
  for (const c of colsEvals) {
    const { error } = await supabase.from('evaluations').update({ [c]: 'test' }).eq('id', 'dummy');
    console.log(`evaluations.${c}:`, error ? error.message : 'OK (column exists)');
  }

  console.log('\n--- TESTING TRAINERS ---');
  const colsTrainers = ['email', 'asaas_customer_id', 'stripe_customer_id', 'subscription_status', 'id'];
  for (const c of colsTrainers) {
    const { error } = await supabase.from('trainers').update({ [c]: 'test' }).eq('id', 'dummy');
    console.log(`trainers.${c}:`, error ? error.message : 'OK (column exists)');
  }
}

run();
