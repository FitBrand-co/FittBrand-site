import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_DASHBOARD_PASSWORD;

const PRODUCT_NAMES = {
  aesthetic:'Aesthetic Program',
  shred:'Shred Program',
  strength:'Strength Program',
  mealplan:'Meal Plan Guide AI',
  bundle:'Complete Bundle + Meal Plan AI'
};
const PRODUCT_PRICES = { aesthetic:999, shred:999, strength:999, mealplan:799, bundle:2499 };

function setHeaders(res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  res.setHeader('X-Content-Type-Options','nosniff');
}
function requireAdmin(req){
  const provided = req.headers['x-fitbrand-admin-password'];
  return Boolean(ADMIN_PASSWORD && provided && provided === ADMIN_PASSWORD);
}
function accessSlugs(slug){
  if(slug === 'bundle') return ['bundle','aesthetic','shred','strength','mealplan'];
  return [slug];
}
async function findUserByEmail(supabase, email){
  const target = String(email||'').toLowerCase();
  for(let page=1; page<=20; page++){
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if(error) throw error;
    const user = (data?.users || []).find(u => String(u.email||'').toLowerCase() === target);
    if(user) return user;
    if(!data?.users || data.users.length < 1000) break;
  }
  return null;
}
async function grantAccess(supabase, request){
  const email = String(request.email || '').toLowerCase();
  const user = await findUserByEmail(supabase, email);
  if(!user){
    const { error } = await supabase.from('manual_purchase_requests').update({ status:'paid_waiting_for_login', updated_at:new Date().toISOString() }).eq('id', request.id);
    if(error) throw error;
    return { status:'paid_waiting_for_login', message:'Paid marked, but no Supabase user exists yet. Customer must login once with this email, then press Grant again.' };
  }

  const slugs = accessSlugs(request.product_slug).filter(Boolean);
  const accessRows = slugs.map(slug => ({
    user_id: user.id,
    email,
    product_slug: slug,
    product_name: PRODUCT_NAMES[slug] || slug,
    active: true,
    stripe_session_id: 'manual_' + request.id
  }));
  const { error: accessError } = await supabase.from('user_access').upsert(accessRows, { onConflict:'user_id,product_slug' });
  if(accessError) throw accessError;

  const total = request.price_amount || PRODUCT_PRICES[request.product_slug] || 0;
  const { data: order, error: orderError } = await supabase.from('orders').insert({
    user_id: user.id,
    email,
    status: 'manual_paid',
    total_amount: total,
    currency: request.currency || 'eur',
    stripe_session_id: 'manual_' + request.id
  }).select('id').single();
  if(orderError && !String(orderError.message||'').includes('duplicate key')) throw orderError;
  if(order?.id){
    const { error: itemError } = await supabase.from('order_items').insert({
      order_id: order.id,
      product_slug: request.product_slug,
      product_name: PRODUCT_NAMES[request.product_slug] || request.product_name || request.product_slug,
      quantity: 1,
      unit_amount: total,
      currency: request.currency || 'eur'
    });
    if(itemError) throw itemError;
  }

  const { error: updateError } = await supabase.from('manual_purchase_requests').update({
    status:'paid_access_granted',
    updated_at:new Date().toISOString(),
    granted_user_id: user.id
  }).eq('id', request.id);
  if(updateError) throw updateError;

  return { status:'paid_access_granted', message:'Access granted to ' + email, user_id:user.id };
}

export default async function handler(req, res){
  setHeaders(res);
  if(req.method === 'OPTIONS') return res.status(204).end();
  if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({error:'Missing Supabase environment variables.'});
  if(!ADMIN_PASSWORD) return res.status(500).json({error:'ADMIN_DASHBOARD_PASSWORD missing in Vercel.'});
  if(!requireAdmin(req)) return res.status(401).json({error:'Wrong admin password.'});

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false, autoRefreshToken:false} });

  try{
    if(req.method === 'GET'){
      const { data, error, count } = await supabase
        .from('manual_purchase_requests')
        .select('*', { count:'exact' })
        .order('created_at', { ascending:false })
        .limit(500);
      if(error) throw error;
      return res.status(200).json({ok:true,total:count ?? data?.length ?? 0,requests:data || []});
    }

    if(req.method === 'POST'){
      const { id, action } = req.body || {};
      if(!id) return res.status(400).json({error:'Missing request id.'});
      const { data: request, error } = await supabase.from('manual_purchase_requests').select('*').eq('id', id).single();
      if(error) throw error;
      if(action === 'grant'){
        const result = await grantAccess(supabase, request);
        return res.status(200).json({ok:true, ...result});
      }
      if(action === 'cancel'){
        const { error: cancelError } = await supabase.from('manual_purchase_requests').update({status:'cancelled', updated_at:new Date().toISOString()}).eq('id', id);
        if(cancelError) throw cancelError;
        return res.status(200).json({ok:true,status:'cancelled'});
      }
      return res.status(400).json({error:'Invalid action.'});
    }

    return res.status(405).json({error:'Method not allowed'});
  }catch(error){
    console.error('Admin purchases error:', error);
    return res.status(500).json({error:error.message || 'Admin purchase request failed.'});
  }
}
