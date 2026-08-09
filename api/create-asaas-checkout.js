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

    // Se der 404 ou erro no domínio do callback, tentar no endpoint api.asaas.com/v3/checkouts
    if (!checkoutRes.ok && checkoutRes.status === 404) {
      checkoutRes = await fetch('https://api.asaas.com/v3/checkouts', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      checkoutData = await checkoutRes.json();
    }

    // Se der erro por conta do domínio do callback não estar cadastrado no Asaas, tentar novamente sem o callback
    if (checkoutData.errors && checkoutData.errors.some(e => e.description && (e.description.includes('domínio') || e.description.includes('domain') || e.description.includes('callback')))) {
      delete payload.callback;
      checkoutRes = await fetch('https://www.asaas.com/api/v3/checkouts', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      checkoutData = await checkoutRes.json();
    }

    // Se a API v3/checkouts retornar o link de pagamento (link ou url)
    const checkoutUrl = checkoutData.link || checkoutData.url;
    if (checkoutUrl) {
      return res.status(200).json({ url: checkoutUrl });
    }

    // Se a API retornar erros, repassar a mensagem exata do Asaas
    if (checkoutData.errors && checkoutData.errors.length > 0) {
      const errorMsg = checkoutData.errors.map(e => e.description).join(' | ');
      console.error('❌ Erro Asaas Checkout V3:', checkoutData.errors);
      return res.status(400).json({ error: `Asaas Checkout V3: ${errorMsg}` });
    }

    console.error('❌ Resposta inesperada do Asaas Checkout:', checkoutData);
    return res.status(500).json({ error: `Erro no Asaas Checkout: ${JSON.stringify(checkoutData)}` });
  } catch (error) {
    console.error('Erro Asaas Checkout:', error);
    return res.status(500).json({ error: error.message || 'Erro interno ao gerar checkout Asaas.' });
  }
}
