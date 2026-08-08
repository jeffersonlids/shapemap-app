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
    // 1. Se houver um link de pagamento configurado na Vercel (ASAAS_PAYMENT_LINK_URL)
    if (process.env.ASAAS_PAYMENT_LINK_URL) {
      const baseUrl = process.env.ASAAS_PAYMENT_LINK_URL.trim();
      const separator = baseUrl.includes('?') ? '&' : '?';
      const checkoutUrl = `${baseUrl}${separator}externalReference=${encodeURIComponent(trainerId)}&email=${encodeURIComponent(email)}`;
      return res.status(200).json({ url: checkoutUrl });
    }

    const asaasApiKey = process.env.ASAAS_API_KEY;

    if (!asaasApiKey) {
      return res.status(500).json({ error: 'Chave de ambiente ASAAS_API_KEY não configurada na Vercel!' });
    }

    const headers = {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey
    };

    // 2. Tentar criar Link de Pagamento Recorrente via API do Asaas com parâmetros limpos
    const linkRes = await fetch('https://www.asaas.com/api/v3/paymentLinks', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'ShapeMap - Assinatura Mensal Pro',
        description: 'Acesso Pro Ilimitado ao ShapeMap - Avaliação Física',
        value: 19.90,
        chargeType: 'RECURRING',
        subscriptionCycle: 'MONTHLY',
        billingType: 'UNDEFINED',
        externalReference: trainerId
      })
    });

    const linkData = await linkRes.json();

    if (linkData.url) {
      return res.status(200).json({ url: linkData.url });
    }

    if (linkData.errors && linkData.errors.length > 0) {
      console.error('Erro detalhado Asaas:', linkData.errors);
      throw new Error(linkData.errors[0]?.description || 'Erro ao gerar link de pagamento no Asaas.');
    }

    return res.status(500).json({ error: 'Não foi possível gerar a página de pagamento no Asaas.' });
  } catch (error) {
    console.error('Erro Asaas Checkout:', error);
    return res.status(500).json({ error: error.message || 'Erro interno ao gerar checkout Asaas.' });
  }
}
