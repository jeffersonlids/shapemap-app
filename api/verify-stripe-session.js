import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { processReferralReward } from './referral-reward.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

function getIsoDate(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { sessionId, trainerId: reqTrainerId } = req.body || req.query || {};

  if (!sessionId && !reqTrainerId) {
    return res.status(400).json({ error: 'Parâmetros insuficientes para verificação.' });
  }

  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return res.status(500).json({ error: 'STRIPE_SECRET_KEY não configurada.' });
    }

    const stripe = new Stripe(stripeSecret);
    let session = null;

    if (sessionId) {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'customer']
      });
    }

    if (session && (session.payment_status === 'paid' || session.status === 'complete')) {
      const customerId = typeof session.customer === 'object' ? session.customer?.id : session.customer;
      const targetTrainerId = session.metadata?.trainerId || session.client_reference_id || reqTrainerId;

      let subscriptionId = null;
      let currentPeriodEndISO = null;
      let subStatus = 'active';

      if (session.subscription) {
        if (typeof session.subscription === 'object') {
          subscriptionId = session.subscription.id;
          const periodEndTimestamp = session.subscription.current_period_end 
            || session.subscription.items?.data?.[0]?.current_period_end
            || (session.subscription.lines?.data?.[0]?.period?.end);
          currentPeriodEndISO = getIsoDate(periodEndTimestamp);
          subStatus = session.subscription.status || 'active';
        } else {
          subscriptionId = session.subscription;
          try {
            const subObj = await stripe.subscriptions.retrieve(subscriptionId);
            const periodEndTimestamp = subObj.current_period_end 
              || subObj.items?.data?.[0]?.current_period_end
              || (subObj.lines?.data?.[0]?.period?.end);
            currentPeriodEndISO = getIsoDate(periodEndTimestamp);
            subStatus = subObj.status || 'active';
          } catch (e) {
            console.warn('Erro ao buscar subObj:', e);
          }
        }
      }

      if (!currentPeriodEndISO) {
        currentPeriodEndISO = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      if (supabase && targetTrainerId) {
        const updateData = {
          stripe_customer_id: customerId,
          subscription_id: subscriptionId,
          subscription_status: subStatus,
          current_period_end: currentPeriodEndISO,
          payment_gateway: 'stripe'
        };
        if (session.customer_details?.phone) {
          updateData.telefone = session.customer_details.phone;
        }

        const { error: updErr } = await supabase
          .from('trainers')
          .update(updateData)
          .eq('id', targetTrainerId);

        if (updErr) {
          console.error('Erro ao atualizar trainer no Supabase:', updErr);
        } else {
          console.log(`✅ [Instant Verify] Assinante Stripe ativado com sucesso: ${targetTrainerId}`);
        }

        try {
          await processReferralReward(supabase, targetTrainerId);
        } catch (refErr) {
          console.warn('⚠️ Erro ao processar bônus de indicação no verify:', refErr);
        }

        return res.status(200).json({
          success: true,
          activated: true,
          trainerId: targetTrainerId,
          status: subStatus,
          currentPeriodEnd: currentPeriodEndISO
        });
      }
    }

    return res.status(200).json({ success: false, message: 'Sessão não confirmada ou trainerId não localizado.' });

  } catch (error) {
    console.error('Erro ao verificar sessão Stripe:', error);
    return res.status(500).json({ error: error.message });
  }
}
