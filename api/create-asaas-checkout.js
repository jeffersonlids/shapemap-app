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

  const { trainerId, email } = req.body;

  if (!trainerId || !email) {
    return res.status(400).json({ error: 'Dados insuficientes (trainerId ou email ausentes).' });
  }

  try {
    // Se houver um link de pagamento fixo configurado na Vercel, usar diretamente
    if (process.env.ASAAS_PAYMENT_LINK_URL) {
      const fixedUrl = process.env.ASAAS_PAYMENT_LINK_URL;
      const separator = fixedUrl.includes('?') ? '&' : '?';
      return res.status(200).json({ url: `${fixedUrl}${separator}externalReference=${encodeURIComponent(trainerId)}` });
    }

    const asaasApiKey = process.env.ASAAS_API_KEY;

    if (!asaasApiKey) {
      return res.status(500).json({ error: 'Chave de ambiente ASAAS_API_KEY não configurada na Vercel!' });
    }

    const headers = {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey
    };

    // 1. Tentar criar Link de Pagamento Recorrente via API do Asaas
    let linkRes = await fetch('https://www.asaas.com/api/v3/paymentLinks', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'ShapeMap - Assinatura Mensal Pro',
        description: 'Acesso Pro Ilimitado ao ShapeMap - Avaliação Física',
        value: 19.90,
        billingType: 'UNDEFINED',
        chargeType: 'RECURRING',
        subscriptionCycle: 'MONTHLY',
        externalReference: trainerId
      })
    });

    let linkData = await linkRes.json();

    if (linkData.url) {
      return res.status(200).json({ url: linkData.url });
    }

    // 2. Se UNDEFINED der erro de validação, tentar especificando PIX
    linkRes = await fetch('https://www.asaas.com/api/v3/paymentLinks', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'ShapeMap - Assinatura Mensal Pro',
        description: 'Acesso Pro Ilimitado ao ShapeMap - Avaliação Física',
        value: 19.90,
        billingType: 'PIX',
        chargeType: 'RECURRING',
        subscriptionCycle: 'MONTHLY',
        externalReference: trainerId
      })
    });

    linkData = await linkRes.json();

    if (linkData.url) {
      return res.status(200).json({ url: linkData.url });
    }

    if (linkData.errors) {
      throw new Error(linkData.errors[0]?.description || 'Erro ao gerar link de pagamento no Asaas.');
    }

    return res.status(500).json({ error: 'Não foi possível gerar a página de pagamento.' });
  } catch (error) {
    console.error('Erro Asaas Checkout:', error);
    return res.status(500).json({ error: error.message || 'Erro interno ao gerar checkout Asaas.' });
  }
}
