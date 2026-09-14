import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { processReferralReward } from './referral-reward.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

function sha256(text) {
  if (!text) return null;
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}

function addMonths(date, months) {
  const d = new Date(date);
  const targetDay = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== targetDay) {
    d.setDate(0);
  }
  return d;
}

async function sendMetaCapiEvent(email, amount, currency = 'BRL', eventName = 'Purchase', eventId = null, phone = null, name = null) {
  const pixelId = process.env.META_PIXEL_ID || '1230329092413734';
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('⚠️ Meta Pixel ID ou Access Token não configurados no servidor. Pulando Conversions API.');
    return;
  }

  try {
    const hashedEmail = sha256(email);
    
    // Normalizar telefone para o padrão internacional E.164 (com DDI 55 do Brasil)
    let cleanPhone = phone ? String(phone).replace(/\D/g, '') : '';
    if (cleanPhone) {
      if ((cleanPhone.length === 10 || cleanPhone.length === 11) && !cleanPhone.startsWith('55')) {
        cleanPhone = '55' + cleanPhone;
      }
    }
    const hashedPhone = cleanPhone ? sha256(cleanPhone) : null;
    
    let hashedFirstName = null;
    let hashedLastName = null;
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length > 0) hashedFirstName = sha256(parts[0]);
      if (parts.length > 1) hashedLastName = sha256(parts[parts.length - 1]);
    }

    const userData = {
      em: hashedEmail ? [hashedEmail] : [],
      country: [sha256('br')]
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
        value: Number(amount || 0),
        currency: currency ? currency.toUpperCase() : 'BRL'
      }
    };

    if (eventId) {
      eventObj.event_id = String(eventId);
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
      console.error('❌ Erro Meta Conversions API (Asaas):', resData);
    } else {
      console.log(`✅ [Asaas Webhook] Evento Meta CAPI '${eventName}' enviado com sucesso (Event ID: ${eventId}). Response:`, resData);
    }
  } catch (error) {
    console.error('❌ Falha ao enviar evento Meta CAPI (Asaas):', error);
  }
}

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
    const rawRef = String(paymentObj?.externalReference || subscription?.externalReference || '');
    let trainerId = rawRef.includes(':') ? rawRef.split(':')[0] : rawRef;
    const planTag = rawRef.includes(':') ? rawRef.split(':')[1] : '';
    const customerId = paymentObj?.customer || subscription?.customer;
    const subscriptionId = paymentObj?.subscription || subscription?.id;
    let customerEmail = null;

    let asaasCustomerData = null;

    // Se temos customerId, busca dados no cliente do Asaas para identificação e dados de contato
    if (customerId) {
      const asaasApiKey = process.env.ASAAS_API_KEY;
      if (asaasApiKey) {
        try {
          const custRes = await fetch(`https://www.asaas.com/api/v3/customers/${customerId}`, {
            headers: { 'access_token': asaasApiKey }
          });
          if (custRes.ok) {
            const custData = await custRes.json();
            asaasCustomerData = custData;
            const custRef = String(custData.externalReference || '');
            if (!trainerId && custRef) {
              trainerId = custRef.includes(':') ? custRef.split(':')[0] : custRef;
            }
            if (!customerEmail && custData.email) {
              customerEmail = custData.email.trim();
            }
          }
        } catch (custErr) {
          console.warn('⚠️ Aviso ao buscar dados do cliente no Asaas:', custErr);
        }
      }
    }

    // Se ainda não temos o ID, busca no Supabase por email ou asaas_customer_id
    if (!trainerId && (customerId || customerEmail)) {
      try {
        let findQuery = supabase.from('trainers').select('id, email');
        if (customerId && customerEmail) {
          findQuery = findQuery.or(`asaas_customer_id.eq.${customerId},email.eq.${customerEmail}`);
        } else if (customerId) {
          findQuery = findQuery.eq('asaas_customer_id', customerId);
        } else if (customerEmail) {
          findQuery = findQuery.eq('email', customerEmail);
        }
        const { data: foundTrainer } = await findQuery.maybeSingle();
        if (foundTrainer) {
          trainerId = foundTrainer.id;
        }
      } catch (findErr) {
        console.warn('⚠️ Aviso ao localizar treinador por email/customerId:', findErr);
      }
    }

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_DUNNING_RECEIVED') {
      // Pagamento confirmado (Pix, Cartão ou Boleto)!
      const paymentValue = Number(paymentObj?.value || paymentObj?.netValue || 0);
      const paymentDesc = String(paymentObj?.description || '').toLowerCase();
      const paymentName = String(paymentObj?.name || '').toLowerCase();
      const isAnnualPayment = (
        planTag.includes('annual') ||
        paymentValue >= 100 || 
        Boolean(paymentObj?.installmentNumber) || 
        Boolean(paymentObj?.installment) || 
        Boolean(paymentObj?.installmentCount) || 
        paymentDesc.includes('anual') ||
        paymentName.includes('anual')
      );
      const monthsToAdd = isAnnualPayment ? 12 : 1;

      // 1. Buscar dados atuais do treinador para verificar o vencimento existente
      let existingTrainer = null;
      try {
        let queryTrainer = supabase
          .from('trainers')
          .select('id, email, nome, telefone, current_period_end, subscription_status, asaas_subscription_id, asaas_customer_id');

        if (trainerId) {
          queryTrainer = queryTrainer.eq('id', trainerId);
        } else if (customerId) {
          queryTrainer = queryTrainer.eq('asaas_customer_id', customerId);
        } else if (customerEmail) {
          queryTrainer = queryTrainer.eq('email', customerEmail);
        }

        const { data: tData } = await queryTrainer.maybeSingle();
        if (tData) {
          existingTrainer = tData;
          if (!trainerId) trainerId = tData.id;
        }
      } catch (fetchErr) {
        console.warn('⚠️ Falha ao consultar treinador existente antes do pagamento:', fetchErr);
      }

      // Identificar se o cliente JÁ ERA um assinante ativo antes deste pagamento.
      // Se ele já estava ativo, com current_period_end definido e pagando mensalidade normal (< 100):
      // trata-se de uma RENOVAÇÃO AUTOMÁTICA periódica.
      const isExistingActiveSubscriber = Boolean(
        existingTrainer &&
        existingTrainer.subscription_status === 'active' &&
        existingTrainer.current_period_end &&
        !isAnnualPayment
      );

      const now = new Date();

      // 2. Se for assinatura recorrente no Asaas, tentar obter o nextDueDate oficial diretamente da API do Asaas
      let asaasNextDueDate = null;
      if (subscriptionId && process.env.ASAAS_API_KEY) {
        try {
          const subRes = await fetch(`https://www.asaas.com/api/v3/subscriptions/${subscriptionId}`, {
            headers: { 'access_token': process.env.ASAAS_API_KEY }
          });
          if (subRes.ok) {
            const subData = await subRes.json();
            if (subData.nextDueDate) {
              const parsed = new Date(`${subData.nextDueDate}T23:59:59.999Z`);
              if (!isNaN(parsed.getTime())) {
                asaasNextDueDate = parsed;
              }
            }
          }
        } catch (subFetchErr) {
          console.warn('⚠️ Não foi possível consultar nextDueDate da assinatura no Asaas:', subFetchErr);
        }
      }

      // 3. Determinar a data base para prorrogação do período:
      // Se o cliente pagou de forma antecipada, ele ainda possui dias válidos (current_period_end > now).
      // O novo período NÃO deve recomeçar do zero hoje, e sim ser somado a partir do vencimento existente ou do vencimento da fatura!
      let chargeDueDate = null;
      if (paymentObj?.dueDate) {
        const parsed = new Date(`${paymentObj.dueDate}T23:59:59.999Z`);
        if (!isNaN(parsed.getTime())) {
          chargeDueDate = parsed;
        }
      }

      const currentEnd = existingTrainer?.current_period_end ? new Date(existingTrainer.current_period_end) : null;
      const isCurrentEndValid = currentEnd && !isNaN(currentEnd.getTime());

      let baseDate = now;
      if (isCurrentEndValid && currentEnd > now) {
        // Cliente ativo pagando antecipadamente: prorroga a partir da data de término atual
        baseDate = currentEnd;
      } else if (chargeDueDate && chargeDueDate > now) {
        // Fatura com vencimento futuro: prorroga a partir do vencimento da fatura
        baseDate = chargeDueDate;
      } else {
        // Novo cliente ou assinatura expirada: ciclo começa a partir da data de pagamento (hoje)
        baseDate = now;
      }

      let calculatedPeriodEnd = addMonths(baseDate, monthsToAdd);

      // Se o Asaas tem um nextDueDate oficial para a assinatura e ele for posterior, alinha com a data da próxima fatura
      if (asaasNextDueDate && asaasNextDueDate > calculatedPeriodEnd) {
        calculatedPeriodEnd = asaasNextDueDate;
      }

      // Trava de segurança: a nova data de expiração NUNCA pode ser menor do que a que o cliente já tinha
      if (isCurrentEndValid && currentEnd > calculatedPeriodEnd) {
        calculatedPeriodEnd = addMonths(currentEnd, monthsToAdd);
      }

      const periodEnd = calculatedPeriodEnd.toISOString();
      console.log(`📅 [Asaas Webhook] Vencimento calculado para Treinador ${trainerId || customerId}: Base = ${baseDate.toISOString()} ➔ Novo Período Fim = ${periodEnd}`);

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
      } else if (customerEmail) {
        query = query.eq('email', customerEmail);
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

      // Disparar evento de Purchase server-side no Meta Conversions API (CAPI)
      // REGRA DE OURO: Disparar Purchase EXCLUSIVAMENTE para Novas Vendas (1ª compra de novos clientes,
      // reativação de inativos ou adesão ao plano anual).
      // Renovações mensais automáticas de clientes que já eram ativos NÃO disparam Purchase,
      // garantindo que o Meta Ads meça com 100% de fidelidade o CAC e as novas aquisições reais.
      let currentTrainerId = trainerId || existingTrainer?.id;
      try {
        if (isExistingActiveSubscriber) {
          console.log(`ℹ️ [Asaas Webhook] Pagamento recebido referente à RENOVAÇÃO de assinatura ativa para o Treinador ID: ${currentTrainerId}. Evento Purchase não disparado para o Meta Ads para preservar métricas de novas aquisições.`);
        } else {
          const trainerObj = existingTrainer;
          const targetEmail = trainerObj?.email || customerEmail || asaasCustomerData?.email;
          const targetPhone = trainerObj?.telefone || asaasCustomerData?.mobilePhone || asaasCustomerData?.phone;
          const targetName = trainerObj?.nome || asaasCustomerData?.name;

          if (targetEmail) {
            currentTrainerId = trainerObj?.id || currentTrainerId;
            const finalValue = paymentValue > 0 ? paymentValue : (isAnnualPayment ? 179.00 : 19.90);
            await sendMetaCapiEvent(
              targetEmail,
              finalValue,
              'BRL',
              'Purchase',
              paymentObj?.id,
              targetPhone,
              targetName
            );
            console.log(`🎯 [Asaas Webhook] NOVA VENDA confirmada (R$ ${finalValue}) para Treinador ID: ${currentTrainerId}! Evento 'Purchase' enviado com sucesso para o Meta Ads.`);
          }
        }
      } catch (capiErr) {
        console.warn('⚠️ Falha ao processar Meta CAPI (Asaas):', capiErr);
      }

      // Processar bônus de indicação ("Indique e Ganhe")
      if (currentTrainerId) {
        try {
          await processReferralReward(supabase, currentTrainerId);
        } catch (refErr) {
          console.warn('⚠️ Falha ao processar bônus de indicação (Asaas):', refErr);
        }
      }
    } else if (event === 'PAYMENT_OVERDUE' || event === 'PAYMENT_DELETED' || event === 'PAYMENT_REFUNDED' || event === 'SUBSCRIPTION_DELETED') {
      // Pagamento em atraso, cancelado ou reembolsado
      let targetSubId = subscriptionId;

      // Buscar dados atuais do treinador para verificar se a cobrança pertence à assinatura ativa
      let checkQuery = supabase
        .from('trainers')
        .select('id, subscription_status, asaas_subscription_id, current_period_end');

      if (trainerId) {
        checkQuery = checkQuery.eq('id', trainerId);
      } else if (customerId) {
        checkQuery = checkQuery.eq('asaas_customer_id', customerId);
      } else if (customerEmail) {
        checkQuery = checkQuery.eq('email', customerEmail);
      }

      const { data: existingTrainer } = await checkQuery.maybeSingle();

      if (!targetSubId && existingTrainer?.asaas_subscription_id) {
        targetSubId = existingTrainer.asaas_subscription_id;
      }

      // Se for pagamento vencido, inativar a assinatura e remover cobranças futuras pendentes no Asaas
      // Isso interrompe novas recorrências E exclui a fatura pré-gerada do mês seguinte (ex: 11/10),
      // MAS PRESERVA a fatura vencida (status OVERDUE, ex: 11/09) intacta no painel do Asaas!
      if (event === 'PAYMENT_OVERDUE' && process.env.ASAAS_API_KEY) {
        const asaasApiKey = process.env.ASAAS_API_KEY;
        const asaasHeaders = {
          'Content-Type': 'application/json',
          'access_token': asaasApiKey
        };

        // Se subscriptionId não veio direto, buscar assinatura por customerId no Asaas
        if (!targetSubId && customerId) {
          try {
            const subSearchRes = await fetch(`https://www.asaas.com/api/v3/subscriptions?customer=${customerId}`, { headers: asaasHeaders });
            const subSearchData = await subSearchRes.json();
            if (subSearchData.data && subSearchData.data.length > 0) {
              const activeSub = subSearchData.data.find(s => s.status === 'ACTIVE') || subSearchData.data[0];
              targetSubId = activeSub.id;
            }
          } catch (e) {
            console.warn('⚠️ Erro ao buscar assinatura por customerId no Asaas:', e);
          }
        }

        if (targetSubId) {
          // 1. Inativar a assinatura no Asaas
          try {
            const updSubRes = await fetch(`https://www.asaas.com/api/v3/subscriptions/${targetSubId}`, {
              method: 'PUT',
              headers: asaasHeaders,
              body: JSON.stringify({ status: 'INACTIVE' })
            });
            if (updSubRes.ok) {
              console.log(`⏸️ [Asaas Webhook] Assinatura ${targetSubId} inativada com sucesso no Asaas.`);
            } else {
              const updSubErr = await updSubRes.json();
              console.warn(`⚠️ [Asaas Webhook] Aviso ao inativar assinatura no Asaas:`, updSubErr);
            }
          } catch (subErr) {
            console.warn(`⚠️ [Asaas Webhook] Erro ao inativar assinatura no Asaas:`, subErr);
          }

          // 2. Buscar e EXCLUIR cobranças futuras pendentes (status=PENDING)
          // Asaas pré-gera a fatura do próximo ciclo semanas antes. Ao deletar apenas com status PENDING,
          // a cobrança vencida (status OVERDUE) permanece visível no histórico do cliente!
          try {
            const pendingRes = await fetch(`https://www.asaas.com/api/v3/payments?subscription=${targetSubId}&status=PENDING`, {
              headers: asaasHeaders
            });
            if (pendingRes.ok) {
              const pendingData = await pendingRes.json();
              const pendingList = pendingData?.data || [];
              console.log(`🔍 [Asaas Webhook] Assinatura ${targetSubId}: ${pendingList.length} cobrança(s) pendente(s) encontrada(s) para exclusão.`);
              for (const item of pendingList) {
                try {
                  const delRes = await fetch(`https://www.asaas.com/api/v3/payments/${item.id}`, {
                    method: 'DELETE',
                    headers: asaasHeaders
                  });
                  if (delRes.ok) {
                    console.log(`🗑️ [Asaas Webhook] Cobrança futura pendente ${item.id} (vencimento: ${item.dueDate}) excluída com sucesso.`);
                  } else {
                    const delErr = await delRes.json();
                    console.warn(`⚠️ [Asaas Webhook] Falha ao excluir cobrança futura pendente ${item.id}:`, delErr);
                  }
                } catch (delErr) {
                  console.warn(`⚠️ [Asaas Webhook] Erro ao excluir cobrança pendente ${item.id}:`, delErr);
                }
              }
            }
          } catch (listErr) {
            console.warn(`⚠️ [Asaas Webhook] Erro ao consultar cobranças pendentes da assinatura ${targetSubId}:`, listErr);
          }
        }
      }

      // TRAVA DE PROTEÇÃO NO SUPABASE:
      // Se o treinador estiver com status 'active', só impedimos a inativação da conta dele se:
      // 1) A cobrança vencida for de uma tentativa/assinatura DIFERENTE da que está ativa gravada (isDifferentSub), OU
      // 2) O período pago dele for substancialmente futuro (mais de 48h além de agora), indicando pagamento de plano anual ou renovação adiantada.
      // (Se a data de término for hoje ou dentro de 48h, trata-se do próprio ciclo que expirou sem pagamento!)
      const now = new Date();
      const currentEnd = existingTrainer?.current_period_end ? new Date(existingTrainer.current_period_end) : null;
      const isCurrentEndValid = currentEnd && !isNaN(currentEnd.getTime());
      const hasSubstantialFuturePeriod = isCurrentEndValid && currentEnd.getTime() > (now.getTime() + 48 * 60 * 60 * 1000);
      const isDifferentSub = targetSubId && existingTrainer?.asaas_subscription_id && existingTrainer.asaas_subscription_id !== targetSubId;

      if (existingTrainer && existingTrainer.subscription_status === 'active' && (isDifferentSub || hasSubstantialFuturePeriod)) {
        console.log(`ℹ️ [Asaas Webhook] Proteção ativada no Supabase: Ignorando inativação (${event}) pois o treinador possui assinatura diferente (${existingTrainer.asaas_subscription_id}) ou período válido substancial até ${existingTrainer.current_period_end}.`);
        return res.status(200).json({ received: true, ignored: true, reason: 'active_subscription_protected' });
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
