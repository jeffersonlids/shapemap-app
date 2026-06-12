import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false, // Desabilita o parser automático do Vercel para ler o buffer bruto (necessário para validar assinatura do Stripe)
  },
};

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder_key');
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';

function getIsoDate(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let buf;
  try {
    buf = await buffer(req);
  } catch (err) {
    console.error('Erro ao ler buffer do webhook:', err);
    return res.status(400).send('Erro ao processar corpo da requisição');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (!sig || !webhookSecret) {
      throw new Error('Faltando cabeçalho stripe-signature ou webhook secret local.');
    }
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Erro na validação de assinatura do Stripe: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const trainerId = session.metadata?.trainerId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (!trainerId) {
          console.warn('⚠️ Checkout completado sem trainerId nos metadados.');
          break;
        }

        // Buscar detalhes da assinatura no Stripe para obter a data final do período pago
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const currentPeriodEndISO = getIsoDate(subscription.current_period_end);

        // Atualizar perfil do treinador no Supabase
        const { error } = await supabase
          .from('trainers')
          .update({
            stripe_customer_id: customerId,
            subscription_status: subscription.status,
            subscription_id: subscriptionId,
            current_period_end: currentPeriodEndISO,
          })
          .eq('id', trainerId);

        if (error) throw error;
        console.log(`✅ Assinatura Stripe ativada com sucesso para o Treinador: ${trainerId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const trainerId = subscription.metadata?.trainerId;
        const customerId = subscription.customer;
        const currentPeriodEndISO = getIsoDate(subscription.current_period_end);

        console.log(`[Webhook] Atualização de assinatura. Status: ${subscription.status}, End: ${currentPeriodEndISO}, TrainerId: ${trainerId}, CustomerId: ${customerId}`);

        if (!trainerId && !customerId) {
          console.warn('⚠️ Assinatura atualizada sem trainerId nos metadados e sem customerId.');
          break;
        }

        let query = supabase
          .from('trainers')
          .update({
            stripe_customer_id: customerId,
            subscription_id: subscription.id,
            subscription_status: subscription.status,
            current_period_end: currentPeriodEndISO,
          });

        if (trainerId) {
          query = query.eq('id', trainerId);
        } else {
          query = query.eq('stripe_customer_id', customerId);
        }

        const { error } = await query;
        if (error) throw error;
        console.log(`✅ Assinatura Stripe renovada/atualizada para o Treinador (TrainerId: ${trainerId || 'N/A'}, CustomerId: ${customerId})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const trainerId = subscription.metadata?.trainerId;
        const customerId = subscription.customer;

        if (!trainerId && !customerId) {
          console.warn('⚠️ Assinatura deletada sem trainerId e sem customerId.');
          break;
        }

        let query = supabase
          .from('trainers')
          .update({
            subscription_status: 'canceled',
          });

        if (trainerId) {
          query = query.eq('id', trainerId);
        } else {
          query = query.eq('stripe_customer_id', customerId);
        }

        const { error } = await query;
        if (error) throw error;
        console.log(`❌ Assinatura Stripe cancelada/deletada para o Treinador (TrainerId: ${trainerId || 'N/A'}, CustomerId: ${customerId})`);
        break;
      }

      default:
        console.log(`ℹ️ Evento ignorado: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error(`❌ Erro ao processar evento no Supabase: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
}
