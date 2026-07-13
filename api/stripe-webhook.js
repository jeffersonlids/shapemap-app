import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function sha256(text) {
  if (!text) return null;
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

async function sendMetaCapiEvent(email, amount, currency, eventName = 'Purchase', eventId = null, phone = null, name = null) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('⚠️ Meta Pixel ID ou Access Token não configurados no servidor. Pulando Conversions API.');
    return;
  }

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
        currency: currency ? currency.toUpperCase() : 'BRL'
      }
    };

    if (eventId) {
      eventObj.event_id = eventId;
    }

    const payload = {
      data: [eventObj]
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const resData = await response.json();
    if (!response.ok) {
      console.error('❌ Erro Meta Conversions API:', resData);
    } else {
      console.log(`✅ Evento Meta CAPI '${eventName}' enviado com sucesso (Event ID: ${eventId}). Response:`, resData);
    }
  } catch (error) {
    console.error('❌ Falha ao enviar evento Meta CAPI:', error);
  }
}

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

        const buyerPhone = session.customer_details?.phone || '';

        // Atualizar perfil do treinador no Supabase
        const { error } = await supabase
          .from('trainers')
          .update({
            stripe_customer_id: customerId,
            subscription_status: subscription.status,
            subscription_id: subscriptionId,
            current_period_end: currentPeriodEndISO,
            telefone: buyerPhone,
          })
          .eq('id', trainerId);

        if (error) throw error;
        console.log(`✅ Assinatura Stripe ativada com sucesso para o Treinador: ${trainerId}`);

        // Disparar evento de conversão para a Meta (Facebook) via CAPI
        const buyerEmail = session.customer_details?.email || session.customer_email;
        const buyerName = session.customer_details?.name || '';
        const totalAmount = session.amount_total ? session.amount_total / 100 : 99.00;
        const totalCurrency = session.currency || 'brl';
        if (buyerEmail) {
          await sendMetaCapiEvent(
            buyerEmail, 
            totalAmount, 
            totalCurrency, 
            'Purchase', 
            session.id, // eventId
            buyerPhone,
            buyerName
          );
        }
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

      case 'checkout.session.expired': {
        const session = event.data.object;
        const trainerId = session.metadata?.trainerId;
        const phone = session.customer_details?.phone;

        if (trainerId && phone) {
          const { error } = await supabase
            .from('trainers')
            .update({
              telefone: phone,
            })
            .eq('id', trainerId);

          if (error) {
            console.error(`❌ Erro ao atualizar telefone de checkout expirado: ${error.message}`);
          } else {
            console.log(`✅ Telefone de lead recuperado com sucesso via checkout expirado: ${trainerId} -> ${phone}`);
          }
        }
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
