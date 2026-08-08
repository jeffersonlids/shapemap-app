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

    // Montar payload seguro para a API do Asaas
    const payload = {
      name: 'ShapeMap - Assinatura Mensal Pro',
      description: 'Acesso Pro Ilimitado ao ShapeMap - Avaliação Física',
      value: 19.90,
      chargeType: 'RECURRENT',
      subscriptionCycle: 'MONTHLY',
      billingType: 'UNDEFINED', // Exibe Pix, Cartão de Crédito e Boleto
      dueDateLimitDays: 3, // Validade padrão de dias úteis para o boleto gerado
      externalReference: trainerId // Vincula o ID do treinador no Supabase à cobrança
    };

    // Pré-preencher Nome e E-mail automaticamente no checkout do Asaas
    if (email) {
      payload.customerData = {
        name: nome && nome.trim() ? nome.trim() : email.split('@')[0],
        email: email.trim()
      };
    }

    // Criar Link de Pagamento Recorrente via API do Asaas
    const linkRes = await fetch('https://www.asaas.com/api/v3/paymentLinks', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
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
