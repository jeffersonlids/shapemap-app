import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder_key');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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

  const { customerId } = req.body;

  if (!customerId) {
    return res.status(400).json({ error: 'Identificador do cliente (customerId) ausente.' });
  }

  try {
    const origin = req.headers.origin || 'http://localhost:5173';
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/`
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Erro Stripe billing portal:', error);
    return res.status(500).json({ error: error.message });
  }
}
