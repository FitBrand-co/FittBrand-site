  /* FitBrand Supabase + Stripe bridge.
     This file is safe to load before keys are configured.
     It only activates real backend features when Supabase anon key is added. */
  (function(){
    'use strict';

    const cfg = window.FITBRAND_CONFIG || {};
    const PRODUCTS = {
      aesthetic:'Aesthetic Program',
      shred:'Shred Program',
      strength:'Strength Program',
      bundle:'Complete Bundle + Meal Plan AI',
      mealplan:'Meal Plan Guide AI',
      shaker:'Premium Shaker Bottle',
      belt:'Lifting Belt',
      straps:'Lifting Straps'
    };

    const $ = id => document.getElementById(id);
    const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
    const esc = s => String(s ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
    const isConfigured = () => Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && !String(cfg.supabaseAnonKey).includes('PASTE_'));

    let supabaseClient = null;
    let supabaseLoadPromise = null;

    function showSetupBanner(){
      if(isConfigured() || document.getElementById('fbBackendSetupBanner')) return;
      const banner = document.createElement('div');
      banner.id = 'fbBackendSetupBanner';
      banner.className = 'fb-backend-setup-banner';
      banner.innerHTML = '<strong>Backend ready:</strong> Add your Supabase anon key, Stripe keys and deploy the API functions to activate real login, orders and product access.';
      document.body.appendChild(banner);
      setTimeout(()=>banner.classList.add('show'), 200);
    }

    function showNotice(message){
      let n = document.getElementById('fbBackendNotice');
      if(!n){
        n = document.createElement('div');
        n.id = 'fbBackendNotice';
        n.className = 'fb-backend-notice';
        document.body.appendChild(n);
      }
      n.textContent = message;
      n.classList.add('show');
      setTimeout(()=>n.classList.remove('show'), 2800);
    }

    function ensureAuthMessage(){
      let box = document.getElementById('fbAuthMessage');
      if(box) return box;
      box = document.createElement('div');
      box.id = 'fbAuthMessage';
      box.className = 'fb-auth-message';
      box.innerHTML = `
        <div class="fb-auth-message-card">
          <button type="button" class="fb-auth-message-close" aria-label="Close">×</button>
          <div class="fb-auth-message-icon" id="fbAuthMessageIcon">✓</div>
          <h3 id="fbAuthMessageTitle">Check your email</h3>
          <p id="fbAuthMessageText">We sent you a secure login link.</p>
          <button type="button" class="fb-auth-message-ok">Got it</button>
        </div>`;
      document.body.appendChild(box);
      box.addEventListener('click', (e)=>{
        if(e.target === box || e.target.closest('.fb-auth-message-close') || e.target.closest('.fb-auth-message-ok')){
          box.classList.remove('show');
        }
      });
      return box;
    }

    function showAuthMessage(type, title, message){
      const box = ensureAuthMessage();
      const icon = document.getElementById('fbAuthMessageIcon');
      const titleEl = document.getElementById('fbAuthMessageTitle');
      const textEl = document.getElementById('fbAuthMessageText');
      box.classList.toggle('error', type === 'error');
      box.classList.toggle('success', type !== 'error');
      if(icon) icon.textContent = type === 'error' ? '!' : '✓';
      if(titleEl) titleEl.textContent = title;
      if(textEl) textEl.textContent = message;
      box.classList.add('show');
    }

    function friendlyAuthError(message){
      const raw = String(message || '').toLowerCase();
      if(raw.includes('rate limit') || raw.includes('too many') || raw.includes('email rate')){
        return {
          title: 'Too many login emails',
          message: 'For security, Supabase blocks too many login emails in a short time. Wait 5–10 minutes, then try again. If you already clicked the email link, refresh the page instead.'
        };
      }
      return {
        title: 'Login link could not be sent',
        message: message || 'Something went wrong. Check the email address and try again.'
      };
    }

    function loadSupabase(){
      if(!isConfigured()) return Promise.resolve(null);
      if(window.supabase && window.supabase.createClient){
        supabaseClient = supabaseClient || window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
        return Promise.resolve(supabaseClient);
      }
      if(supabaseLoadPromise) return supabaseLoadPromise;
      supabaseLoadPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.async = true;
        script.onload = () => {
          try {
            supabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
            resolve(supabaseClient);
          } catch(e) {
            console.error('Supabase init failed', e);
            resolve(null);
          }
        };
        script.onerror = () => resolve(null);
        document.head.appendChild(script);
        setTimeout(()=>resolve(supabaseClient), 6000);
      });
      return supabaseLoadPromise;
    }

    async function getSession(){
      const sb = await loadSupabase();
      if(!sb) return null;
      const { data } = await sb.auth.getSession();
      return data && data.session ? data.session : null;
    }

    async function getUser(){
      const session = await getSession();
      return session ? session.user : null;
    }

    async function loginWithMagicLink(email){
      const sb = await loadSupabase();
      if(!sb) {
        showNotice('Supabase key missing. Local demo login is still available.');
        return false;
      }
      const redirectTo = location.origin + location.pathname.replace(/[^/]*$/, 'profile.html');
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo }
      });
      if(error){
        const friendly = friendlyAuthError(error.message);
        showAuthMessage('error', friendly.title, friendly.message);
        return false;
      }
      showAuthMessage('success', 'Check your email', 'We sent you a secure FitBrand login link. Open your email and click the confirmation link to sign in.');
      return true;
    }

    async function logoutBackend(){
      const sb = await loadSupabase();
      if(sb) await sb.auth.signOut();
    }



    function polishAuthCopy(){
      document.querySelectorAll('.profile-small-note').forEach(el => {
        if(/demo login|firebase|backend/i.test(el.textContent || '')){
          el.textContent = 'We will send a secure login link to your email. No password needed.';
        }
      });
      const subtitle = document.getElementById('profileModalSubtitle');
      if(subtitle && /orders and product access connect/i.test(subtitle.textContent || '')){
        subtitle.textContent = 'Use your email to receive a secure login link and connect your orders to your profile.';
      }
      const btn = document.querySelector('#profileLogin button, button[onclick*="loginFitBrandUser"]');
      if(btn && /sign in\/up|log in/i.test(btn.textContent || '')) btn.textContent = 'Send login link';
    }

    function patchLoginButtons(){
      document.addEventListener('click', async (e) => {
        const btn = e.target.closest('#profileLogin button, #profileLoginBtn, button[onclick*="loginFitBrandUser"]');
        if(!btn || !isConfigured()) return;
        const email = ($('loginProfileEmail')?.value || $('checkout-email')?.value || '').trim();
        if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
        e.preventDefault();
        e.stopPropagation();
        await loginWithMagicLink(email);
      }, true);

      const oldLogout = window.logoutFitBrandUser;
      window.logoutFitBrandUser = async function(){
        try { await logoutBackend(); } catch(e) {}
        if(typeof oldLogout === 'function') return oldLogout.apply(this, arguments);
      };
    }

    function productFromUrl(){
      const params = new URLSearchParams(location.search);
      return params.get('product') || params.get('purchased') || 'bundle';
    }

    function cartItems(){
      try {
        const cart = JSON.parse(localStorage.getItem('fitbrandCart') || '[]');
        if(Array.isArray(cart) && cart.length) return cart;
      } catch(e) {}
      return [productFromUrl()];
    }

    async function beginStripeCheckout(items, email){
      const url = (cfg.functionsBaseUrl || '') + '/api/create-checkout-session';
      const body = { items, email, successUrl: location.origin + '/confirmation.html?stripe=success', cancelUrl: location.href };
      const response = await fetch(url, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body)
      });
      const data = await response.json().catch(()=>({}));
      if(!response.ok || !data.url){
        throw new Error(data.error || 'Checkout session could not be created.');
      }
      location.href = data.url;
    }

    function patchCheckout(){
      const pay = $('stripe-link');
      if(!pay) return;
      pay.addEventListener('click', async (e) => {
        if(!isConfigured()) return; // fallback demo checkout
        const email = ($('checkout-email')?.value || '').trim();
        const policy = $('accept-policies');
        if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (policy && !policy.checked)){
          e.preventDefault();
          alert('Please enter your email and accept the policies first.');
          return;
        }
        e.preventDefault();
        pay.classList.add('btn-disabled');
        pay.textContent = 'Opening secure checkout...';
        try {
          await beginStripeCheckout(cartItems(), email);
        } catch(err) {
          console.error(err);
          alert(err.message || 'Could not start Stripe checkout.');
          pay.classList.remove('btn-disabled');
          pay.textContent = 'Continue to payment';
        }
      }, true);
    }

    async function renderOrders(){
      const list = $('ordersList');
      if(!list || !isConfigured()) return;
      const user = await getUser();
      if(!user) {
        list.innerHTML = '<p>No orders shown. Log in with Supabase to see cloud-saved orders.</p>';
        return;
      }
      const sb = await loadSupabase();
      const { data, error } = await sb
        .from('orders')
        .select('id, created_at, status, total_amount, currency, order_items(product_slug, product_name, quantity)')
        .eq('user_id', user.id)
        .order('created_at', { ascending:false });
      if(error){
        console.error(error);
        list.innerHTML = '<p>Could not load orders yet. Check Supabase RLS/schema setup.</p>';
        return;
      }
      if(!data || !data.length){
        list.innerHTML = '<p>No orders saved yet.</p>';
        return;
      }
      list.innerHTML = data.map(order => {
        const names = (order.order_items || []).map(i => `${i.product_name || PRODUCTS[i.product_slug] || i.product_slug}${i.quantity > 1 ? ' × ' + i.quantity : ''}`).join(', ');
        const total = order.total_amount ? `${(order.total_amount/100).toFixed(2)} ${(order.currency||'EUR').toUpperCase()}` : '';
        return `<article class="order-card order-card-clean"><div class="order-card-main"><strong>${esc(names || 'FitBrand order')}</strong><div class="order-card-meta"><span>${esc(new Date(order.created_at).toLocaleString())}</span><span>•</span><span>${esc(order.status || 'paid')}</span>${total ? `<span>•</span><span>${esc(total)}</span>` : ''}</div></div><div class="order-status-pill">Cloud</div></article>`;
      }).join('');
    }

    async function renderAccess(){
      const grid = $('accessGrid');
      if(!grid || !isConfigured()) return;
      const user = await getUser();
      if(!user) {
        grid.innerHTML = '<p>Log in to see product access saved in Supabase.</p>';
        return;
      }
      const sb = await loadSupabase();
      const { data, error } = await sb
        .from('user_access')
        .select('product_slug, product_name, active, created_at')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending:false });
      if(error){
        console.error(error);
        grid.innerHTML = '<p>Could not load product access yet. Check Supabase RLS/schema setup.</p>';
        return;
      }
      const owned = new Set((data || []).map(x => x.product_slug));
      const slugs = ['aesthetic','shred','strength','bundle','mealplan','shaker','belt','straps'];
      grid.innerHTML = slugs.map(slug => {
        const has = owned.has(slug);
        return `<article class="access-card ${has ? 'owned' : ''}"><div><span>${has ? 'Unlocked' : 'Locked'}</span><h3>${esc(PRODUCTS[slug] || slug)}</h3><p>${has ? 'Saved in your FitBrand cloud account.' : 'Buy to unlock this product.'}</p></div><a class="${has ? 'btn-dark' : 'btn-outline'}" href="${has ? (slug === 'mealplan' ? 'recommended.html#meal-plan-ai' : slug === 'shaker' ? 'product-shaker.html' : slug === 'belt' ? 'product-belt.html' : slug === 'straps' ? 'product-straps.html' : 'index.html?purchased=' + slug) : 'checkout.html?product=' + slug}">${has ? 'Open' : 'Buy access'}</a></article>`;
      }).join('');
    }

    function addCookieBanner(){
      if(localStorage.getItem('fitbrandCookieOk') === 'yes' || document.getElementById('fbCookieBanner')) return;
      const banner = document.createElement('div');
      banner.id = 'fbCookieBanner';
      banner.className = 'fb-cookie-banner';
      banner.innerHTML = '<p>FitBrand uses necessary browser storage for cart, login and product access. Analytics/marketing cookies should only be added after consent.</p><button type="button">Accept</button>';
      document.body.appendChild(banner);
      banner.querySelector('button').addEventListener('click', () => {
        localStorage.setItem('fitbrandCookieOk', 'yes');
        banner.remove();
      });
    }

    function boot(){
      polishAuthCopy();
      patchLoginButtons();
      patchCheckout();
      renderOrders();
      renderAccess();
      addCookieBanner();
      showSetupBanner();

      if(isConfigured()){
        loadSupabase().then(sb => {
          if(!sb) return;
          sb.auth.onAuthStateChange(() => {
            renderOrders();
            renderAccess();
          });
        });
      }
    }

    window.FitBrandBackend = { isConfigured, loadSupabase, getSession, getUser, loginWithMagicLink, renderOrders, renderAccess };

    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  })();
