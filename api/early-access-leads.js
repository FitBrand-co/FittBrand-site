import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

function setHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

function cleanText(value, max = 500) {
  return String(value || '').trim().slice(0, max);
}

function cleanEmail(value) {
  return String(value || '').trim().toLowerCase().slice(0, 254);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function productLabel(value) {
  const key = cleanText(value, 60).toLowerCase();
  const map = {
    aesthetic: 'Aesthetic Program',
    shred: 'Shred Program',
    strength: 'Strength Program',
    bundle: 'Complete Bundle',
    mealplan: 'Meal Plan Guide AI',
    'meal-plan': 'Meal Plan Guide AI'
  };
  return map[key] || cleanText(value, 120) || 'Not selected';
}

export default async function handler(req, res) {
  setHeaders(res);

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({
      ok: false,
      error: 'Supabase server environment variables are missing in Vercel.',
      missing: {
        SUPABASE_URL: !SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !SUPABASE_SERVICE_ROLE_KEY
      }
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = cleanEmail(body.email);

    if (!validEmail(email)) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    }

    const lead = {
      email,
      full_name: cleanText(body.name || body.full_name, 120),
      product_interest: productLabel(body.product || body.product_interest),
      goal: cleanText(body.goal, 500),
      monthly_price_interest: cleanText(body.price_intent || body.monthly_price_interest, 200),
      start_timeline: cleanText(body.start_timing || body.start_timeline, 120),
      notes: cleanText(body.note || body.notes, 800),
      source_page: cleanText(body.source || body.source_page || 'website', 120)
    };

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data, error } = await supabase
      .from('early_access_leads')
      .insert(lead)
      .select('id, created_at')
      .single();

    if (error) throw error;

    return res.status(200).json({ ok: true, lead: data });
  } catch (error) {
    console.error('FitBrand early access lead save error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Could not save early access signup.'
    });
  }
}
