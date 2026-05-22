// FitBrand early access lead API - v33
// Vercel serverless function.
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel Environment Variables.
import { createClient } from '@supabase/supabase-js';

function sendJson(res, status, body){
  res.status(status).json(body);
}

function clean(value, max = 500){
  return String(value || '').trim().slice(0, max);
}

export default async function handler(req, res){
  if(req.method !== 'POST'){
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if(!url || !key){
    return sendJson(res, 500, { error: 'Server is missing Supabase environment variables.' });
  }

  let body = req.body || {};
  if(typeof body === 'string'){
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const email = clean(body.email, 160).toLowerCase();
  if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    return sendJson(res, 400, { error: 'Valid email is required.' });
  }

  const lead = {
    email,
    full_name: clean(body.full_name || body.name, 120),
    product_interest: clean(body.product_interest || body.product || 'aesthetic', 80),
    goal: clean(body.goal, 160),
    monthly_price_interest: clean(body.monthly_price_interest || body.price_interest, 80),
    start_timeline: clean(body.start_timeline || 'as-soon-as-ready', 80),
    notes: clean(body.notes, 600),
    source_page: clean(body.source_page || req.headers.referer || 'website', 250)
  };

  try{
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from('early_access_leads')
      .insert(lead)
      .select('id,email,created_at')
      .single();

    if(error) throw error;

    return sendJson(res, 200, { ok: true, lead: data });
  }catch(err){
    console.error('early access lead error', err);
    return sendJson(res, 500, { error: err.message || 'Could not save lead.' });
  }
}