/* ===== FITBRAND SUPABASE SESSION SYNC FIX ===== */
(function(){
  "use strict";

  const cfg = window.FITBRAND_CONFIG || {};
  let clientPromise = null;

  function configured(){
    return Boolean(
      cfg.supabaseUrl &&
      cfg.supabaseAnonKey &&
      !String(cfg.supabaseAnonKey).includes("PASTE_")
    );
  }

  function loadClient(){
    if(!configured()) return Promise.resolve(null);

    if(window.supabase && window.supabase.createClient){
      return Promise.resolve(
        window.__fitbrandSupabaseClient ||
        (window.__fitbrandSupabaseClient = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey))
      );
    }

    if(clientPromise) return clientPromise;

    clientPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.onload = () => {
        try {
          window.__fitbrandSupabaseClient =
            window.__fitbrandSupabaseClient ||
            window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
          resolve(window.__fitbrandSupabaseClient);
        } catch(e) {
          console.error("Supabase client failed:", e);
          resolve(null);
        }
      };
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });

    return clientPromise;
  }

  function nameFromEmail(email){
    return String(email || "")
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function syncFitBrandUser(session){
    const user = session && session.user;
    if(!user || !user.email) return;

    const profile = {
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || nameFromEmail(user.email),
      supabaseId: user.id,
      backend: "supabase"
    };

    localStorage.setItem("fitbrandUser", JSON.stringify(profile));
    sessionStorage.removeItem("fitbrandSessionUser");

    document.body.classList.add("fb-is-logged-in");
    document.body.classList.remove("fb-is-logged-out");

    const initials = profile.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(x => x[0])
      .join("")
      .toUpperCase() || "FB";

    ["profileInitial", "profileMenuInitial", "profileModalInitial"].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.textContent = initials;
    });

    ["profileMenuName", "profileViewName"].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.textContent = profile.name;
    });

    ["profileMenuEmail", "profileViewEmail"].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.textContent = profile.email;
    });

    const status = document.getElementById("profileViewStatus");
    if(status) status.textContent = "Logged in with Supabase";

    if(typeof window.updateFitBrandProfileUI === "function"){
      window.updateFitBrandProfileUI();
    }

    if(window.FitBrandBackend){
      window.FitBrandBackend.renderOrders?.();
      window.FitBrandBackend.renderAccess?.();
    }
  }

  async function boot(){
    const sb = await loadClient();
    if(!sb) return;

    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if(code){
      try {
        await sb.auth.exchangeCodeForSession(code);
        url.searchParams.delete("code");
        window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
      } catch(e) {
        console.warn("Supabase code exchange skipped/failed:", e);
      }
    }

    const { data } = await sb.auth.getSession();
    if(data && data.session){
      syncFitBrandUser(data.session);
    }

    sb.auth.onAuthStateChange((_event, session) => {
      if(session) syncFitBrandUser(session);
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

/* ===== FITBRAND AUTH UI FINAL FIX: Supabase session -> profile popup ===== */
(function(){
  "use strict";

  const cfg = window.FITBRAND_CONFIG || {};
  let clientPromise = null;
  let client = null;

  function configured(){
    return Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && !String(cfg.supabaseAnonKey).includes("PASTE_"));
  }

  function loadClient(){
    if(!configured()) return Promise.resolve(null);
    if(client) return Promise.resolve(client);
    if(window.__fitbrandSupabaseClient) {
      client = window.__fitbrandSupabaseClient;
      return Promise.resolve(client);
    }
    if(window.supabase && window.supabase.createClient){
      client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      window.__fitbrandSupabaseClient = client;
      return Promise.resolve(client);
    }
    if(clientPromise) return clientPromise;
    clientPromise = new Promise((resolve) => {
      const existing = document.querySelector('script[src*="supabase-js"]');
      const finish = () => {
        try {
          if(window.supabase && window.supabase.createClient){
            client = window.__fitbrandSupabaseClient || window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
            window.__fitbrandSupabaseClient = client;
          }
        } catch(e){ console.warn("Supabase client init failed", e); }
        resolve(client || null);
      };
      if(existing){ existing.addEventListener('load', finish, { once:true }); setTimeout(finish, 1200); return; }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
      script.async = true;
      script.onload = finish;
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
    return clientPromise;
  }

  function cleanNameFromEmail(email){
    return String(email || "")
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function initialsFrom(name, email){
    const base = String(name || email || "FitBrand").trim();
    const parts = base.split(/\s+/).filter(Boolean);
    if(parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return base.slice(0,2).toUpperCase();
  }

  function getStoredProfile(){
    try { return JSON.parse(localStorage.getItem("fitbrandUser") || "null"); }
    catch { return null; }
  }

  function saveProfileFromSession(session){
    const user = session && session.user;
    if(!user || !user.email) return null;
    const old = getStoredProfile() || {};
    const profile = {
      ...old,
      email: user.email,
      name: old.name && old.email === user.email ? old.name : (user.user_metadata?.full_name || user.user_metadata?.name || old.name || cleanNameFromEmail(user.email)),
      supabaseId: user.id,
      backend: "supabase"
    };
    localStorage.setItem("fitbrandUser", JSON.stringify(profile));
    sessionStorage.removeItem("fitbrandSessionUser");
    return profile;
  }

  function forceProfileUI(profile){
    if(!profile || !profile.email) return;
    const initials = initialsFrom(profile.name, profile.email);

    document.body.classList.add("fb-is-logged-in");
    document.body.classList.remove("fb-is-logged-out");

    ["profileInitial","profileMenuInitial","profileModalInitial","profileViewInitial"].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.textContent = initials;
    });

    ["profileMenuName","profileViewName"].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.textContent = profile.name || cleanNameFromEmail(profile.email);
    });

    ["profileMenuEmail","profileViewEmail"].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.textContent = profile.email;
    });

    const status = document.getElementById("profileViewStatus");
    if(status) status.textContent = "Logged in with Supabase";

    document.querySelectorAll('[data-auth-only], #profileLogoutBtn').forEach(el => { el.style.display = "flex"; });
    document.querySelectorAll('[data-guest-only], #profileLoginBtn').forEach(el => { el.style.display = "none"; });

    const modal1 = document.getElementById("profileModal");
    const modal2 = document.getElementById("profileModalOverlay");
    const isAnyModalOpen = modal1?.classList.contains("show") || modal2?.classList.contains("show");
    if(isAnyModalOpen){
      const title = document.getElementById("profileModalTitle");
      const subtitle = document.getElementById("profileModalSubtitle");
      if(title) title.textContent = "Your Profile";
      if(subtitle) subtitle.textContent = "Your FitBrand account is connected with Supabase.";

      const viewA = document.getElementById("profileView");
      const loginA = document.getElementById("profileLogin");
      if(viewA) viewA.style.display = "grid";
      if(loginA) loginA.style.display = "none";

      const viewB = document.getElementById("profileViewBox");
      const formB = document.getElementById("profileForm");
      if(viewB) viewB.style.display = "block";
      if(formB) formB.style.display = "none";
    }
  }

  async function syncNow(){
    const sb = await loadClient();
    if(!sb) return null;

    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    if(code){
      try {
        await sb.auth.exchangeCodeForSession(code);
        url.searchParams.delete("code");
        window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
      } catch(e){ console.warn("Supabase code exchange failed/skipped", e); }
    }

    const { data } = await sb.auth.getSession();
    if(data && data.session){
      const profile = saveProfileFromSession(data.session);
      forceProfileUI(profile);
      return profile;
    }
    return null;
  }

  function patchProfileFunctions(){
    const oldOpen = window.openProfileModal;
    if(typeof oldOpen === "function" && !oldOpen.__fitbrandSupabasePatched){
      const patched = function(mode){
        const result = oldOpen.apply(this, arguments);
        setTimeout(syncNow, 0);
        setTimeout(syncNow, 150);
        setTimeout(syncNow, 600);
        return result;
      };
      patched.__fitbrandSupabasePatched = true;
      window.openProfileModal = patched;
    }

    const oldUpdate = window.updateFitBrandProfileUI || window.updateProfileUI;
    if(typeof oldUpdate === "function" && !oldUpdate.__fitbrandSupabasePatched){
      const patchedUpdate = function(){
        const result = oldUpdate.apply(this, arguments);
        const stored = getStoredProfile();
        if(stored && stored.email) forceProfileUI(stored);
        setTimeout(syncNow, 60);
        return result;
      };
      patchedUpdate.__fitbrandSupabasePatched = true;
      window.updateFitBrandProfileUI = patchedUpdate;
      window.updateProfileUI = patchedUpdate;
    }
  }

  async function boot(){
    patchProfileFunctions();
    await syncNow();
    setTimeout(syncNow, 250);
    setTimeout(syncNow, 1000);
    setTimeout(syncNow, 2500);

    document.addEventListener("click", (e) => {
      if(e.target.closest(".profile-icon-btn, #profileLoginBtn, [onclick*='openProfileModal']")){
        setTimeout(syncNow, 0);
        setTimeout(syncNow, 200);
      }
    }, true);

    const sb = await loadClient();
    if(sb){
      sb.auth.onAuthStateChange((_event, session) => {
        if(session){
          const profile = saveProfileFromSession(session);
          forceProfileUI(profile);
        }
      });
    }
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
/* ===== FITBRAND REAL AUTH GATE FIX ===== */
(function(){
  "use strict";

  function readUser(){
    try {
      return JSON.parse(localStorage.getItem("fitbrandUser") || "null");
    } catch {
      return null;
    }
  }

  function isRealSupabaseUser(){
    const user = readUser();
    return Boolean(
      user &&
      user.email &&
      user.supabaseId &&
      user.backend === "supabase"
    );
  }

  function clearFakeLoginIfNeeded(){
    const user = readUser();

    // If profile was saved locally but not connected to Supabase, it is not a real login.
    if(user && (!user.supabaseId || user.backend !== "supabase")){
      localStorage.removeItem("fitbrandUser");
      sessionStorage.removeItem("fitbrandSessionUser");
    }
  }

  function setText(id, value){
    const el = document.getElementById(id);
    if(el) el.textContent = value;
  }

  function initialsFrom(user){
    if(!user || !user.email) return "?";
    const base = user.name || user.email.split("@")[0];
    const parts = base.replace(/[._-]+/g, " ").trim().split(/\s+/).filter(Boolean);
    if(parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return base.slice(0, 2).toUpperCase();
  }

  function updateProfileAuthUI(){
    clearFakeLoginIfNeeded();

    const user = readUser();
    const loggedIn = isRealSupabaseUser();

    document.body.classList.toggle("fb-is-logged-in", loggedIn);
    document.body.classList.toggle("fb-is-logged-out", !loggedIn);

    if(loggedIn){
      const initials = initialsFrom(user);

      ["profileInitial", "profileMenuInitial", "profileModalInitial"].forEach(id => {
        setText(id, initials);
      });

      ["profileMenuName", "profileViewName"].forEach(id => {
        setText(id, user.name || user.email.split("@")[0]);
      });

      ["profileMenuEmail", "profileViewEmail"].forEach(id => {
        setText(id, user.email);
      });

      setText("profileViewStatus", "Logged in with Supabase");
      setText("profileModalTitle", "Your Profile");
      setText("profileModalSubtitle", "Your FitBrand account is connected.");

    } else {
      ["profileInitial", "profileMenuInitial", "profileModalInitial"].forEach(id => {
        setText(id, "?");
      });

      ["profileMenuName", "profileViewName"].forEach(id => {
        setText(id, "Guest");
      });

      ["profileMenuEmail", "profileViewEmail"].forEach(id => {
        setText(id, "Not logged in");
      });

      setText("profileViewStatus", "Not logged in");
      setText("profileModalTitle", "Sign in/up");
      setText("profileModalSubtitle", "Sign in to save orders, product access and profile information.");
    }

    // Hide protected profile links when logged out
    const protectedSelectors = [
      'a[href="profile.html"]',
      'a[href="products-access.html"]',
      'a[href="orders.html"]',
      '[data-auth-only]',
      '#profileLogoutBtn'
    ];

    protectedSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.display = loggedIn ? "" : "none";
      });
    });

    // Show login button only when logged out
    document.querySelectorAll("#profileLoginBtn, [data-guest-only]").forEach(el => {
      el.style.display = loggedIn ? "none" : "";
    });
  }

  function protectProfilePage(){
    const isProfilePage = location.pathname.endsWith("profile.html");
    if(!isProfilePage) return;

    if(!isRealSupabaseUser()){
      const form = document.getElementById("fullProfileForm");
      if(form){
        form.addEventListener("submit", function(e){
          e.preventDefault();
          alert("Please sign in first before saving profile information.");
          if(typeof window.openProfileModal === "function"){
            window.openProfileModal("login");
          }
        }, true);
      }
    }
  }

  const oldUpdate = window.updateFitBrandProfileUI;
  window.updateFitBrandProfileUI = function(){
    if(typeof oldUpdate === "function"){
      try { oldUpdate(); } catch(e) {}
    }
    updateProfileAuthUI();
  };

  document.addEventListener("DOMContentLoaded", function(){
    updateProfileAuthUI();
    protectProfilePage();

    setTimeout(updateProfileAuthUI, 300);
    setTimeout(updateProfileAuthUI, 1000);
  });

  window.addEventListener("storage", updateProfileAuthUI);
})();
/* ===== FITBRAND FINAL LOGGED OUT MENU FIX ===== */
(function(){
  "use strict";

  function getUser(){
    try {
      return JSON.parse(localStorage.getItem("fitbrandUser") || "null");
    } catch {
      return null;
    }
  }

  function isRealLoggedIn(){
    const user = getUser();
    return Boolean(user && user.email && user.supabaseId && user.backend === "supabase");
  }

  function forceMenuState(){
    const loggedIn = isRealLoggedIn();

    document.body.classList.toggle("fb-is-logged-in", loggedIn);
    document.body.classList.toggle("fb-is-logged-out", !loggedIn);

    if(!loggedIn){
      localStorage.removeItem("fitbrandUser");
      sessionStorage.removeItem("fitbrandSessionUser");

      ["profileInitial", "profileMenuInitial", "profileModalInitial"].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.textContent = "?";
      });

      ["profileMenuName", "profileViewName"].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.textContent = "Guest";
      });

      ["profileMenuEmail", "profileViewEmail"].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.textContent = "Not logged in";
      });

      const status = document.getElementById("profileViewStatus");
      if(status) status.textContent = "Not logged in";
    }

    const protectedLinks = [
      '.profile-menu a[href="profile.html"]',
      '.profile-menu a[href="products-access.html"]',
      '.profile-menu a[href="orders.html"]',
      '.profile-menu [data-auth-only]',
      '#profileLogoutBtn'
    ];

    protectedLinks.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.setProperty("display", loggedIn ? "flex" : "none", "important");
        el.style.setProperty("visibility", loggedIn ? "visible" : "hidden", "important");
        el.style.setProperty("pointer-events", loggedIn ? "auto" : "none", "important");
      });
    });

    document.querySelectorAll("#profileLoginBtn, .profile-menu [data-guest-only]").forEach(el => {
      el.style.setProperty("display", loggedIn ? "none" : "flex", "important");
      el.style.setProperty("visibility", loggedIn ? "hidden" : "visible", "important");
      el.style.setProperty("pointer-events", loggedIn ? "none" : "auto", "important");
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    forceMenuState();
    setTimeout(forceMenuState, 300);
    setTimeout(forceMenuState, 1000);
    setTimeout(forceMenuState, 2000);
  });

  document.addEventListener("click", function(){
    setTimeout(forceMenuState, 50);
  });

  window.addEventListener("storage", forceMenuState);

  window.fitbrandForceMenuState = forceMenuState;
})();

