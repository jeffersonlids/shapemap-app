export default async function handler(req, res) {
  const asaasApiKey = process.env.ASAAS_API_KEY;

  const headers = {
    'Content-Type': 'application/json',
    'access_token': asaasApiKey
  };

  const payload = {
    billingTypes: ['PIX', 'CREDIT_CARD'],
    chargeTypes: ['RECURRENT'],
    minutesToExpire: 1440,
    externalReference: "test-debug-vercel",
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
      name: "João Teste ShapeMap",
      email: "joao.teste@gmail.com"
    }
  };

  try {
    const checkoutRes = await fetch('https://www.asaas.com/api/v3/checkouts', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const checkoutData = await checkoutRes.json();

    return res.status(200).json({
      status: checkoutRes.status,
      ok: checkoutRes.ok,
      payloadSent: payload,
      asaasResponse: checkoutData
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
