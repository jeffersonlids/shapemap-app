import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder_key');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { customerId } = req.body || {};

  if (!customerId) {
    return res.status(400).json({ error: 'Identificador do cliente (customerId) ausente.' });
  }

  // Validação de Autenticação Segura via Token JWT do Supabase
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado. Token de autenticação ausente.' });
  }

  if (supabase) {
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
    }

    // Trava de Segurança: Garantir que o customerId pertence ao usuário logado
    const { data: trainerRecord, error: dbErr } = await supabase
      .from('trainers')
      .select('id, stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    if (dbErr || !trainerRecord || trainerRecord.stripe_customer_id !== customerId) {
      return res.status(403).json({ error: 'Acesso negado ao portal desta assinatura.' });
    }
  }

  try {
    const origin = req.headers.origin || 'http://localhost:5173';
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Erro Stripe billing portal:', error);
    return res.status(500).json({ error: error.message });
  }
}
