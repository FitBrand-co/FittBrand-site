/* FitBrand v42: reliable checkout logo, safe Gumroad buying, and admin test guard */
(function(){
  'use strict';

  const ALL_ACCESS = ['aesthetic','shred','strength','bundle','mealplan'];
  const HOME = 'index.html';
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function cfg(){ return window.FITBRAND_GUMROAD || {}; }
  function gumroadUrl(){ return String(cfg().starterAccessUrl || '').trim(); }
  function price(){ return cfg().productPrice || '$4.99'; }
  function validBuyUrl(url){
    if(!url || /PASTE_YOUR_GUMROAD_PRODUCT_LINK_HERE/i.test(url)) return false;
    if(!/^https:\/\//i.test(url)) return false;
    try{
      const u = new URL(url);
      // Accept normal Gumroad links and a Gumroad custom domain such as buy.fitbrand.fit.
      return Boolean(u.hostname && !/fitbrand\.fit$/i.test(u.hostname) || /^buy\.fitbrand\.fit$/i.test(u.hostname));
    }catch{ return false; }
  }
  function escapeHtml(v){ return String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function toast(title, message, type){
    if(window.FitBrandToast){ window.FitBrandToast(title, message, type || 'success'); return; }
    let box = $('#fbV42Toast');
    if(!box){
      box = document.createElement('div');
      box.id = 'fbV42Toast';
      box.className = 'fb-v42-toast';
      document.body.appendChild(box);
    }
    box.innerHTML = '<strong>'+escapeHtml(title)+'</strong><span>'+escapeHtml(message)+'</span>';
    box.className = 'fb-v42-toast show ' + (type || 'success');
    clearTimeout(window.__fbV42ToastTimer);
    window.__fbV42ToastTimer = setTimeout(()=>box.classList.remove('show'), 3400);
  }

  function goHome(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    window.location.assign(HOME);
    return false;
  }
  function forceLogoHome(){
    const checkoutLike = /(^|\/)(checkout|purchase-access)\.html$/i.test(location.pathname);
    if(!checkoutLike) return;
    $$('a.brand, .nav a.brand, .fb-purchase-mini-nav a.brand, header a.brand').forEach(a => {
      if(!a || a.tagName !== 'A') return;
      a.href = HOME;
      a.setAttribute('aria-label','Go to FitBrand home');
      a.classList.add('fb-v42-logo-home');
      a.onclick = goHome;
      a.addEventListener('click', goHome, true);
    });
  }

  function openGumroad(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    const url = gumroadUrl();
    if(!validBuyUrl(url)){
      toast('Gumroad link missing', 'Paste your real Gumroad product link into gumroad-config.js. Customers cannot buy until that link is added.', 'error');
      return false;
    }
    const u = new URL(url);
    if(!u.searchParams.has('wanted')) u.searchParams.set('wanted','true');
    const product = e?.currentTarget?.dataset?.product || new URLSearchParams(location.search).get('product') || 'starter';
    if(product && !u.searchParams.has('product')) u.searchParams.set('product', product);
    window.location.assign(u.toString());
    return false;
  }

  function protectBuyButtons(){
    $$('[data-gumroad-buy], .fb-gumroad-main-btn, .fb-gumroad-buy').forEach(btn => {
      btn.textContent = 'Buy — ' + price();
      btn.setAttribute('type', btn.tagName === 'BUTTON' ? 'button' : btn.getAttribute('type') || 'button');
      btn.classList.add('fb-v42-real-buy');
      btn.onclick = openGumroad;
      btn.addEventListener('click', openGumroad, true);
    });
  }

  function unlockLocalTestAccess(email){
    const cleanEmail = String(email || '').trim().toLowerCase();
    const name = cleanEmail ? cleanEmail.split('@')[0].replace(/[._-]+/g,' ').replace(/\b\w/g, ch => ch.toUpperCase()) : 'FitBrand Admin';
    localStorage.setItem('fitbrandUser', JSON.stringify({ email: cleanEmail || 'admin@fitbrand.fit', name }));
    localStorage.setItem('fitbrandPurchases', JSON.stringify(ALL_ACCESS));
    localStorage.setItem('fitbrandPurchasedPackage', 'bundle');
    localStorage.setItem('fitbrandMealPlanUnlocked', 'true');
    localStorage.setItem('fitbrandAdminTestAccess', 'true');
    localStorage.removeItem('fitbrandCart');
    toast('Admin test access active', 'All programs and AI tools are unlocked on this device only.');
    if(typeof window.updateFitBrandProfileUI === 'function') window.updateFitBrandProfileUI();
  }
  function clearLocalTestAccess(){
    localStorage.removeItem('fitbrandPurchases');
    localStorage.removeItem('fitbrandPurchasedPackage');
    localStorage.removeItem('fitbrandMealPlanUnlocked');
    localStorage.removeItem('fitbrandAdminTestAccess');
    toast('Admin test access cleared', 'This device is back to normal customer mode.', 'error');
    if(typeof window.updateFitBrandProfileUI === 'function') window.updateFitBrandProfileUI();
  }
  window.FitBrandAdminTestAccess = { unlockLocalTestAccess, clearLocalTestAccess, products: ALL_ACCESS };

  function adminModeBanner(){
    if(location.pathname.includes('admin-test-access.html')) return;
    if(localStorage.getItem('fitbrandAdminTestAccess') !== 'true') return;
    if($('#fbV42AdminMode')) return;
    const bar = document.createElement('div');
    bar.id = 'fbV42AdminMode';
    bar.className = 'fb-v42-admin-mode';
    bar.innerHTML = '<span>Admin test access is active on this device.</span><button type="button">Clear test access</button>';
    bar.querySelector('button').addEventListener('click', () => { clearLocalTestAccess(); bar.remove(); });
    document.body.appendChild(bar);
  }

  function boot(){ forceLogoHome(); protectBuyButtons(); adminModeBanner(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('load', () => setTimeout(boot, 300));
})();
