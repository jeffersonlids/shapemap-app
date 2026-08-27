import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { trainerId, email, nome } = req.body || {};

  if (!trainerId || !email) {
    return res.status(400).json({ error: 'trainerId e email são obrigatórios.' });
  }

  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID_USD || process.env.STRIPE_PRICE_ID;

    if (!stripeSecret || !priceId) {
      return res.status(500).json({ error: 'Stripe keys não configuradas.' });
    }

    const stripe = new Stripe(stripeSecret);

    // 1. Criar ou obter cliente na Stripe
    let customer;
    const customers = await stripe.customers.list({ email: email.trim(), limit: 1 });
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email.trim(),
        name: nome || 'Trainer Teste Stripe',
        metadata: { trainerId: trainerId }
      });
    }

    // 2. Criar assinatura de teste com trial de 30 dias (sem cobrança no cartão)
    const trialEndUnix = Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000);
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      trial_end: trialEndUnix,
      metadata: { trainerId: trainerId, is_test_referral: 'true' }
    });

    const currentPeriodEndISO = new Date(trialEndUnix * 1000).toISOString();

    // 3. Atualizar no Supabase
    if (supabase) {
      await supabase
        .from('trainers')
        .update({
          stripe_customer_id: customer.id,
          subscription_id: subscription.id,
          subscription_status: 'active',
          current_period_end: currentPeriodEndISO,
          payment_gateway: 'stripe'
        })
        .eq('id', trainerId);
    }

    return res.status(200).json({
      success: true,
      customerId: customer.id,
      subscriptionId: subscription.id,
      currentPeriodEnd: currentPeriodEndISO,
      trialEndUnix: trialEndUnix
    });

  } catch (err) {
    console.error('Erro ao criar assinatura Stripe teste:', err);
    return res.status(500).json({ error: err.message });
  }
}
