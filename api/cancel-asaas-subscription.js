import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

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

  const { subscriptionId, trainerId } = req.body;
  const asaasApiKey = process.env.ASAAS_API_KEY;

  if (!asaasApiKey) {
    return res.status(500).json({ error: 'Chave de ambiente ASAAS_API_KEY não configurada na Vercel!' });
  }

  const headers = {
    'Content-Type': 'application/json',
    'access_token': asaasApiKey
  };

  try {
    let targetSubId = subscriptionId;

    // Se subscriptionId não foi enviado pelo frontend, tentar encontrar via API do Asaas usando o externalReference (trainerId)
    if (!targetSubId && trainerId) {
      const searchRes = await fetch(`https://www.asaas.com/api/v3/subscriptions?externalReference=${encodeURIComponent(trainerId)}`, {
        headers
      });
      const searchData = await searchRes.json();
      if (searchData.data && searchData.data.length > 0) {
        const activeSub = searchData.data.find(s => s.status === 'ACTIVE') || searchData.data[0];
        targetSubId = activeSub.id;
      }
    }

    if (!targetSubId) {
      return res.status(400).json({ error: 'Nenhuma assinatura ativa encontrada no Asaas para cancelar.' });
    }

    // Cancelar/remover assinatura via DELETE /v3/subscriptions/{id} no Asaas
    const deleteRes = await fetch(`https://www.asaas.com/api/v3/subscriptions/${targetSubId}`, {
      method: 'DELETE',
      headers
    });

    const deleteData = await deleteRes.json();

    if (deleteData.deleted || deleteData.status === 'INACTIVE' || deleteData.id) {
      // Atualizar o status do treinador no Supabase para 'canceled' (mantendo o período pago)
      if (supabase && trainerId) {
        await supabase
          .from('trainers')
          .update({
            subscription_status: 'canceled'
          })
          .eq('id', trainerId);
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Assinatura cancelada com sucesso no Asaas.' 
      });
    }

    if (deleteData.errors && deleteData.errors.length > 0) {
      throw new Error(deleteData.errors[0]?.description || 'Erro ao cancelar assinatura no Asaas.');
    }

    return res.status(500).json({ error: 'Não foi possível cancelar a assinatura no Asaas.' });
  } catch (error) {
    console.error('Erro ao cancelar assinatura Asaas:', error);
    return res.status(500).json({ error: error.message || 'Erro interno ao cancelar assinatura.' });
  }
}
