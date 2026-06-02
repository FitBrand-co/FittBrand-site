/* FitBrand v45 — purchase conversion + admin test isolation
   Goals: single clean purchase flow, no accidental free access for customers,
   mobile-first CTAs, independent admin TEST page. */
(function(){
  'use strict';

  const VERSION = 'v45-conversion-final';
  const ADMIN_KEY = 'fitbrandAdminTestAccessV45';
  const LEGACY_ADMIN_KEYS = ['fitbrandAdminTestAccessV44','fitbrandAdminTestAccessV43','fitbrandAdminTestAccess','fitbrandAdminAccess','fitbrandAllAccessUnlocked'];
  const PURCHASES_KEY = 'fitbrandPurchases';
  const PRODUCT_DATA = {
    starter: { name:'FitBrand Starter Plan', short:'Starter Plan', badge:'Best first step', benefit:'Workout structure, meal guidance and early FitBrand tools in one simple starter access.' },
    aesthetic: { name:'Aesthetic Program', short:'Aesthetic', badge:'Physique focused', benefit:'Built for people who want more structure to build an aesthetic physique.' },
    shred: { name:'Shred Program', short:'Shred', badge:'Fat-loss focused', benefit:'Training and nutrition structure for people who want to lean down and stay consistent.' },
    strength: { name:'Strength Program', short:'Strength', badge:'Progress focused', benefit:'Simple progressive structure for people who want to get stronger.' },
    mealplan: { name:'Meal Plan Guide AI', short:'Meal Plan AI', badge:'Nutrition support', benefit:'Meal guidance and nutrition structure to support your goal.' },
    bundle: { name:'Complete Bundle', short:'Bundle', badge:'Best value', benefit:'All starter access, programs and meal guidance tools in one test offer.' }
  };

  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const page = () => (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const cfg = () => window.FITBRAND_GUMROAD_CONFIG || {};
  const price = () => cfg().priceLabel || '$4.99';
  const gumroadUrl = () => String(cfg().starterAccessUrl || '').trim();
  const hasGumroad = () => /^https:\/\//i.test(gumroadUrl()) && !/PASTE_|YOUR_|example|gumroad\.com\/?$/i.test(gumroadUrl());

  function getProductFromText(raw){
    const t = String(raw || '').toLowerCase();
    if(t.includes('shred')) return 'shred';
    if(t.includes('strength')) return 'strength';
    if(t.includes('meal')) return 'mealplan';
    if(t.includes('bundle') || t.includes('complete')) return 'bundle';
    if(t.includes('aesthetic')) return 'aesthetic';
    return 'starter';
  }
  function getSelectedProduct(){
    const params = new URLSearchParams(location.search);
    const key = params.get('product') || params.get('p') || 'starter';
    return PRODUCT_DATA[key] ? key : 'starter';
  }
  function purchaseUrl(product='starter'){
    return 'purchase-access.html?product=' + encodeURIComponent(PRODUCT_DATA[product] ? product : 'starter');
  }

  function toast(title, message, type='info'){
    let box = $('fbV45Toast');
    if(!box){
      box = document.createElement('div');
      box.id = 'fbV45Toast';
      box.className = 'fb-v45-toast';
      document.body.appendChild(box);
    }
    box.className = 'fb-v45-toast show ' + type;
    box.innerHTML = '<strong>'+esc(title)+'</strong><span>'+esc(message)+'</span>';
    clearTimeout(box._t);
    box._t=setTimeout(()=>box.classList.remove('show'), 4500);
  }
  window.fitbrandToast = window.fitbrandShowToast = toast;

  function readPurchases(){ try { return JSON.parse(localStorage.getItem(PURCHASES_KEY)||'[]'); } catch { return []; } }
  function savePurchases(list){ localStorage.setItem(PURCHASES_KEY, JSON.stringify(Array.from(new Set(list)))); }
  function isTestActive(){ return localStorage.getItem(ADMIN_KEY)==='true' || LEGACY_ADMIN_KEYS.some(k => localStorage.getItem(k)==='true'); }
  function clearTest(){
    [ADMIN_KEY, ...LEGACY_ADMIN_KEYS, 'fitbrandPurchasedPackage', 'fitbrandMealPlanUnlocked'].forEach(k=>localStorage.removeItem(k));
    const ids = new Set(Object.keys(PRODUCT_DATA));
    savePurchases(readPurchases().filter(x => !ids.has(x)));
    $('fbV45AdminBar')?.remove();
  }
  function grantTest(){
    localStorage.setItem(ADMIN_KEY,'true');
    localStorage.setItem('fitbrandPurchasedPackage','bundle');
    localStorage.setItem('fitbrandMealPlanUnlocked','true');
    savePurchases([...readPurchases(), ...Object.keys(PRODUCT_DATA)]);
    addAdminBar();
  }
  window.fitbrandGrantAdminTestAccess = grantTest;
  window.fitbrandClearAdminTestAccess = clearTest;
  window.fitbrandHasAdminTestAccess = isTestActive;

  function addAdminBar(){
    if(!isTestActive() || $('fbV45AdminBar') || page()==='admin-test-access.html') return;
    const bar=document.createElement('div');
    bar.id='fbV45AdminBar';
    bar.className='fb-v45-admin-bar';
    bar.innerHTML='<div><strong>TEST MODE</strong><span>You have free access on this browser only. Customers do not see this.</span></div><button type="button">Clear TEST</button>';
    bar.querySelector('button').addEventListener('click',()=>{clearTest(); toast('TEST access cleared','You are now viewing the normal customer flow.','success'); setTimeout(()=>location.reload(),700);});
    document.body.appendChild(bar);
  }

  function openGumroad(){
    if(hasGumroad()){
      const url = new URL(gumroadUrl(), location.href).toString();
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    toast('Payment link missing', 'Add your real Gumroad link in gumroad-config.js before customers can buy.', 'error');
  }
  window.fitbrandOpenGumroad = openGumroad;

  function forceLogoHome(){
    if(!['checkout.html','purchase-access.html'].includes(page())) return;
    $$('.brand, a.brand, .logo, .logo-img, .brand-word').forEach(el=>{
      const a = el.tagName === 'A' ? el : el.closest('a');
      if(a){
        a.href='index.html';
        a.setAttribute('aria-label','Back to FitBrand home');
        a.addEventListener('click', e=>{ e.preventDefault(); location.href='index.html'; }, true);
      }
    });
  }

  function patchBuyButtons(){
    if(page()==='admin-test-access.html') return;
    $$('a,button').forEach(el=>{
      if(el.closest('footer') || el.closest('.profile-menu') || el.closest('.fb-v45-admin-bar') || el.closest('.fb-v45-admin-page')) return;
      const raw = `${el.getAttribute('href')||''} ${el.textContent||''} ${el.getAttribute('onclick')||''} ${el.className||''}`.toLowerCase();
      const physical = /product-(belt|straps|shaker)|checkout\.html\?product=(belt|straps|shaker)|lifting belt|lifting straps|shaker/i.test(raw);
      if(physical) return;
      const digital = /aesthetic|shred|strength|meal\s*plan|mealplan|bundle|complete|starter|program|fitbrand starter/i.test(raw);
      const intent = /buy|purchase|checkout|unlock|get access|starter access|request access|start|open/i.test(raw);
      if(!digital || !intent) return;
      const product = getProductFromText(raw);
      if(el.tagName === 'A'){
        el.href = purchaseUrl(product);
        el.removeAttribute('onclick');
        el.removeAttribute('target');
      }else{
        el.onclick = (e)=>{ e.preventDefault(); location.href=purchaseUrl(product); };
      }
      const lowerText = (el.textContent||'').toLowerCase();
      if(/buy|purchase|checkout|unlock|get access|request|start|starter|subscription|free/i.test(lowerText)){
        el.textContent = 'Buy Starter Plan — ' + price();
      }
      el.classList.add('fb-v45-primary-cta');
    });
  }

  function buildPurchasePage(){
    if(page() !== 'purchase-access.html') return;
    const main = document.querySelector('main');
    if(!main) return;
    const key = getSelectedProduct();
    const product = PRODUCT_DATA[key];
    document.body.classList.add('fb-v45-purchase-body');
    main.className = 'fb-v45-purchase-main';
    main.innerHTML = `
      <section class="fb-v45-purchase-shell">
        <a class="fb-v45-back" href="index.html">← Back to FitBrand</a>
        <div class="fb-v45-purchase-grid">
          <div class="fb-v45-purchase-copy">
            <span class="fb-v45-pill">Launch test price</span>
            <h1>Get the FitBrand Starter Plan.</h1>
            <p class="fb-v45-lead">A simple starting point with workout structure, meal guidance and early FitBrand access — built to help you stop guessing.</p>
            <div class="fb-v45-trust-row"><span>One-time payment</span><span>No subscription</span><span>Gumroad checkout</span></div>
            <div class="fb-v45-product-pick">
              <small>Selected focus</small>
              <strong>${esc(product.name)}</strong>
              <p>${esc(product.benefit)}</p>
            </div>
          </div>
          <aside class="fb-v45-buy-card" aria-label="Purchase card">
            <div class="fb-v45-price-block">
              <span>Launch price</span>
              <strong>${esc(price())}</strong>
              <small>one-time access</small>
            </div>
            <button type="button" id="fbV45MainBuy" class="fb-v45-buy-now">Buy Starter Plan — ${esc(price())}</button>
            <p class="fb-v45-checkout-note">Secure payment is handled by Gumroad. Use the same email on FitBrand after purchase so access can be connected.</p>
            <div class="fb-v45-checklist">
              <span>✓ Starter workout structure</span>
              <span>✓ Meal guidance preview</span>
              <span>✓ Early FitBrand tools</span>
              <span>✓ Support: support@fitbrand.fit</span>
            </div>
          </aside>
        </div>
      </section>
      <section class="fb-v45-proof-grid">
        <article><b>1</b><h3>Clear plan</h3><p>Start with structure instead of random workouts.</p></article>
        <article><b>2</b><h3>Simple nutrition</h3><p>Meal guidance that supports your goal without overcomplicating it.</p></article>
        <article><b>3</b><h3>Early access</h3><p>Help shape FitBrand before the full launch.</p></article>
      </section>
    `;
    $('fbV45MainBuy')?.addEventListener('click', openGumroad);
  }

  function buildAdminPage(){
    if(page() !== 'admin-test-access.html') return;
    document.body.className = 'fb-v45-admin-body';
    document.body.innerHTML = `
      <main class="fb-v45-admin-page">
        <section id="fbV45AdminLoginCard" class="fb-v45-admin-card">
          <a class="fb-v45-back light" href="index.html">← Back to site</a>
          <span class="fb-v45-test-badge">Private admin</span>
          <h1>FitBrand TEST panel</h1>
          <p>Log in with your admin password. This page lets you test all paid programs for free on your own browser only.</p>
          <label for="fbV45Password">Admin password</label>
          <input id="fbV45Password" type="password" autocomplete="current-password" placeholder="Enter admin password">
          <button id="fbV45LoginBtn" type="button">Open TEST panel</button>
          <div id="fbV45LoginMsg" class="fb-v45-admin-msg"></div>
        </section>
        <section id="fbV45AdminPanel" class="fb-v45-admin-card fb-v45-admin-panel" hidden>
          <div class="fb-v45-admin-top">
            <div><span class="fb-v45-test-label">TEST</span><h1>Admin testing access</h1><p>Unlock every paid tool for this browser, test flows, then clear access before checking customer mode.</p></div>
            <a href="index.html" class="fb-v45-admin-home">Home</a>
          </div>
          <div class="fb-v45-admin-actions">
            <button id="fbV45Unlock" type="button">Unlock all TEST access</button>
            <button id="fbV45Clear" type="button" class="secondary">Clear TEST access</button>
          </div>
          <div class="fb-v45-admin-status" id="fbV45AdminStatus">Current status: ${isTestActive() ? 'TEST access is active' : 'normal customer mode'}</div>
          <div class="fb-v45-admin-grid">
            <article><span>TEST</span><h3>Aesthetic Program</h3><p>Open paid program test flow.</p><a href="index.html?purchased=aesthetic">Open</a></article>
            <article><span>TEST</span><h3>Shred Program</h3><p>Open paid program test flow.</p><a href="index.html?purchased=shred">Open</a></article>
            <article><span>TEST</span><h3>Strength Program</h3><p>Open paid program test flow.</p><a href="index.html?purchased=strength">Open</a></article>
            <article><span>TEST</span><h3>Meal Plan AI</h3><p>Open meal guide AI test area.</p><a href="recommended.html#meal-plan-ai">Open</a></article>
            <article><span>CUSTOMER</span><h3>Purchase page</h3><p>View what customers see before Gumroad.</p><a href="purchase-access.html?product=starter">Open</a></article>
            <article><span>ACCESS</span><h3>My Products</h3><p>See unlocked product access.</p><a href="products-access.html">Open</a></article>
          </div>
          <p class="fb-v45-admin-note"><strong>Important:</strong> TEST mode is only local to this browser. Customers can only buy through the purchase page.</p>
        </section>
      </main>`;
    const loginCard = $('fbV45AdminLoginCard');
    const panel = $('fbV45AdminPanel');
    const openPanel = () => { loginCard.hidden = true; panel.hidden = false; };
    if(sessionStorage.getItem('fitbrandAdminV45LoggedIn') === 'true') openPanel();
    $('fbV45LoginBtn')?.addEventListener('click', async ()=>{
      const pass = $('fbV45Password').value.trim();
      const msg = $('fbV45LoginMsg');
      if(!pass){ msg.textContent='Enter your admin password.'; return; }
      msg.textContent='Checking password...';
      try{
        const res = await fetch('/api/admin-leads', { headers:{ 'x-fitbrand-admin-password': pass }});
        if(!res.ok) throw new Error('Wrong password or admin API not ready.');
        sessionStorage.setItem('fitbrandAdminPassword', pass);
        sessionStorage.setItem('fitbrandAdminV45LoggedIn','true');
        openPanel();
      }catch(err){ msg.textContent=err.message || 'Could not log in.'; }
    });
    $('fbV45Unlock')?.addEventListener('click', ()=>{ grantTest(); $('fbV45AdminStatus').textContent='Current status: TEST access is active'; toast('TEST access active','All tools are unlocked for this browser only.','success'); });
    $('fbV45Clear')?.addEventListener('click', ()=>{ clearTest(); $('fbV45AdminStatus').textContent='Current status: normal customer mode'; toast('TEST access cleared','You can now test as a normal customer.','success'); });
  }

  function patchAccessPage(){
    if(page() !== 'products-access.html' || !isTestActive()) return;
    grantTest();
    setTimeout(()=>{
      $$('.access-card').forEach(card=>{
        const text = (card.textContent||'').toLowerCase();
        const a = card.querySelector('a');
        if(!a) return;
        a.textContent = 'Open TEST';
        a.className = 'btn-dark fb-v45-primary-cta';
        if(text.includes('meal')) a.href='recommended.html#meal-plan-ai';
        else if(text.includes('shred')) a.href='index.html?purchased=shred';
        else if(text.includes('strength')) a.href='index.html?purchased=strength';
        else if(text.includes('bundle')) a.href='index.html?purchased=bundle';
        else a.href='index.html?purchased=aesthetic';
        card.classList.add('owned');
      });
    },400);
  }

  function boot(){
    buildAdminPage();
    buildPurchasePage();
    forceLogoHome();
    patchBuyButtons();
    patchAccessPage();
    addAdminBar();
    setTimeout(()=>{forceLogoHome(); patchBuyButtons(); patchAccessPage();}, 600);
    setTimeout(()=>{forceLogoHome(); patchBuyButtons(); patchAccessPage();}, 1600);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
