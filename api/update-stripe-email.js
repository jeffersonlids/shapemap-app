import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder_key');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
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

  const { customerId, email } = req.body || {};

  if (!customerId || !email) {
    return res.status(400).json({ error: 'Faltando customerId ou e-mail.' });
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
      return res.status(403).json({ error: 'Ação não permitida para este cliente Stripe.' });
    }
  }

  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return res.status(500).json({ error: 'STRIPE_SECRET_KEY não configurada no servidor.' });
    }

    // Atualizar e-mail do cliente na Stripe
    const customer = await stripe.customers.update(customerId, {
      email: email,
    });

    console.log(`✅ E-mail do cliente Stripe atualizado: ${customerId} -> ${email}`);
    return res.status(200).json({ success: true, customerId: customer.id, email: customer.email });
  } catch (error) {
    console.error('Erro ao atualizar e-mail na Stripe:', error);
    return res.status(500).json({ error: error.message });
  }
}
