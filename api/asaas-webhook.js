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
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // 1. Tentar atualizar com todas as colunas (incluindo asaas_customer_id e asaas_subscription_id)
      let query = supabase.from('trainers').update({
        subscription_status: 'active',
        current_period_end: thirtyDaysFromNow,
        asaas_customer_id: customerId || null,
        asaas_subscription_id: subscriptionId || null
      });

      if (trainerId) {
        query = query.eq('id', trainerId);
      } else if (customerId) {
        // Fallback caso não tenha o trainerId nos metadados, mas tenha o customerId mapeado
        try {
          query = query.eq('asaas_customer_id', customerId);
        } catch (e) {
          query = query.eq('id', '00000000-0000-0000-0000-000000000000'); // Forçar falha para cair no catch abaixo
        }
      }

      const { error } = await query;
      
      // 2. Fallback robusto: se der erro de coluna inexistente no banco
      if (error && (error.message.includes('column') || error.message.includes('does not exist'))) {
        console.warn('⚠️ Colunas asaas_customer_id ou asaas_subscription_id não encontradas no banco. Usando colunas padrão...');
        
        let fallbackQuery = supabase.from('trainers').update({
          subscription_status: 'active',
          current_period_end: thirtyDaysFromNow
        });

        if (trainerId) {
          fallbackQuery = fallbackQuery.eq('id', trainerId);
          const { error: fallbackError } = await fallbackQuery;
          if (fallbackError) throw fallbackError;
          console.log(`✅ [Asaas Webhook] Conta ativada com sucesso usando colunas padrão para o Treinador ID: ${trainerId}`);
        } else {
          console.error('❌ Não foi possível realizar a ativação: colunas customizadas ausentes no banco e sem trainerId de referência.');
          throw error;
        }
      } else if (error) {
        throw error;
      } else {
        console.log(`✅ [Asaas Webhook] Conta ativada com sucesso para o Treinador ID: ${trainerId || customerId}`);
      }
    } else if (event === 'PAYMENT_OVERDUE' || event === 'PAYMENT_DELETED' || event === 'PAYMENT_REFUNDED' || event === 'SUBSCRIPTION_DELETED') {
      // Pagamento em atraso, cancelado ou reembolsado
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
