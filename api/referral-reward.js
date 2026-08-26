/**
 * Módulo de Processamento de Recompensa de Indicação ("Indique e Ganhe")
 * 
 * Regras:
 * 1. Só concede bônus se o novo assinante tiver 'referred_by' e 'referral_rewarded' for false.
 * 2. Prorroga a validade (current_period_end) do indicador em +30 dias.
 * 3. Se o indicador usar Asaas, adia o nextDueDate da assinatura e de cobranças pendentes.
 * 4. Se o indicador usar Stripe, adia o ciclo de cobrança via trial_end na Stripe.
 * 5. Marca 'referral_rewarded = true' no novo assinante para impedir duplicação.
 */

export async function processReferralReward(supabase, newSubscriberTrainerId) {
  if (!supabase || !newSubscriberTrainerId) {
    return { success: false, reason: 'missing_params' };
  }

  try {
    console.log(`🎁 [Indique e Ganhe] Verificando elegibilidade de indicação para o assinante: ${newSubscriberTrainerId}`);

    // 1. Buscar dados do novo assinante
    const { data: newSubscriber, error: subErr } = await supabase
      .from('trainers')
      .select('id, email, nome, referred_by, referral_rewarded')
      .eq('id', newSubscriberTrainerId)
      .maybeSingle();

    if (subErr || !newSubscriber) {
      console.warn(`⚠️ [Indique e Ganhe] Assinante ${newSubscriberTrainerId} não encontrado no banco.`);
      return { success: false, reason: 'subscriber_not_found' };
    }

    if (!newSubscriber.referred_by) {
      console.log(`ℹ️ [Indique e Ganhe] Assinante ${newSubscriberTrainerId} não veio de indicação.`);
      return { success: false, reason: 'no_referrer' };
    }

    if (newSubscriber.referral_rewarded) {
      console.log(`ℹ️ [Indique e Ganhe] Assinante ${newSubscriberTrainerId} já gerou recompensa anteriormente (renovação). Ignorando.`);
      return { success: false, reason: 'already_rewarded' };
    }

    // Trava de autoindicação
    if (String(newSubscriber.referred_by).trim().toLowerCase() === String(newSubscriber.id).trim().toLowerCase()) {
      console.warn(`⚠️ [Indique e Ganhe] Tentativa de autoindicação detectada (${newSubscriber.id}). Ignorando.`);
      return { success: false, reason: 'self_referral' };
    }

    const referrerIdOrCode = String(newSubscriber.referred_by).trim();

    // 2. Buscar o indicador (por ID ou por referral_code)
    let queryReferrer = supabase.from('trainers').select('*');
    if (referrerIdOrCode.length === 36 || referrerIdOrCode.includes('-')) {
      queryReferrer = queryReferrer.eq('id', referrerIdOrCode);
    } else {
      queryReferrer = queryReferrer.or(`id.eq.${referrerIdOrCode},referral_code.eq.${referrerIdOrCode}`);
    }

    const { data: referrer, error: refErr } = await queryReferrer.maybeSingle();

    if (refErr || !referrer) {
      console.warn(`⚠️ [Indique e Ganhe] Indicador '${referrerIdOrCode}' não encontrado.`);
      return { success: false, reason: 'referrer_not_found' };
    }

    // 3. Calcular a nova data de vencimento (+30 dias a partir da data atual de vencimento do indicador)
    const now = new Date();
    const currentEnd = referrer.current_period_end ? new Date(referrer.current_period_end) : now;
    const baseDate = currentEnd > now ? currentEnd : now;
    const newPeriodEndDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const newPeriodEndISO = newPeriodEndDate.toISOString();
    const newDueDateYMD = newPeriodEndDate.toISOString().split('T')[0];

    console.log(`🎉 [Indique e Ganhe] Bonificando indicador ${referrer.nome} (${referrer.id}). Vencimento anterior: ${referrer.current_period_end || 'Nenhum'} ➔ Novo: ${newPeriodEndISO}`);

    // 4. Prorrogar no Gateway de Pagamento do Indicador
    const isAsaas = referrer.asaas_subscription_id || referrer.payment_gateway === 'asaas';
    const isStripe = referrer.stripe_customer_id || referrer.payment_gateway === 'stripe';

    // A) Prorrogação no Asaas
    if (isAsaas && process.env.ASAAS_API_KEY) {
      try {
        const asaasApiKey = process.env.ASAAS_API_KEY;
        const headers = { 'Content-Type': 'application/json', 'access_token': asaasApiKey };

        if (referrer.asaas_subscription_id) {
          // Alterar próximo vencimento da assinatura
          const updateSubRes = await fetch(`https://www.asaas.com/api/v3/subscriptions/${referrer.asaas_subscription_id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ nextDueDate: newDueDateYMD })
          });
          const updateSubData = await updateSubRes.json();
          console.log(`✅ [Asaas Indicação] Próximo vencimento da assinatura ${referrer.asaas_subscription_id} adiado para ${newDueDateYMD}:`, updateSubData?.id || updateSubData);

          // Se houver cobrança pendente gerada, adiar também
          const payRes = await fetch(`https://www.asaas.com/api/v3/payments?subscription=${referrer.asaas_subscription_id}&status=PENDING`, { headers });
          const payData = await payRes.json();
          if (payData.data && Array.isArray(payData.data)) {
            for (const payment of payData.data) {
              await fetch(`https://www.asaas.com/api/v3/payments/${payment.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ dueDate: newDueDateYMD })
              });
              console.log(`✅ [Asaas Indicação] Cobrança pendente ${payment.id} adiada para ${newDueDateYMD}`);
            }
          }
        }
      } catch (asaasErr) {
        console.error('❌ [Asaas Indicação] Erro ao comunicar com Asaas:', asaasErr);
      }
    }

    // B) Prorrogação no Stripe
    if (isStripe && (referrer.subscription_id || referrer.stripe_customer_id) && process.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        let subId = referrer.subscription_id;
        if (!subId && referrer.stripe_customer_id) {
          const subs = await stripe.subscriptions.list({ customer: referrer.stripe_customer_id, status: 'active', limit: 1 });
          if (subs.data.length > 0) subId = subs.data[0].id;
        }

        if (subId) {
          const trialEndUnix = Math.floor(newPeriodEndDate.getTime() / 1000);
          await stripe.subscriptions.update(subId, {
            trial_end: trialEndUnix,
            proration_behavior: 'none'
          });
          console.log(`✅ [Stripe Indicação] Assinatura Stripe ${subId} estendida até ${newPeriodEndISO}`);
        }
      } catch (stripeErr) {
        console.error('❌ [Stripe Indicação] Erro ao comunicar com Stripe:', stripeErr);
      }
    }

    // 5. Atualizar no Supabase
    // A) Estender data do indicador
    const { error: updRefErr } = await supabase
      .from('trainers')
      .update({ current_period_end: newPeriodEndISO })
      .eq('id', referrer.id);

    if (updRefErr) {
      console.error('❌ [Indique e Ganhe] Erro ao atualizar current_period_end do indicador no Supabase:', updRefErr);
    }

    // B) Marcar novo assinante como recompensado
    const { error: updSubErr } = await supabase
      .from('trainers')
      .update({ referral_rewarded: true })
      .eq('id', newSubscriber.id);

    if (updSubErr) {
      console.error('❌ [Indique e Ganhe] Erro ao marcar referral_rewarded no assinante:', updSubErr);
    }

    console.log(`🎉 [Indique e Ganhe] Processo concluído com sucesso! Indicador: ${referrer.id}, Novo Vencimento: ${newPeriodEndISO}`);
    return { success: true, referrerId: referrer.id, newPeriodEnd: newPeriodEndISO };

  } catch (error) {
    console.error('❌ [Indique e Ganhe] Falha crítica ao processar recompensa:', error);
    return { success: false, error: error.message };
  }
}
