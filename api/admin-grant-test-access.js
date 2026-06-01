import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_DASHBOARD_PASSWORD;

const PRODUCT_NAMES = {
  aesthetic: 'Aesthetic Program',
  shred: 'Shred Program',
  strength: 'Strength Program',
  bundle: 'Complete Bundle + Meal Plan AI',
  mealplan: 'Meal Plan Guide AI'
};
const ALL_ACCESS = Object.keys(PRODUCT_NAMES);

function setHeaders(res){
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}
function requireAdmin(req){
  const provided = req.headers['x-fitbrand-admin-password'];
  return Boolean(ADMIN_PASSWORD && provided && provided === ADMIN_PASSWORD);
}
function normaliseEmail(email){
  return String(email || '').trim().toLowerCase();
}
function validEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}
async function findUserByEmail(supabase, email){
  const target = normaliseEmail(email);
  for(let page = 1; page <= 20; page++){
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if(error) throw error;
    const user = (data?.users || []).find(u => normaliseEmail(u.email) === target);
    if(user) return user;
    if(!data?.users || data.users.length < 1000) break;
  }
  return null;
}

export default async function handler(req, res){
  setHeaders(res);
  if(req.method === 'OPTIONS') return res.status(204).end();
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if(!ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_DASHBOARD_PASSWORD is missing in Vercel.' });
  if(!requireAdmin(req)) return res.status(401).json({ error: 'Wrong admin password.' });

  const { action, email, products } = req.body || {};
  const slugs = Array.isArray(products) && products.length
    ? products.filter(slug => PRODUCT_NAMES[slug])
    : ALL_ACCESS;

  if(action === 'verify'){
    return res.status(200).json({ ok: true, message: 'Admin password verified.', products: ALL_ACCESS });
  }

  if(action !== 'grant_cloud'){
    return res.status(400).json({ error: 'Invalid action.' });
  }

  if(!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY){
    return res.status(500).json({ error: 'Missing Supabase environment variables.' });
  }
  if(!validEmail(email)){
    return res.status(400).json({ error: 'Enter the email that should receive admin test access.' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try{
    const user = await findUserByEmail(supabase, email);
    if(!user){
      return res.status(404).json({
        error: 'No Supabase user exists for this email yet. Log in once on FitBrand with this email, then try again.'
      });
    }

    const now = new Date().toISOString();
    const rows = slugs.map(slug => ({
      user_id: user.id,
      email: normaliseEmail(email),
      product_slug: slug,
      product_name: PRODUCT_NAMES[slug],
      active: true,
      stripe_session_id: 'admin_test_access',
      created_at: now
    }));

    const { error } = await supabase
      .from('user_access')
      .upsert(rows, { onConflict: 'user_id,product_slug' });
    if(error) throw error;

    return res.status(200).json({
      ok: true,
      message: 'Cloud access granted for ' + normaliseEmail(email) + '.',
      email: normaliseEmail(email),
      products: slugs
    });
  }catch(error){
    console.error('Admin test access error:', error);
    return res.status(500).json({ error: error.message || 'Could not grant admin test access.' });
  }
}