/* ===== FITBRAND FINAL AUTH, LOGOUT, MAGIC LINK AND CHECKOUT FIX ===== */
(function(){
  'use strict';
  const USER_KEY='fitbrandUser';
  const SESSION_KEY='fitbrandSessionUser';
  const getJson=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
  const $=(id)=>document.getElementById(id);
  const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const cfg=window.FITBRAND_CONFIG||{};
  function isConfigured(){return !!(cfg.supabaseUrl && cfg.supabaseAnonKey && !String(cfg.supabaseAnonKey).includes('PASTE_'))}
  async function getClient(){
    if(!isConfigured()) return null;
    for(let i=0;i<60;i++){
      if(window.__fitbrandSupabaseClient) return window.__fitbrandSupabaseClient;
      if(window.supabase && window.supabase.createClient){
        window.__fitbrandSupabaseClient=window.__fitbrandSupabaseClient||window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
        return window.__fitbrandSupabaseClient;
      }
      await new Promise(r=>setTimeout(r,100));
    }
    return null;
  }
  function isRealUser(){const u=getJson(USER_KEY);return !!(u&&u.email&&u.supabaseId&&u.backend==='supabase')}
  function showMessage(type,title,msg){
    if(typeof window.FitBrandBackend?.showAuthMessage==='function') return window.FitBrandBackend.showAuthMessage(type,title,msg);
    let box=$('fbAuthMessage');
    if(!box){box=document.createElement('div');box.id='fbAuthMessage';box.className='fb-auth-message';box.innerHTML='<div class="fb-auth-message-card"><button type="button" class="fb-auth-message-close">×</button><div class="fb-auth-message-icon" id="fbAuthMessageIcon">✓</div><h3 id="fbAuthMessageTitle"></h3><p id="fbAuthMessageText"></p><button type="button" class="fb-auth-message-ok">Got it</button></div>';document.body.appendChild(box);box.addEventListener('click',e=>{if(e.target===box||e.target.closest('.fb-auth-message-close')||e.target.closest('.fb-auth-message-ok'))box.classList.remove('show')});}
    box.classList.toggle('error',type==='error');box.classList.toggle('success',type!=='error');
    $('fbAuthMessageIcon') && ($('fbAuthMessageIcon').textContent=type==='error'?'!':'✓');
    $('fbAuthMessageTitle') && ($('fbAuthMessageTitle').textContent=title);
    $('fbAuthMessageText') && ($('fbAuthMessageText').textContent=msg);
    box.classList.add('show');
  }
  function setText(id,v){const el=$(id);if(el)el.textContent=v}
  function initials(u){const base=(u?.name||u?.email||'?').split('@')[0].replace(/[._-]+/g,' ').trim();const parts=base.split(/\s+/).filter(Boolean);return parts.length>1?(parts[0][0]+parts[1][0]).toUpperCase():base.slice(0,2).toUpperCase()||'?'}
  function applyMenu(){
    const logged=isRealUser();const u=getJson(USER_KEY);
    document.body.classList.toggle('fb-is-logged-in',logged);document.body.classList.toggle('fb-is-logged-out',!logged);
    if(!logged){
      const old=getJson(USER_KEY); if(old && old.backend!=='supabase') localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      ['profileInitial','profileMenuInitial','profileModalInitial'].forEach(id=>setText(id,'?'));
      ['profileMenuName','profileViewName'].forEach(id=>setText(id,'Guest'));
      ['profileMenuEmail','profileViewEmail'].forEach(id=>setText(id,'Not logged in'));
      setText('profileViewStatus','Not logged in');
    } else {
      ['profileInitial','profileMenuInitial','profileModalInitial'].forEach(id=>setText(id,initials(u)));
      ['profileMenuName','profileViewName'].forEach(id=>setText(id,u.name||u.email.split('@')[0]));
      ['profileMenuEmail','profileViewEmail'].forEach(id=>setText(id,u.email));
      setText('profileViewStatus','Logged in with FitBrand');
    }
    $$('[data-auth-only], .profile-menu a[href="profile.html"], .profile-menu a[href="products-access.html"], .profile-menu a[href="orders.html"], #profileLogoutBtn').forEach(el=>{el.style.setProperty('display',logged?'flex':'none','important');el.style.setProperty('visibility',logged?'visible':'hidden','important')});
    $$('#profileLoginBtn,[data-guest-only]').forEach(el=>{el.style.setProperty('display',logged?'none':'flex','important');el.style.setProperty('visibility',logged?'hidden':'visible','important')});
  }
  async function syncSession(){
    const sb=await getClient(); if(!sb) {applyMenu();return}
    const {data}=await sb.auth.getSession(); const session=data?.session;
    if(session?.user?.email){
      const email=session.user.email; const name=(session.user.user_metadata?.full_name||session.user.user_metadata?.name||email.split('@')[0].replace(/[._-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase()));
      localStorage.setItem(USER_KEY,JSON.stringify({email,name,supabaseId:session.user.id,backend:'supabase'}));
    }
    applyMenu();
  }
  async function realLogout(){
    try{const sb=await getClient(); if(sb) await sb.auth.signOut({scope:'local'});}catch(e){console.warn(e)}
    localStorage.removeItem(USER_KEY);sessionStorage.removeItem(SESSION_KEY);
    ['fitbrandPendingCheckout','fitbrandConfirmationNormalized'].forEach(k=>sessionStorage.removeItem(k));
    const menu=$('profileMenu'); if(menu) menu.classList.remove('show');
    const modal=$('profileModal'); if(modal) modal.classList.remove('show');
    applyMenu();showMessage('success','Logged out','You have been signed out of your FitBrand account.');
  }
  window.logoutFitBrandUser=realLogout;
  function handleUsedOrExpiredLink(){
    const raw=decodeURIComponent(location.hash||location.search||'');
    if(/otp_expired|access_denied|invalid|expired/i.test(raw)){
      showMessage('error','Login link expired','That login link has already been used or has expired. Please request a new FitBrand access link.');
      history.replaceState({},document.title,location.origin+location.pathname);
    }
  }
  function checkoutGate(e){
    const el=e.target.closest('a[href*="checkout.html"], #checkout-link, #stripe-link, .drawer-checkout-btn, .cart-checkout'); if(!el)return;
    if(isRealUser())return;
    e.preventDefault(); e.stopPropagation();
    showCheckoutGate();
  }
  function showCheckoutGate(){
    let box=$('fbCheckoutLoginRequired');
    if(!box){box=document.createElement('div');box.id='fbCheckoutLoginRequired';box.className='fb-checkout-login-required';box.innerHTML='<div class="fb-checkout-login-card"><h3>Login required</h3><p>Please sign in before checkout so your subscription, orders and product access are saved to your FitBrand account.</p><button type="button" class="btn-dark" id="fbCheckoutLoginNow">Sign in/up</button><button type="button" class="btn-outline" id="fbCheckoutLoginClose">Continue browsing</button></div>';document.body.appendChild(box);box.addEventListener('click',e=>{if(e.target===box||e.target.id==='fbCheckoutLoginClose')box.classList.remove('show')});$('fbCheckoutLoginNow').addEventListener('click',()=>{box.classList.remove('show'); if(typeof window.openProfileModal==='function') window.openProfileModal('login');});}
    box.classList.add('show');
  }
  function patchProfilePageSave(){
    const form=$('fullProfileForm'); if(!form||form.dataset.realAuthGate)return; form.dataset.realAuthGate='1';
    form.addEventListener('submit',e=>{if(!isRealUser()){e.preventDefault();showMessage('error','Please sign in first','You need to log in before saving profile information. This keeps customer data connected to the correct account.'); if(typeof window.openProfileModal==='function') window.openProfileModal('login');}},true);
  }
  function patchAgeCopy(){
    document.querySelectorAll('[id*="Age"], input[type="number"]').forEach(()=>{});
  }
  function boot(){
    handleUsedOrExpiredLink(); syncSession(); patchProfilePageSave(); patchAgeCopy();
    document.addEventListener('click',checkoutGate,true);
    setTimeout(syncSession,500); setTimeout(syncSession,1600); setInterval(applyMenu,1500);
    getClient().then(sb=>{if(sb)sb.auth.onAuthStateChange(()=>setTimeout(syncSession,50));});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
