import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const PRODUCTS = {
  aesthetic:{name:'Aesthetic Program', price_amount:999, currency:'eur'},
  shred:{name:'Shred Program', price_amount:999, currency:'eur'},
  strength:{name:'Strength Program', price_amount:999, currency:'eur'},
  mealplan:{name:'Meal Plan Guide AI', price_amount:799, currency:'eur'},
  bundle:{name:'Complete Bundle + Meal Plan AI', price_amount:2499, currency:'eur'}
};

function setHeaders(res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  res.setHeader('X-Content-Type-Options','nosniff');
}
function validEmail(email){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'').trim());}
function clean(s, max=500){return String(s ?? '').trim().slice(0,max);}

export default async function handler(req, res){
  setHeaders(res);
  if(req.method === 'OPTIONS') return res.status(204).end();
  if(req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY){
    return res.status(500).json({error:'Server is missing Supabase environment variables.'});
  }

  const body = req.body || {};
  const email = clean(body.email, 180).toLowerCase();
  const product_slug = clean(body.product_slug, 50);
  const product = PRODUCTS[product_slug];
  if(!validEmail(email)) return res.status(400).json({error:'Enter a valid email.'});
  if(!product) return res.status(400).json({error:'Invalid product.'});

  try{
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false, autoRefreshToken:false} });
    const row = {
      email,
      full_name: clean(body.full_name, 160),
      product_slug,
      product_name: product.name,
      price_amount: product.price_amount,
      currency: product.currency,
      status: 'pending_payment',
      payment_method: 'manual',
      payment_reference: clean(body.payment_reference, 220),
      notes: clean(body.notes, 800),
      source_page: clean(body.source_page || 'purchase-access', 120)
    };
    const { data, error } = await supabase
      .from('manual_purchase_requests')
      .insert(row)
      .select('id, email, product_slug, status, created_at')
      .single();
    if(error) throw error;
    return res.status(200).json({ok:true, request:data});
  }catch(error){
    console.error('Manual purchase request error:', error);
    return res.status(500).json({error:error.message || 'Could not save purchase request.'});
  }
}
