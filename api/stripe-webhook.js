import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false, // Desabilita o parser automático do Vercel para ler o buffer bruto (necessário para validar assinatura do Stripe)
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder_key');
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';

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
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // Atualizar perfil do treinador no Supabase
        const { error } = await supabase
          .from('trainers')
          .update({
            stripe_customer_id: customerId,
            subscription_status: subscription.status,
            subscription_id: subscriptionId,
            current_period_end: currentPeriodEnd.toISOString(),
          })
          .eq('id', trainerId);

        if (error) throw error;
        console.log(`✅ Assinatura Stripe ativada com sucesso para o Treinador: ${trainerId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const trainerId = subscription.metadata?.trainerId;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        if (!trainerId) {
          console.warn('⚠️ Assinatura atualizada sem trainerId nos metadados.');
          break;
        }

        const { error } = await supabase
          .from('trainers')
          .update({
            subscription_status: subscription.status,
            current_period_end: currentPeriodEnd.toISOString(),
          })
          .eq('id', trainerId);

        if (error) throw error;
        console.log(`✅ Assinatura Stripe renovada/atualizada para o Treinador: ${trainerId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const trainerId = subscription.metadata?.trainerId;

        if (!trainerId) {
          console.warn('⚠️ Assinatura deletada sem trainerId nos metadados.');
          break;
        }

        const { error } = await supabase
          .from('trainers')
          .update({
            subscription_status: 'canceled',
            // Mantemos a data para histórico, o controle de acesso detectará expirado
          })
          .eq('id', trainerId);

        if (error) throw error;
        console.log(`❌ Assinatura Stripe cancelada/deletada para o Treinador: ${trainerId}`);
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
