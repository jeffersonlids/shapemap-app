import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder_key');

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
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

  const { customerId, email } = req.body;

  if (!customerId || !email) {
    return res.status(400).json({ error: 'Faltando customerId ou e-mail.' });
  }

  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return res.status(500).json({ error: 'STRIPE_SECRET_KEY não configurada no servidor.' });
    }

    // Atualizar e-mail do cliente na Stripe
    const customer = await stripe.customers.update(customerId, {
      email: email,
    });

    console.log(`✅ E-mail do cliente Stripe atualizado: ${customerId} -> ${email}`);
    return res.status(200).json({ success: true, customerId: customer.id, email: customer.email });
  } catch (error) {
    console.error('Erro ao atualizar e-mail na Stripe:', error);
    return res.status(500).json({ error: error.message });
  }
}
