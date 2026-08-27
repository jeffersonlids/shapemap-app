import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { processReferralReward } from './referral-reward.js';

function sha256(text) {
  if (!text) return null;
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

async function sendMetaCapiEvent(email, amount, currency, eventName = 'Purchase', eventId = null, phone = null, name = null) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) return;

  try {
    const hashedEmail = sha256(email);
    const hashedPhone = phone ? sha256(phone.replace(/\D/g, '')) : null;
    
    let hashedFirstName = null;
    let hashedLastName = null;
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length > 0) hashedFirstName = sha256(parts[0]);
      if (parts.length > 1) hashedLastName = sha256(parts[parts.length - 1]);
    }

    const userData = {
      em: hashedEmail ? [hashedEmail] : []
    };
    if (hashedPhone) userData.ph = [hashedPhone];
    if (hashedFirstName) userData.fn = [hashedFirstName];
    if (hashedLastName) userData.ln = [hashedLastName];

    const eventObj = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: userData,
      custom_data: {
        value: amount,
        currency: currency ? currency.toUpperCase() : 'USD'
      }
    };

    if (eventId) {
      eventObj.event_id = eventId;
    }

    await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [eventObj] })
    });
  } catch (error) {
    console.error('❌ Falha ao enviar evento Meta CAPI:', error);
  }
}

