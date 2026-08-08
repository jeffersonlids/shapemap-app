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

  const { trainerId, email, nome, cpfCnpj } = req.body;

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

    // 1. Tentar criar Link de Pagamento Recorrente (O checkout do Asaas solicita o CPF/CNPJ na própria tela)
    const linkRes = await fetch('https://www.asaas.com/api/v3/paymentLinks', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'ShapeMap - Assinatura Mensal Pro',
        description: 'Acesso Pro ao ShapeMap - Avaliação Física',
        value: 19.90,
        billingType: 'UNDEFINED', // Permite o cliente escolher Pix, Cartão ou Boleto na tela do Asaas
        chargeType: 'RECURRING',
        subscriptionCycle: 'MONTHLY',
        externalReference: trainerId
      })
    });

    const linkData = await linkRes.json();

    if (linkData.url) {
      return res.status(200).json({ url: linkData.url });
    }

    // 2. Fallback: Se a API de links de pagamento falhar, buscar ou criar cliente direto
    const searchRes = await fetch(`https://www.asaas.com/api/v3/customers?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers
    });
    const searchData = await searchRes.json();

    let customerId;
    if (searchData.data && searchData.data.length > 0) {
      customerId = searchData.data[0].id;
    } else {
      const createCustRes = await fetch('https://www.asaas.com/api/v3/customers', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: nome || 'Treinador ShapeMap',
          email: email,
          cpfCnpj: cpfCnpj || undefined,
          externalReference: trainerId
        })
      });
      const createCustData = await createCustRes.json();
      if (createCustData.errors) {
        throw new Error(createCustData.errors[0]?.description || 'Erro ao criar cliente no Asaas.');
      }
      customerId = createCustData.id;
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const nextDueDate = `${yyyy}-${mm}-${dd}`;

    const subRes = await fetch('https://www.asaas.com/api/v3/subscriptions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer: customerId,
        billingType: 'UNDEFINED',
        value: 19.90,
        nextDueDate: nextDueDate,
        cycle: 'MONTHLY',
        description: 'ShapeMap - Assinatura Mensal Pro',
        externalReference: trainerId
      })
    });
    const subData = await subRes.json();

    if (subData.errors) {
      throw new Error(subData.errors[0]?.description || 'Erro ao criar assinatura no Asaas.');
    }

    return res.status(200).json({ url: subData.invoiceUrl || `https://www.asaas.com/i/${subData.id}` });
  } catch (error) {
    console.error('Erro Asaas Checkout:', error);
    return res.status(500).json({ error: error.message || 'Erro interno ao gerar checkout Asaas.' });
  }
}
