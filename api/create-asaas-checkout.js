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

    const cleanCpfCnpj = cpfCnpj ? String(cpfCnpj).replace(/\D/g, '') : undefined;

    // 1. Buscar se o cliente já existe no Asaas pelo e-mail
    const searchRes = await fetch(`https://www.asaas.com/api/v3/customers?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers
    });
    const searchData = await searchRes.json();

    let customerId;
    if (searchData.data && searchData.data.length > 0) {
      customerId = searchData.data[0].id;
      // Se tiver CPF/CNPJ novo informado, atualizar o cadastro existente no Asaas
      if (cleanCpfCnpj && (!searchData.data[0].cpfCnpj || searchData.data[0].cpfCnpj !== cleanCpfCnpj)) {
        await fetch(`https://www.asaas.com/api/v3/customers/${customerId}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ cpfCnpj: cleanCpfCnpj, name: nome || searchData.data[0].name })
        });
      }
    } else {
      // 2. Criar cliente no Asaas com CPF/CNPJ se fornecido
      const createCustRes = await fetch('https://www.asaas.com/api/v3/customers', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: nome || 'Treinador ShapeMap',
          email: email,
          cpfCnpj: cleanCpfCnpj,
          externalReference: trainerId
        })
      });
      const createCustData = await createCustRes.json();
      if (createCustData.errors) {
        throw new Error(createCustData.errors[0]?.description || 'Erro ao criar cliente no Asaas.');
      }
      customerId = createCustData.id;
    }

    // 3. Criar assinatura recorrente no Asaas
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
        billingType: 'UNDEFINED', // Permite o cliente escolher Pix, Cartão ou Boleto no checkout do Asaas
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

    // 4. Buscar fatura gerada para obter o link direto de checkout / Pix
    const paymentsRes = await fetch(`https://www.asaas.com/api/v3/subscriptions/${subData.id}/payments`, {
      method: 'GET',
      headers
    });
    const paymentsData = await paymentsRes.json();

    let checkoutUrl = subData.invoiceUrl;
    if (paymentsData.data && paymentsData.data.length > 0) {
      checkoutUrl = paymentsData.data[0].invoiceUrl || paymentsData.data[0].bankSlipUrl || checkoutUrl;
    }

    return res.status(200).json({ url: checkoutUrl || `https://www.asaas.com/i/${subData.id}` });
  } catch (error) {
    console.error('Erro Asaas Checkout:', error);
    return res.status(500).json({ error: error.message || 'Erro interno ao gerar checkout Asaas.' });
  }
}
