/* FitBrand v43 final purchase/admin/layout guard */
(function(){
  'use strict';

  const CONFIG = () => window.FITBRAND_GUMROAD_CONFIG || {};
  const PURCHASE_URL = 'purchase-access.html?product=starter';
  const ADMIN_KEY = 'fitbrandAdminTestAccessV43';
  const LEGACY_ADMIN_KEYS = ['fitbrandAdminTestAccess', 'fitbrandAdminAccess', 'fitbrandAllAccessUnlocked'];
  const DIGITAL_KEYS = ['aesthetic','shred','strength','mealplan','bundle'];
  const PRODUCT_LABELS = {
    aesthetic: 'Aesthetic Program',
    shred: 'Shred Program',
    strength: 'Strength Program',
    mealplan: 'Meal Plan Guide AI',
    bundle: 'Complete Bundle + Meal Plan AI',
    starter: 'FitBrand Starter Plan'
  };

  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const path = () => location.pathname.split('/').pop() || 'index.html';

  function isRealGumroadUrl(url){
    return /^https:\/\//i.test(String(url||'')) && !String(url).includes('PASTE_') && !String(url).includes('gumroad.com/your');
  }
  function getGumroadUrl(){ return CONFIG().starterAccessUrl || ''; }
  function getPrice(){ return CONFIG().priceLabel || '$4.99'; }
  function hasAdminAccess(){
    return localStorage.getItem(ADMIN_KEY) === 'true' || LEGACY_ADMIN_KEYS.some(k => localStorage.getItem(k) === 'true');
  }
  function getPurchases(){
    try { return JSON.parse(localStorage.getItem('fitbrandPurchases') || '[]'); } catch { return []; }
  }
  function setPurchases(list){ localStorage.setItem('fitbrandPurchases', JSON.stringify(Array.from(new Set(list)))); }
  function grantLocalAccess(){
    localStorage.setItem(ADMIN_KEY, 'true');
    localStorage.setItem('fitbrandAdminTestAccess', 'true');
    const p = new Set(getPurchases());
    DIGITAL_KEYS.forEach(k => p.add(k));
    p.add('starter');
    setPurchases([...p]);
    localStorage.setItem('fitbrandPurchasedPackage', 'bundle');
    localStorage.setItem('fitbrandMealPlanUnlocked', 'true');
    addAdminBar();
  }
  function clearLocalAccess(){
    [ADMIN_KEY,'fitbrandAdminTestAccess','fitbrandAdminAccess','fitbrandAllAccessUnlocked','fitbrandPurchasedPackage','fitbrandMealPlanUnlocked'].forEach(k => localStorage.removeItem(k));
    try{
      const keep = getPurchases().filter(k => !DIGITAL_KEYS.includes(k) && k !== 'starter');
      setPurchases(keep);
    }catch{}
    const bar = $('fbAdminTestBar'); if(bar) bar.remove();
  }
  window.fitbrandGrantAdminTestAccess = grantLocalAccess;
  window.fitbrandClearAdminTestAccess = clearLocalAccess;
  window.fitbrandHasAdminTestAccess = hasAdminAccess;

  function showToast(title, message, type='info'){
    let box = $('fbV43Toast');
    if(!box){
      box = document.createElement('div');
      box.id = 'fbV43Toast';
      box.className = 'fb-v43-toast';
      document.body.appendChild(box);
    }
    box.className = 'fb-v43-toast show ' + type;
    box.innerHTML = `<strong>${esc(title)}</strong><span>${esc(message)}</span>`;
    clearTimeout(box._t);
    box._t = setTimeout(()=>box.classList.remove('show'), 4300);
  }
  window.fitbrandShowToast = showToast;

  function safeOpenGumroad(){
    const url = getGumroadUrl();
    if(isRealGumroadUrl(url)){
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      showToast('Gumroad link missing', 'Paste your Gumroad product link in gumroad-config.js first.', 'error');
    }
  }
  window.fitbrandOpenGumroad = safeOpenGumroad;

  function normalizeVisiblePrices(root=document){
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const parent = node.parentElement;
        if(!parent || ['SCRIPT','STYLE','TEXTAREA','INPUT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return /€\d|\$\d|month|subscription|target price|request access|buy access|start subscription|early access|manual beta/i.test(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      let t = n.nodeValue;
      t = t.replace(/€\s*(?:4\.99|6\.99|7\.99|9\.99|14\.99|24\.99)\s*(?:\/\s*(?:mo|month))?/gi, getPrice());
      t = t.replace(/\$\s*(?:0|4\.99|6\.99|7\.99|9\.99|14\.99|24\.99)\s*(?:\/\s*(?:mo|month))?/gi, getPrice());
      t = t.replace(/\s*\/\s*(?:mo|month)(?:\s*\/\s*(?:mo|month))*/gi, ' one-time');
      t = t.replace(/monthly subscription|subscription checkout|manual beta access|manual approval|target price/gi, 'Starter access');
      t = t.replace(/Request access|Buy access|Start subscription|Start access|Join early access/gi, 'Buy Starter Plan');
      t = t.replace(/Starter access:\s*/gi, '');
      n.nodeValue = t;
    });
  }

  function patchDigitalBuyLinks(){
    $$('a,button').forEach(el => {
      const href = (el.getAttribute('href') || '').toLowerCase();
      const text = (el.textContent || '').toLowerCase();
      const onclick = (el.getAttribute('onclick') || '').toLowerCase();
      const classes = el.className || '';
      const isPhysical = href.includes('product-belt') || href.includes('product-straps') || href.includes('product-shaker') || href.includes('checkout.html?product=shaker') || href.includes('checkout.html?product=belt') || href.includes('checkout.html?product=straps');
      const isAdmin = href.includes('admin-') || el.closest('.fb-admin-page') || el.closest('#fbAdminTestBar');
      const isDigital = /aesthetic|shred|strength|mealplan|meal plan|bundle|starter|program|access|plan/i.test(href + ' ' + text + ' ' + onclick + ' ' + classes);
      const looksLikeBuy = /buy|purchase|checkout|request access|unlock|starter plan|access|start/i.test(href + ' ' + text + ' ' + onclick);
      if(!isAdmin && !isPhysical && isDigital && looksLikeBuy){
        if(el.tagName === 'A'){
          el.setAttribute('href', PURCHASE_URL);
          el.removeAttribute('target');
          el.removeAttribute('onclick');
        }else{
          el.onclick = (ev)=>{ ev.preventDefault(); location.href = PURCHASE_URL; };
        }
        if(/buy|request|start|unlock|access|subscription|checkout/i.test(el.textContent || '')) el.textContent = `Buy — ${getPrice()}`;
        el.classList.add('fb-v43-buy-btn');
      }
    });
  }

  function fixCheckoutLogo(){
    if(!['checkout.html','purchase-access.html'].includes(path())) return;
    $$('.brand, .brand a, a.brand, .logo, .logo-img').forEach(el => {
      const anchor = el.tagName === 'A' ? el : el.closest('a') || el.parentElement;
      if(anchor && anchor.tagName === 'A'){
        anchor.setAttribute('href','index.html');
        anchor.style.cursor='pointer';
        anchor.addEventListener('click', function(e){ e.preventDefault(); location.href='index.html'; }, {capture:true});
      }
    });
  }

  function addAdminBar(){
    if(!hasAdminAccess() || $('fbAdminTestBar')) return;
    const bar = document.createElement('div');
    bar.id = 'fbAdminTestBar';
    bar.className = 'fb-admin-test-bar';
    bar.innerHTML = `<strong>Admin test access active</strong><span>You are seeing paid products unlocked on this device only.</span><button type="button" id="fbClearAdminTestAccessBtn">Clear test access</button>`;
    document.body.appendChild(bar);
    $('fbClearAdminTestAccessBtn')?.addEventListener('click', () => { clearLocalAccess(); showToast('Test access cleared','You are now viewing as a normal visitor.', 'success'); setTimeout(()=>location.reload(),500); });
  }

  function patchAccessCards(){
    if(!path().includes('products-access')) return;
    setTimeout(() => {
      const admin = hasAdminAccess();
      if(admin){
        const p = new Set(getPurchases()); DIGITAL_KEYS.forEach(k=>p.add(k)); p.add('starter'); setPurchases([...p]);
      }
      $$('.access-card').forEach(card => {
        const isLocked = /locked|request access|buy|log in/i.test(card.textContent || '');
        const a = card.querySelector('a');
        if(admin && a){
          const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
          let url = 'index.html?purchased=bundle';
          if(title.includes('meal')) url = 'recommended.html#meal-plan-ai';
          if(title.includes('aesthetic')) url = 'index.html?purchased=aesthetic';
          if(title.includes('shred')) url = 'index.html?purchased=shred';
          if(title.includes('strength')) url = 'index.html?purchased=strength';
          a.href = url; a.textContent = 'Open'; a.className='btn-dark';
          const span = card.querySelector('span'); if(span) span.textContent='Admin unlocked';
          const ptag = card.querySelector('p'); if(ptag) ptag.textContent='Unlocked for testing on this browser.';
        } else if(isLocked && a){
          a.href = PURCHASE_URL; a.textContent = `Buy — ${getPrice()}`;
        }
      });
    }, 500);
  }

  function buildPurchasePage(){
    if(path() !== 'purchase-access.html') return;
    const main = document.querySelector('main');
    if(!main) return;
    const params = new URLSearchParams(location.search);
    const selected = params.get('product') || 'starter';
    const label = PRODUCT_LABELS[selected] || 'FitBrand Starter Plan';
    main.className = 'fb-v43-purchase-page';
    main.innerHTML = `
      <section class="fb-v43-checkout-hero">
        <a href="index.html" class="fb-v43-back">← Back to FitBrand</a>
        <div class="fb-v43-badge">Launch test offer</div>
        <h1>Start with the FitBrand Starter Plan.</h1>
        <p>Get a simple workout structure, meal guidance preview and early FitBrand access. One low test price — no subscription.</p>
        <div class="fb-v43-price-card">
          <span>One-time access</span>
          <strong>${esc(getPrice())}</strong>
          <small>Secure payment handled by Gumroad</small>
        </div>
        <button type="button" class="fb-v43-main-buy" id="fbGumroadBuyBtn">Buy — ${esc(getPrice())}</button>
        <p class="fb-v43-safe-note">After purchase, use the same email on FitBrand. If your access is not unlocked yet, send your Gumroad receipt to support@fitbrand.fit.</p>
      </section>
      <section class="fb-v43-checkout-grid">
        <article><strong>01</strong><h3>Workout structure</h3><p>A clear starting plan for your goal instead of random workouts.</p></article>
        <article><strong>02</strong><h3>Meal guidance</h3><p>Simple nutrition structure and practical meal direction.</p></article>
        <article><strong>03</strong><h3>Early access</h3><p>Support FitBrand early and get access before the full launch.</p></article>
      </section>
      <section class="fb-v43-product-preview">
        <h2>What happens after you buy?</h2>
        <ol>
          <li>Gumroad sends your PDF and receipt.</li>
          <li>You log in to FitBrand with the same email.</li>
          <li>We unlock your access manually while the full payment system is being tested.</li>
        </ol>
      </section>
    `;
    $('fbGumroadBuyBtn')?.addEventListener('click', safeOpenGumroad);
  }

  function buildAdminTestPage(){
    if(path() !== 'admin-test-access.html') return;
    document.body.classList.add('fb-v43-admin-body');
    document.body.innerHTML = `
      <main class="fb-v43-admin-page">
        <section class="fb-v43-admin-card" id="fbAdminLoginCard">
          <a class="fb-v43-back" href="index.html">← Back to site</a>
          <div class="fb-v43-badge">Private testing</div>
          <h1>FitBrand Admin Test Access</h1>
          <p>Log in with your admin password to unlock all paid products on this browser for testing. Customers will not see this.</p>
          <input id="fbAdminPassword" type="password" placeholder="Admin password" autocomplete="current-password">
          <button id="fbAdminLoginBtn" type="button">Open testing panel</button>
          <div id="fbAdminLoginMsg" class="fb-v43-admin-msg"></div>
        </section>
        <section class="fb-v43-admin-card fb-v43-admin-panel" id="fbAdminPanel" style="display:none">
          <a class="fb-v43-back" href="index.html">← Back to site</a>
          <h1>Testing panel</h1>
          <p>Use this to test products without buying. It only changes your current browser.</p>
          <div class="fb-v43-admin-actions">
            <button id="fbUnlockAllBtn" type="button">Unlock all on this device</button>
            <button id="fbClearAccessBtn" type="button" class="secondary">Clear test access</button>
          </div>
          <div class="fb-v43-test-grid">
            <a href="products-access.html">My Products / Access</a>
            <a href="index.html?purchased=aesthetic">Test Aesthetic</a>
            <a href="index.html?purchased=shred">Test Shred</a>
            <a href="index.html?purchased=strength">Test Strength</a>
            <a href="recommended.html#meal-plan-ai">Test Meal Plan AI</a>
            <a href="purchase-access.html">View customer checkout</a>
          </div>
          <p class="fb-v43-safe-note">When testing the normal customer flow, click “Clear test access” first.</p>
        </section>
      </main>
    `;
    const saved = sessionStorage.getItem('fitbrandAdminTestLoggedIn') === 'true';
    function openPanel(){ $('fbAdminLoginCard').style.display='none'; $('fbAdminPanel').style.display='block'; }
    if(saved) openPanel();
    $('fbAdminLoginBtn')?.addEventListener('click', async () => {
      const msg = $('fbAdminLoginMsg');
      const password = $('fbAdminPassword').value.trim();
      if(!password){ msg.textContent='Enter admin password.'; return; }
      msg.textContent='Checking password...';
      try{
        const res = await fetch('/api/admin-leads', {headers:{'x-fitbrand-admin-password':password}});
        if(res.status === 401 || res.status === 403) throw new Error('Wrong password.');
        sessionStorage.setItem('fitbrandAdminPassword', password);
        sessionStorage.setItem('fitbrandAdminTestLoggedIn', 'true');
        msg.textContent='Password accepted.'; openPanel();
      }catch(e){ msg.textContent = e.message || 'Could not verify password. Make sure ADMIN_DASHBOARD_PASSWORD is set in Vercel.'; }
    });
    $('fbUnlockAllBtn')?.addEventListener('click', () => { grantLocalAccess(); showToast('All products unlocked','You can now test paid products on this browser.', 'success'); });
    $('fbClearAccessBtn')?.addEventListener('click', () => { clearLocalAccess(); showToast('Test access cleared','Normal customer view restored.', 'success'); });
  }

  function addTrustLabels(){
    if(path() !== 'purchase-access.html') return;
    document.body.classList.add('fb-v43-checkout-body');
  }

  function boot(){
    buildAdminTestPage();
    buildPurchasePage();
    normalizeVisiblePrices();
    patchDigitalBuyLinks();
    fixCheckoutLogo();
    addAdminBar();
    patchAccessCards();
    addTrustLabels();
    setTimeout(()=>{normalizeVisiblePrices();patchDigitalBuyLinks();fixCheckoutLogo();patchAccessCards();},400);
    setTimeout(()=>{normalizeVisiblePrices();patchDigitalBuyLinks();fixCheckoutLogo();patchAccessCards();},1200);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
