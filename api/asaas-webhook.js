import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Opcional: verificar token de segurança do webhook se configurado no Asaas
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
  const requestToken = req.headers['asaas-access-token'] || req.headers['access_token'];

  if (webhookToken && requestToken !== webhookToken) {
    return res.status(401).json({ error: 'Assinatura inválida do Webhook Asaas.' });
  }

  const { event, payment, subscription } = req.body || {};

  console.log(`[Asaas Webhook] Evento recebido: ${event}`);

  if (!supabase) {
    console.error('❌ Supabase não configurado no webhook do Asaas.');
    return res.status(500).json({ error: 'Supabase não configurado.' });
  }

  try {
    const paymentObj = payment || (event && event.startsWith('SUBSCRIPTION') ? subscription : null);
    const trainerId = paymentObj?.externalReference;
    const customerId = paymentObj?.customer;
    const subscriptionId = paymentObj?.subscription || subscription?.id;

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_DUNNING_RECEIVED') {
      // Pagamento confirmado (Pix, Cartão ou Boleto)!
      const paymentValue = Number(paymentObj?.value || paymentObj?.netValue || 0);
      const paymentDesc = String(paymentObj?.description || '').toLowerCase();
      const isAnnualPayment = paymentValue >= 100 || Boolean(paymentObj?.installmentNumber) || paymentDesc.includes('anual');

      const periodEnd = isAnnualPayment
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // Montar objeto de atualização com colunas oficiais do Asaas
      const updateData = {
        subscription_status: 'active',
        current_period_end: periodEnd
      };
      if (customerId) {
        updateData.asaas_customer_id = customerId;
      }
      if (subscriptionId) {
        updateData.asaas_subscription_id = subscriptionId;
      }

      let query = supabase.from('trainers').update(updateData);

      if (trainerId) {
        query = query.eq('id', trainerId);
      } else if (customerId) {
        query = query.eq('asaas_customer_id', customerId);
      }

      const { error } = await query;
      
      // Fallback gracioso: se asaas_subscription_id não existir na tabela, salva asaas_customer_id e dados de ativação
      if (error && (error.message.includes('column') || error.message.includes('does not exist'))) {
        console.warn('⚠️ Coluna opcional ausente no banco. Executando salvamento com colunas padrão e Customer ID...');
        const fallbackData = {
          subscription_status: 'active',
          current_period_end: periodEnd
        };
        if (customerId) fallbackData.asaas_customer_id = customerId;

        if (trainerId) {
          const { error: fallbackErr } = await supabase
            .from('trainers')
            .update(fallbackData)
            .eq('id', trainerId);
          if (fallbackErr) throw fallbackErr;
          console.log(`✅ [Asaas Webhook] Conta e Asaas Customer ID (${customerId}) ativados com sucesso para o Treinador ID: ${trainerId}`);
        }
      } else if (error) {
        throw error;
      } else {
        console.log(`✅ [Asaas Webhook] Conta, Asaas Customer ID (${customerId}) e Subscription ID (${subscriptionId}) atualizados com sucesso para o Treinador ID: ${trainerId || customerId}`);
      }
    } else if (event === 'PAYMENT_OVERDUE' || event === 'PAYMENT_DELETED' || event === 'PAYMENT_REFUNDED' || event === 'SUBSCRIPTION_DELETED') {
      // Pagamento em atraso, cancelado ou reembolsado
      
      // Se for pagamento vencido e tiver ID de assinatura, inativar/cancelar a assinatura no Asaas automaticamente para não gerar cobranças futuras
      if (event === 'PAYMENT_OVERDUE' && subscriptionId && process.env.ASAAS_API_KEY) {
        try {
          await fetch(`https://www.asaas.com/api/v3/subscriptions/${subscriptionId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'access_token': process.env.ASAAS_API_KEY
            }
          });
          console.log(`🗑️ [Asaas Webhook] Assinatura ${subscriptionId} inativada/cancelada automaticamente no Asaas por inadimplência.`);
        } catch (subErr) {
          console.warn(`⚠️ [Asaas Webhook] Erro ao inativar assinatura no Asaas:`, subErr);
        }
      }

      let query = supabase.from('trainers').update({
        subscription_status: 'inactive'
      });

      if (trainerId) {
        query = query.eq('id', trainerId);
      } else if (customerId) {
        try {
          query = query.eq('asaas_customer_id', customerId);
        } catch (e) {
          query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        }
      }

      const { error } = await query;
      if (error && (error.message.includes('column') || error.message.includes('does not exist'))) {
        // Fallback simples se as colunas personalizadas do Asaas não existirem
        if (trainerId) {
          const { error: fallbackError } = await supabase
            .from('trainers')
            .update({ subscription_status: 'inactive' })
            .eq('id', trainerId);
          if (fallbackError) throw fallbackError;
          console.log(`ℹ️ [Asaas Webhook] Conta inativada com sucesso usando campos padrão.`);
        }
      } else if (error) {
        throw error;
      } else {
        console.log(`ℹ️ [Asaas Webhook] Conta desativada/inativada para o Treinador ID: ${trainerId || customerId}`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro no processamento do Webhook Asaas:', error);
    return res.status(500).json({ error: error.message });
  }
}
