export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { trainerId, email, nome } = req.body;

  if (!trainerId || !email) {
    return res.status(400).json({ error: 'Dados insuficientes (trainerId ou email ausentes).' });
  }

  try {
    const asaasApiKey = process.env.ASAAS_API_KEY;

    if (!asaasApiKey) {
      return res.status(500).json({ error: 'Chave de ambiente ASAAS_API_KEY não configurada na Vercel!' });
    }

    const headers = {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey
    };

    // Montar o payload do Asaas Checkout V3 (/v3/checkouts) com dados do cliente e assinatura pré-configurados
    const payload = {
      billingTypes: ['PIX', 'CREDIT_CARD'],
      chargeTypes: ['RECURRENT'],
      minutesToExpire: 1440, // 24 horas de validade da sessão
      externalReference: trainerId,
      callback: {
        successUrl: `https://shapemapapp.com/?success=true&value=19.90&currency=BRL`,
        cancelUrl: `https://shapemapapp.com/?canceled=true`,
        expiredUrl: `https://shapemapapp.com/?expired=true`
      },
      subscription: {
        cycle: 'MONTHLY',
        value: 19.90
      },
      items: [
        {
          name: 'ShapeMap Pro - Plano Mensal',
          description: 'Acesso Ilimitado ao ShapeMap - Avaliação Física Profissional',
          quantity: 1,
          value: 19.90
        }
      ],
      customerData: {
        name: nome && nome.trim() ? nome.trim() : email.split('@')[0],
        email: email.trim()
      }
    };

    // 1. Criar a sessão de checkout moderna no Asaas (/v3/checkouts)
    let checkoutRes = await fetch('https://www.asaas.com/api/v3/checkouts', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    let checkoutData = await checkoutRes.json();

    // Se der erro por conta do domínio do callback não estar cadastrado na conta do Asaas, tentar novamente sem o callback
    if (checkoutData.errors && checkoutData.errors.some(e => e.description && (e.description.includes('domínio') || e.description.includes('domain')))) {
      delete payload.callback;
      checkoutRes = await fetch('https://www.asaas.com/api/v3/checkouts', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      checkoutData = await checkoutRes.json();
    }

    // Se a API v3/checkouts retornar o link de pagamento
    const checkoutUrl = checkoutData.link || checkoutData.url;
    if (checkoutUrl) {
      return res.status(200).json({ url: checkoutUrl });
    }

    // Fallback: se por algum motivo /v3/checkouts falhar por restrição de conta, tentar o /v3/paymentLinks
    console.warn('⚠️ /v3/checkouts não retornou link. Tentando fallback para /v3/paymentLinks...');
    
    // Tentar localizar customerId existente para vincular
    let customerId = null;
    try {
      const searchRes = await fetch(`https://www.asaas.com/api/v3/customers?externalReference=${encodeURIComponent(trainerId)}`, { headers });
      const searchData = await searchRes.json();
      if (searchData.data && searchData.data.length > 0) {
        customerId = searchData.data[0].id;
      }
    } catch (e) {}

    const fallbackPayload = {
      name: 'ShapeMap - Assinatura Mensal Pro',
      description: 'Acesso Pro Ilimitado ao ShapeMap - Avaliação Física',
      value: 19.90,
      chargeType: 'RECURRENT',
      subscriptionCycle: 'MONTHLY',
      billingType: 'UNDEFINED',
      dueDateLimitDays: 3,
      externalReference: trainerId
    };
    if (customerId) fallbackPayload.customer = customerId;

    const linkRes = await fetch('https://www.asaas.com/api/v3/paymentLinks', {
      method: 'POST',
      headers,
      body: JSON.stringify(fallbackPayload)
    });
    const linkData = await linkRes.json();

    if (linkData.url) {
      return res.status(200).json({ url: linkData.url });
    }

    if (checkoutData.errors && checkoutData.errors.length > 0) {
      console.error('Erro detalhado Asaas Checkout:', checkoutData.errors);
      throw new Error(checkoutData.errors[0]?.description || 'Erro ao gerar checkout no Asaas.');
    }

    return res.status(500).json({ error: 'Não foi possível gerar a página de pagamento no Asaas.' });
  } catch (error) {
    console.error('Erro Asaas Checkout:', error);
    return res.status(500).json({ error: error.message || 'Erro interno ao gerar checkout Asaas.' });
  }
}
