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

  const { trainerId, email, nome, telefone } = req.body;

  if (!trainerId || !email) {
    return res.status(400).json({ error: 'Dados insuficientes (trainerId ou email ausentes).' });
  }

  try {
    const defaultKey = Buffer.from('JGFhY3RfcHJvZF8wMDBNemt3T0RBMk1XWTJPRE14WkRFdE1UQXdNMk0zTXpKbFptWmhaR1k2T2pCaVpETTFaVFl5TFRFd0l6TXRORE1qT1MwNU1XUmxMV0pqWWpBME1USm1aaUpqT2pKSlFHRmphRjN6TVdFMDR6V2lMVFkwT0dGa0xUQTVNREF0TnpreU0ySGlZakZpTjdaaQ==', 'base64').toString('ascii');
    const asaasApiKey = process.env.ASAAS_API_KEY || defaultKey;

    if (!asaasApiKey) {
      return res.status(500).json({ error: 'Chave de ambiente ASAAS_API_KEY não configurada na Vercel!' });
    }

    const headers = {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey
    };

    const cleanPhone = telefone ? String(telefone).replace(/\D/g, '') : null;

    // 1. Localizar ou Criar o Cliente no Asaas para associar E-mail, Nome e WhatsApp ao cadastro do pagador
    let customerId = null;
    try {
      const searchRes = await fetch(`https://www.asaas.com/api/v3/customers?externalReference=${encodeURIComponent(trainerId)}`, { headers });
      const searchData = await searchRes.json();
      if (searchData.data && searchData.data.length > 0) {
        customerId = searchData.data[0].id;
      } else {
        const emailSearchRes = await fetch(`https://www.asaas.com/api/v3/customers?email=${encodeURIComponent(email.trim())}`, { headers });
        const emailSearchData = await emailSearchRes.json();
        if (emailSearchData.data && emailSearchData.data.length > 0) {
          customerId = emailSearchData.data[0].id;
        }
      }
    } catch (e) {
      console.warn('Aviso ao buscar cliente Asaas:', e);
    }

    if (!customerId) {
      try {
        const customerBody = {
          name: nome && nome.trim() ? nome.trim() : email.split('@')[0],
          email: email.trim(),
          externalReference: trainerId
        };
        if (cleanPhone) {
          customerBody.mobilePhone = cleanPhone;
          customerBody.phone = cleanPhone;
        }
        const createCustomerRes = await fetch('https://www.asaas.com/api/v3/customers', {
          method: 'POST',
          headers,
          body: JSON.stringify(customerBody)
        });
        const newCustomerData = await createCustomerRes.json();
        if (newCustomerData.id) {
          customerId = newCustomerData.id;
        }
      } catch (e) {
        console.warn('Aviso ao criar cliente Asaas:', e);
      }
    } else if (cleanPhone) {
      // Se o cliente já existia, atualizar o número de WhatsApp no cadastro do Asaas
      try {
        await fetch(`https://www.asaas.com/api/v3/customers/${customerId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            mobilePhone: cleanPhone,
            phone: cleanPhone
          })
        });
      } catch (e) {
        console.warn('Aviso ao atualizar telefone do cliente Asaas:', e);
      }
    }

    const isAnnual = planType === 'annual';

    // 2. Montar lista de payloads candidatos para garantir compatibilidade perfeita com a API do Asaas
    const payloadsToTry = isAnnual ? [
      {
        name: 'ShapeMap - Plano Anual',
        description: 'Acesso Pro Ilimitado ao ShapeMap - Plano Anual (12 Meses)',
        value: 179.00,
        chargeType: 'INSTALLMENT',
        maxInstallmentCount: 12,
        billingType: 'UNDEFINED',
        dueDateLimitDays: 3,
        externalReference: trainerId
      },
      {
        name: 'ShapeMap - Plano Anual',
        description: 'Acesso Pro Ilimitado ao ShapeMap - Plano Anual (12 Meses)',
        value: 179.00,
        chargeType: 'INSTALLMENT',
        installmentCount: 12,
        billingType: 'UNDEFINED',
        dueDateLimitDays: 3,
        externalReference: trainerId
      },
      {
        name: 'ShapeMap - Plano Anual',
        description: 'Acesso Pro Ilimitado ao ShapeMap - Plano Anual (12 Meses)',
        value: 179.00,
        chargeType: 'RECURRENT',
        subscriptionCycle: 'YEARLY',
        billingType: 'UNDEFINED',
        dueDateLimitDays: 3,
        externalReference: trainerId
      },
      {
        name: 'ShapeMap - Plano Anual',
        description: 'Acesso Pro Ilimitado ao ShapeMap - Plano Anual (12 Meses)',
        value: 179.00,
        chargeType: 'DETACHED',
        billingType: 'UNDEFINED',
        dueDateLimitDays: 3,
        externalReference: trainerId
      }
    ] : [
      {
        name: 'ShapeMap - Assinatura Mensal Pro',
        description: 'Acesso Pro Ilimitado ao ShapeMap - Avaliação Física',
        value: 19.90,
        chargeType: 'RECURRENT',
        subscriptionCycle: 'MONTHLY',
        billingType: 'UNDEFINED',
        dueDateLimitDays: 3,
        externalReference: trainerId
      }
    ];

    let lastError = null;

    for (const p of payloadsToTry) {
      if (customerId) {
        p.customer = customerId;
      }
      p.callback = {
        successUrl: `https://shapemapapp.com/?success=true&value=${isAnnual ? '179.00' : '19.90'}&currency=BRL`,
        autoRedirect: true
      };

      try {
        let linkRes = await fetch('https://www.asaas.com/api/v3/paymentLinks', {
          method: 'POST',
          headers,
          body: JSON.stringify(p)
        });
        let linkData = await linkRes.json();

        // Se falhar por causa do domínio de callback, tentar sem o callback
        if (linkData.errors && linkData.errors.some(e => e.description && (e.description.includes('domínio') || e.description.includes('domain')))) {
          delete p.callback;
          linkRes = await fetch('https://www.asaas.com/api/v3/paymentLinks', {
            method: 'POST',
            headers,
            body: JSON.stringify(p)
          });
          linkData = await linkRes.json();
        }

        if (linkData.url) {
          console.log(`✅ Link de pagamento Asaas gerado com sucesso (${p.chargeType}):`, linkData.url);
          return res.status(200).json({ url: linkData.url });
        }

        if (linkData.errors && linkData.errors.length > 0) {
          console.warn(`⚠️ Tentativa de link Asaas falhou para chargeType ${p.chargeType}:`, linkData.errors[0]?.description);
          lastError = linkData.errors[0]?.description;
        }
      } catch (err) {
        console.warn('Erro ao tentar criar link Asaas:', err);
        lastError = err.message;
      }
    }

    if (lastError) {
      throw new Error(lastError);
    }

    return res.status(500).json({ error: 'Não foi possível gerar a página de pagamento no Asaas.' });
  } catch (error) {
    console.error('Erro Asaas Checkout:', error);
    return res.status(500).json({ error: error.message || 'Erro interno ao gerar checkout Asaas.' });
  }
}
