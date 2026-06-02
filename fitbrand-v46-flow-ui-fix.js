/* FitBrand v46 — final flow/UI fix
   - Admin TEST is separated from customer purchase
   - Customer buy buttons never become free/test access
   - Nav links are protected from CTA styling
   - Program prices/buttons are simplified for conversion
*/
(function(){
  'use strict';
  const VERSION='v46-flow-ui-fix';
  const ADMIN_KEY='fitbrandAdminTestAccessV46';
  const LEGACY_TEST_KEYS=['fitbrandAdminTestAccessV45','fitbrandAdminTestAccessV44','fitbrandAdminTestAccessV43','fitbrandAdminTestAccess','fitbrandAllAccessUnlocked'];
  const PURCHASES_KEY='fitbrandPurchases';
  const DIGITAL=['aesthetic','shred','strength','bundle','mealplan','starter'];
  const PRODUCTS={
    starter:{name:'FitBrand Starter Plan',focus:'Starter access',href:'purchase-access.html?product=starter'},
    aesthetic:{name:'Aesthetic Program',focus:'Build a balanced physique',href:'purchase-access.html?product=aesthetic'},
    shred:{name:'Shred Program',focus:'Lose fat with structure',href:'purchase-access.html?product=shred'},
    strength:{name:'Strength Program',focus:'Build strength and size',href:'purchase-access.html?product=strength'},
    mealplan:{name:'Meal Plan AI',focus:'Meal guidance and structure',href:'purchase-access.html?product=mealplan'},
    bundle:{name:'Complete Bundle',focus:'All FitBrand digital tools',href:'purchase-access.html?product=bundle'}
  };
  const $=(id)=>document.getElementById(id);
  const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const page=()=>((location.pathname.split('/').pop()||'index.html').toLowerCase());
  const esc=(v)=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const cfg=()=>window.FITBRAND_GUMROAD_CONFIG||{};
  const price=()=>cfg().priceLabel||'$4.99';
  const gumroad=()=>String(cfg().starterAccessUrl||'').trim();
  const gumroadReady=()=>/^https:\/\//i.test(gumroad()) && !/PASTE_|YOUR_|example|gumroad\.com\/?$/i.test(gumroad());

  function toast(title,msg,type='info'){
    let box=$('fbV46Toast');
    if(!box){box=document.createElement('div');box.id='fbV46Toast';box.className='fb-v46-toast';document.body.appendChild(box);}
    box.className='fb-v46-toast show '+type;
    box.innerHTML='<strong>'+esc(title)+'</strong><span>'+esc(msg)+'</span>';
    clearTimeout(box._t); box._t=setTimeout(()=>box.classList.remove('show'),4500);
  }
  window.fitbrandToast=window.fitbrandShowToast=toast;

  function readPurchases(){try{return JSON.parse(localStorage.getItem(PURCHASES_KEY)||'[]')}catch{return []}}
  function savePurchases(list){localStorage.setItem(PURCHASES_KEY, JSON.stringify([...new Set(list.filter(Boolean))]));}
  function testActive(){return localStorage.getItem(ADMIN_KEY)==='true' || LEGACY_TEST_KEYS.some(k=>localStorage.getItem(k)==='true');}
  function clearTest(){
    [ADMIN_KEY,...LEGACY_TEST_KEYS,'fitbrandPurchasedPackage','fitbrandMealPlanUnlocked'].forEach(k=>localStorage.removeItem(k));
    savePurchases(readPurchases().filter(x=>!DIGITAL.includes(x)));
    $('fbV46AdminBar')?.remove();
  }
  function grantTest(){
    localStorage.setItem(ADMIN_KEY,'true');
    localStorage.setItem('fitbrandPurchasedPackage','bundle');
    localStorage.setItem('fitbrandMealPlanUnlocked','true');
    savePurchases([...readPurchases(), ...DIGITAL]);
    addTestBar();
  }
  window.fitbrandGrantAdminTestAccess=grantTest;
  window.fitbrandClearAdminTestAccess=clearTest;
  window.fitbrandHasAdminTestAccess=testActive;

  function addTestBar(){
    if(!testActive() || $('fbV46AdminBar') || page()==='admin-test-access.html') return;
    const bar=document.createElement('div');
    bar.id='fbV46AdminBar';
    bar.className='fb-v46-admin-bar';
    bar.innerHTML='<div><b>TEST MODE</b><span>Free admin access is active on this browser only.</span></div><button type="button">Clear TEST</button>';
    bar.querySelector('button').addEventListener('click',()=>{clearTest(); toast('TEST cleared','You are now viewing the customer flow.','success'); setTimeout(()=>location.reload(),650);});
    document.body.appendChild(bar);
  }

  function normalizeNav(){
    $$('.nav nav a, header.nav nav a').forEach(a=>{
      a.classList.remove('fb-v45-primary-cta','fb-v44-buy-button','fb-v43-buy-btn','btn-dark','btn-silver');
      a.removeAttribute('style');
      const txt=(a.textContent||'').trim().toLowerCase();
      const href=(a.getAttribute('href')||'').toLowerCase();
      if(txt==='programs') a.href='programs.html';
      if(txt==='early access') a.href='early-access.html';
      if(txt==='home') a.href='index.html';
      if(txt==='policies') a.href='policies.html';
      if(href.includes('purchase-access') && !/buy|starter|checkout/i.test(txt)) a.href='programs.html';
    });
  }

  function productFrom(raw){
    const t=String(raw||'').toLowerCase();
    if(t.includes('shred')) return 'shred';
    if(t.includes('strength')) return 'strength';
    if(t.includes('meal')) return 'mealplan';
    if(t.includes('bundle')||t.includes('complete')) return 'bundle';
    if(t.includes('aesthetic')) return 'aesthetic';
    return 'starter';
  }

  function normalizeProgramCards(){
    if(page()!=='programs.html') return;
    $$('.program-row, .bundle-upgrade-card').forEach(card=>{
      const product=productFrom(card.textContent);
      const priceEl=card.querySelector('.price');
      if(priceEl){
        const label=product==='bundle'?'Complete starter access':'Starter access';
        priceEl.classList.add('fb-v46-price-card');
        priceEl.innerHTML=`<span class="fb-v46-price-kicker">${label}</span><strong>${esc(price())}</strong><em>one-time launch price</em><small>No subscription • Gumroad checkout • Early FitBrand access</small>`;
      }
      const actions=card.querySelector('.program-cart-actions, .bundle-actions');
      if(actions){
        actions.classList.add('fb-v46-actions');
        actions.innerHTML=`<a class="fb-v46-buy" href="purchase-access.html?product=${encodeURIComponent(product)}">Buy Starter Plan — ${esc(price())}</a><a class="fb-v46-see" href="purchase-access.html?product=${encodeURIComponent(product)}#what-you-get">See what you get</a>`;
      }
    });
  }

  function normalizeBuyButtons(){
    if(page()==='admin-test-access.html') return;
    $$('a,button').forEach(el=>{
      if(el.closest('.nav') || el.closest('header') || el.closest('footer') || el.closest('.profile-menu') || el.closest('#fbV46AdminBar')) return;
      const raw=`${el.getAttribute('href')||''} ${el.textContent||''} ${el.getAttribute('onclick')||''}`;
      const text=(el.textContent||'').trim();
      const physical=/product-(belt|straps|shaker)|lifting belt|lifting straps|shaker/i.test(raw);
      if(physical) return;
      const purchaseIntent=/buy|purchase|checkout|get access|starter plan|unlock|bundle|program/i.test(raw);
      const digital=/aesthetic|shred|strength|meal|bundle|starter|program/i.test(raw);
      if(!purchaseIntent || !digital) return;
      const product=productFrom(raw);
      if(el.tagName==='A'){
        el.href='purchase-access.html?product='+encodeURIComponent(product);
        el.removeAttribute('target');
        el.removeAttribute('onclick');
      }else{
        el.onclick=(e)=>{e.preventDefault();location.href='purchase-access.html?product='+encodeURIComponent(product)};
      }
      if(/add to cart/i.test(text)) return;
      if(/buy|purchase|checkout|get access|unlock|subscription|start/i.test(text)) el.textContent='Buy Starter Plan — '+price();
      el.classList.add('fb-v46-buy-normalized');
    });
  }

  function openGumroad(){
    if(gumroadReady()) { window.open(new URL(gumroad(), location.href).toString(),'_blank','noopener,noreferrer'); return; }
    toast('Payment link missing','Paste your real Gumroad product link in gumroad-config.js before customers can buy.','error');
  }
  window.fitbrandOpenGumroad=openGumroad;

  function buildPurchasePage(){
    if(page()!=='purchase-access.html') return;
    const main=document.querySelector('main'); if(!main) return;
    const params=new URLSearchParams(location.search);
    const key=PRODUCTS[params.get('product')] ? params.get('product') : 'starter';
    const p=PRODUCTS[key];
    document.body.classList.add('fb-v46-purchase-body');
    main.className='fb-v46-purchase-main';
    main.innerHTML=`
      <section class="fb-v46-purchase-hero">
        <a class="fb-v46-back" href="index.html">← Back to FitBrand</a>
        <div class="fb-v46-purchase-layout">
          <div>
            <span class="fb-v46-pill">Early launch offer</span>
            <h1>Unlock FitBrand Starter Plan.</h1>
            <p class="fb-v46-lead">Get a simple training and meal guidance starting point before the full FitBrand launch.</p>
            <div class="fb-v46-trust"><span>One-time payment</span><span>No subscription</span><span>Secure Gumroad checkout</span><span>Support included</span></div>
            <div class="fb-v46-selected"><small>Selected focus</small><b>${esc(p.name)}</b><span>${esc(p.focus)}</span></div>
          </div>
          <aside class="fb-v46-checkout-card">
            <div class="fb-v46-price-large"><span>Launch price</span><strong>${esc(price())}</strong><em>one-time</em></div>
            <button id="fbV46BuyNow" type="button" class="fb-v46-main-buy">Buy Starter Plan — ${esc(price())}</button>
            <p>Payment opens on Gumroad. Use the same email on FitBrand after purchase, so access can be connected.</p>
            <ul><li>Workout structure preview</li><li>Meal guidance preview</li><li>Early FitBrand access</li><li>Digital product access</li></ul>
          </aside>
        </div>
      </section>
      <section id="what-you-get" class="fb-v46-proof"><article><b>1</b><h3>Structure</h3><p>Clear starting point instead of random workouts.</p></article><article><b>2</b><h3>Nutrition</h3><p>Simple meal guidance that supports your goal.</p></article><article><b>3</b><h3>Access</h3><p>Early access while FitBrand is being built.</p></article></section>`;
    $('fbV46BuyNow')?.addEventListener('click',openGumroad);
  }

  function buildAdminPage(){
    if(page()!=='admin-test-access.html') return;
    document.body.className='fb-v46-admin-body';
    document.body.innerHTML=`<main class="fb-v46-admin-page">
      <section id="fbV46Login" class="fb-v46-admin-card">
        <a class="fb-v46-back light" href="index.html">← Back to site</a>
        <span class="fb-v46-test-chip">ADMIN TEST</span>
        <h1>FitBrand test center</h1>
        <p>Login here to test all paid programs for free. This does not affect customers and it does not change the public buy buttons.</p>
        <label>Admin password</label><input id="fbV46Password" type="password" placeholder="Enter admin password" autocomplete="current-password">
        <button id="fbV46LoginBtn" type="button">Open TEST center</button><div id="fbV46LoginMsg" class="fb-v46-admin-msg"></div>
      </section>
      <section id="fbV46Panel" class="fb-v46-admin-card fb-v46-panel" hidden>
        <div class="fb-v46-admin-head"><div><span class="fb-v46-test-chip">TEST</span><h1>Free admin access</h1><p>Use these buttons to unlock and test paid tools on this browser only.</p></div><a href="index.html">Home</a></div>
        <div class="fb-v46-admin-actions"><button id="fbV46UnlockAll" type="button">Unlock all TEST access</button><button id="fbV46ClearAll" type="button" class="secondary">Clear TEST access</button></div>
        <div id="fbV46Status" class="fb-v46-status">Status: ${testActive()?'TEST access active':'normal customer mode'}</div>
        <div class="fb-v46-test-grid">
          ${['aesthetic','shred','strength','bundle','mealplan'].map(k=>`<article><span>TEST</span><h3>${esc(PRODUCTS[k].name)}</h3><p>${esc(PRODUCTS[k].focus)}</p><button type="button" data-test-open="${k}">Test ${esc(PRODUCTS[k].name.replace(' Program',''))}</button></article>`).join('')}
          <article><span>CUSTOMER</span><h3>Purchase page</h3><p>See the public Gumroad-first checkout page.</p><a href="purchase-access.html?product=starter">Open purchase page</a></article>
          <article><span>ACCESS</span><h3>My products</h3><p>Check unlocked products after TEST access is enabled.</p><a href="products-access.html">Open products</a></article>
        </div>
        <p class="fb-v46-admin-note"><b>Important:</b> If you want to test as a normal customer, press Clear TEST access first.</p>
      </section>
    </main>`;
    const login=$('fbV46Login'), panel=$('fbV46Panel');
    const open=()=>{login.hidden=true;panel.hidden=false;};
    if(sessionStorage.getItem('fitbrandAdminV46LoggedIn')==='true') open();
    $('fbV46LoginBtn')?.addEventListener('click',async()=>{
      const pass=($('fbV46Password')?.value||'').trim(); const msg=$('fbV46LoginMsg');
      if(!pass){msg.textContent='Enter your admin password.';return;}
      msg.textContent='Checking password...';
      try{const res=await fetch('/api/admin-leads',{headers:{'x-fitbrand-admin-password':pass}}); if(!res.ok) throw new Error('Wrong password or admin API is not ready.'); sessionStorage.setItem('fitbrandAdminV46LoggedIn','true'); open();}
      catch(e){msg.textContent=e.message||'Could not log in.';}
    });
    $('fbV46UnlockAll')?.addEventListener('click',()=>{grantTest();$('fbV46Status').textContent='Status: TEST access active';toast('TEST active','All paid FitBrand tools are unlocked on this browser.','success');});
    $('fbV46ClearAll')?.addEventListener('click',()=>{clearTest();$('fbV46Status').textContent='Status: normal customer mode';toast('TEST cleared','You can now test the customer purchase flow.','success');});
    $$('[data-test-open]').forEach(btn=>btn.addEventListener('click',()=>{
      const key=btn.getAttribute('data-test-open');
      grantTest();
      if(key==='mealplan') location.href='recommended.html?purchased=mealplan#meal-plan-ai';
      else location.href='index.html?purchased='+encodeURIComponent(key)+'&adminTest=1';
    }));
  }

  function enhanceProductsAccess(){
    if(page()!=='products-access.html' || !testActive()) return;
    grantTest();
    setTimeout(()=>{
      $$('.access-card').forEach(card=>{
        const text=(card.textContent||'').toLowerCase();
        const a=card.querySelector('a'); if(!a) return;
        a.textContent='Open TEST'; a.className='btn-dark fb-v46-buy-normalized'; card.classList.add('owned');
        if(text.includes('meal')) a.href='recommended.html?purchased=mealplan#meal-plan-ai';
        else if(text.includes('shred')) a.href='index.html?purchased=shred&adminTest=1';
        else if(text.includes('strength')) a.href='index.html?purchased=strength&adminTest=1';
        else if(text.includes('bundle')) a.href='index.html?purchased=bundle&adminTest=1';
        else a.href='index.html?purchased=aesthetic&adminTest=1';
      });
    },500);
  }

  function forceAccessOnToolPages(){
    if(!testActive()) return;
    if(page()==='index.html'){
      const p=new URLSearchParams(location.search).get('purchased');
      if(p && p!=='mealplan') localStorage.setItem('fitbrandPurchasedPackage', p);
      setTimeout(()=>{const btn=$('openGeneratorBtn'); if(btn) btn.classList.add('show'); if(p && window.openGeneratorModal) window.openGeneratorModal();},900);
    }
    if(page()==='recommended.html'){
      localStorage.setItem('fitbrandMealPlanUnlocked','true');
      const params=new URLSearchParams(location.search);
      const box=document.querySelector('#meal-plan-ai');
      const gen=document.querySelector('#mealGenerator');
      if(box) box.classList.add('unlocked');
      if(gen) gen.classList.add('show');
      if(params.get('purchased')==='mealplan'){
        setTimeout(()=>{
          const box2=document.querySelector('#meal-plan-ai');
          const gen2=document.querySelector('#mealGenerator');
          if(box2) box2.classList.add('unlocked');
          if(gen2) gen2.classList.add('show');
          box2?.scrollIntoView({behavior:'smooth',block:'start'});
        },900);
      }
    }
  }

  function boot(){
    buildAdminPage();
    buildPurchasePage();
    normalizeNav();
    normalizeProgramCards();
    normalizeBuyButtons();
    enhanceProductsAccess();
    forceAccessOnToolPages();
    addTestBar();
    [350,1000,2000].forEach(t=>setTimeout(()=>{normalizeNav();normalizeProgramCards();normalizeBuyButtons();enhanceProductsAccess();},t));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
