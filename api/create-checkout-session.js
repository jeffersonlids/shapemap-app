import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder_key');

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
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!stripeSecret || !priceId) {
      return res.status(500).json({ 
        error: 'Chaves de ambiente STRIPE_SECRET_KEY ou STRIPE_PRICE_ID não configuradas!' 
      });
    }

    // 1. Buscar se já existe um cliente no Stripe com este e-mail
    let customer;
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      // Criar novo cliente
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          trainerId: trainerId,
        },
      });
    }

    // 2. Criar a sessão do Checkout
    const origin = req.headers.origin || 'http://localhost:5173';
    
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?success=false`,
      metadata: {
        trainerId: trainerId,
      },
      subscription_data: {
        metadata: {
          trainerId: trainerId,
        },
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Erro Stripe checkout:', error);
    return res.status(500).json({ error: error.message });
  }
}