export const config = {
  api: {
    bodyParser: false,
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
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

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
    if (sig && webhookSecret) {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } else {
      console.warn('⚠️ STRIPE_WEBHOOK_SECRET ou assinatura ausente. Processando payload JSON em modo direto.');
      event = JSON.parse(buf.toString('utf8'));
    }
  } catch (err) {
    console.warn(`⚠️ Erro na validação de assinatura (${err.message}). Tentando fallback JSON direto.`);
    try {
      event = JSON.parse(buf.toString('utf8'));
    } catch (parseErr) {
      console.error(`❌ Erro fatal ao parsear evento: ${parseErr.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log(`⚡ [Stripe Webhook] Evento recebido: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        let trainerId = session.metadata?.trainerId || session.client_reference_id;
        const customerId = typeof session.customer === 'object' ? session.customer?.id : session.customer;
        const subscriptionId = typeof session.subscription === 'object' ? session.subscription?.id : session.subscription;
        const buyerEmail = session.customer_details?.email || session.customer_email || (typeof session.customer === 'object' ? session.customer?.email : null);
        const buyerPhone = session.customer_details?.phone || '';
        const buyerName = session.customer_details?.name || '';

        let currentPeriodEndISO = null;
        let subStatus = 'active';

        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            currentPeriodEndISO = getIsoDate(subscription.current_period_end);
            subStatus = subscription.status || 'active';
            if (!trainerId && subscription.metadata?.trainerId) {
              trainerId = subscription.metadata.trainerId;
            }
          } catch (subFetchErr) {
            console.warn('⚠️ Não foi possível obter subscription no retrieve:', subFetchErr.message);
          }
        }

        if (!currentPeriodEndISO) {
          currentPeriodEndISO = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }

        // Se trainerId não veio no metadata, busca pelo e-mail no Supabase
        if (!trainerId && buyerEmail) {
          const { data: foundTrainer } = await supabase
            .from('trainers')
            .select('id')
            .eq('email', buyerEmail.trim())
            .maybeSingle();
          if (foundTrainer) {
            trainerId = foundTrainer.id;
          }
        }

        if (trainerId) {
          const { error } = await supabase
            .from('trainers')
            .update({
              stripe_customer_id: customerId,
              subscription_status: subStatus,
              subscription_id: subscriptionId,
              current_period_end: currentPeriodEndISO,
              payment_gateway: 'stripe',
              telefone: buyerPhone || undefined,
            })
            .eq('id', trainerId);

          if (error) console.error('Erro ao atualizar trainer no Supabase:', error);
          else console.log(`✅ [Stripe] Assinatura ativada para o Treinador: ${trainerId} (${buyerEmail})`);

          // Processar bônus de indicação
          try {
            await processReferralReward(supabase, trainerId);
          } catch (refErr) {
            console.warn('⚠️ Falha ao processar bônus de indicação (Stripe):', refErr);
          }
        } else if (buyerEmail) {
          // Atualiza pelo email diretamente se não achou ID
          await supabase
            .from('trainers')
            .update({
              stripe_customer_id: customerId,
              subscription_status: subStatus,
              subscription_id: subscriptionId,
              current_period_end: currentPeriodEndISO,
              payment_gateway: 'stripe',
              telefone: buyerPhone || undefined,
            })
            .eq('email', buyerEmail.trim());
        }

        // Meta Conversions API
        const totalAmount = session.amount_total ? session.amount_total / 100 : 3.90;
        const totalCurrency = session.currency || 'usd';
        if (buyerEmail) {
          await sendMetaCapiEvent(
            buyerEmail, 
            totalAmount, 
            totalCurrency, 
            'Purchase', 
            session.id, 
            buyerPhone,
            buyerName
          );
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = typeof invoice.customer === 'object' ? invoice.customer?.id : invoice.customer;
        const subscriptionId = typeof invoice.subscription === 'object' ? invoice.subscription?.id : invoice.subscription;
        const customerEmail = invoice.customer_email || (typeof invoice.customer === 'object' ? invoice.customer?.email : null);
        const periodEndUnix = invoice.lines?.data?.[0]?.period?.end;
        const currentPeriodEndISO = getIsoDate(periodEndUnix) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        console.log(`[Webhook] Fatura paga no Stripe para cliente: ${customerId} / ${customerEmail}`);

        let query = supabase
          .from('trainers')
          .update({
            stripe_customer_id: customerId,
            subscription_id: subscriptionId,
            subscription_status: 'active',
            current_period_end: currentPeriodEndISO,
            payment_gateway: 'stripe'
          });

        if (customerId) {
          const { error } = await query.eq('stripe_customer_id', customerId);
          if (error && customerEmail) {
            await supabase.from('trainers').update({
              stripe_customer_id: customerId,
              subscription_id: subscriptionId,
              subscription_status: 'active',
              current_period_end: currentPeriodEndISO,
              payment_gateway: 'stripe'
            }).eq('email', customerEmail.trim());
          }
        } else if (customerEmail) {
          await query.eq('email', customerEmail.trim());
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        let trainerId = subscription.metadata?.trainerId;
        const customerId = typeof subscription.customer === 'object' ? subscription.customer?.id : subscription.customer;
        const currentPeriodEndISO = getIsoDate(subscription.current_period_end);
        let customerEmail = null;

        if (!trainerId && customerId) {
          try {
            const cust = await stripe.customers.retrieve(customerId);
            if (cust) {
              trainerId = cust.metadata?.trainerId || null;
              customerEmail = cust.email || null;
            }
          } catch (e) {
            console.warn('⚠️ Erro ao recuperar cliente na Stripe:', e);
          }
        }

        let fetchQuery = supabase.from('trainers').select('id, subscription_id, subscription_status');
        if (trainerId) {
          fetchQuery = fetchQuery.eq('id', trainerId);
        } else if (customerId) {
          fetchQuery = fetchQuery.eq('stripe_customer_id', customerId);
        } else if (customerEmail) {
          fetchQuery = fetchQuery.eq('email', customerEmail);
        }
        const { data: trainersData } = await fetchQuery;
        const existingTrainer = trainersData && trainersData[0];

        if (
          existingTrainer &&
          subscription.status !== 'active' &&
          existingTrainer.subscription_id &&
          existingTrainer.subscription_id !== subscription.id &&
          existingTrainer.subscription_status === 'active'
        ) {
          console.log(`ℹ️ Ignorando atualização não-ativa (${subscription.status}) da assinatura antiga ${subscription.id}`);
          break;
        }

        let query = supabase
          .from('trainers')
          .update({
            stripe_customer_id: customerId,
            subscription_id: subscription.id,
            subscription_status: subscription.status,
            current_period_end: currentPeriodEndISO,
            payment_gateway: 'stripe'
          });

        if (trainerId) {
          query = query.eq('id', trainerId);
        } else if (existingTrainer && existingTrainer.id) {
          query = query.eq('id', existingTrainer.id);
        } else if (customerId) {
          query = query.eq('stripe_customer_id', customerId);
        } else if (customerEmail) {
          query = query.eq('email', customerEmail);
        }

        await query;
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const trainerId = subscription.metadata?.trainerId;
        const customerId = typeof subscription.customer === 'object' ? subscription.customer?.id : subscription.customer;

        let fetchQuery = supabase.from('trainers').select('id, subscription_id, subscription_status');
        if (trainerId) {
          fetchQuery = fetchQuery.eq('id', trainerId);
        } else {
          fetchQuery = fetchQuery.eq('stripe_customer_id', customerId);
        }
        const { data: trainersData } = await fetchQuery;
        const existingTrainer = trainersData && trainersData[0];

        if (
          existingTrainer &&
          existingTrainer.subscription_id &&
          existingTrainer.subscription_id !== subscription.id &&
          existingTrainer.subscription_status === 'active'
        ) {
          console.log(`ℹ️ Ignorando cancelamento da assinatura antiga ${subscription.id}`);
          break;
        }

        let query = supabase.from('trainers').update({ subscription_status: 'canceled' });
        if (trainerId) {
          query = query.eq('id', trainerId);
        } else {
          query = query.eq('stripe_customer_id', customerId);
        }
        await query;
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
