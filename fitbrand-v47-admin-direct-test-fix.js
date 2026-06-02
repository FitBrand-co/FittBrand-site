/* FitBrand v47 — admin direct test fix
   Goal:
   - Admin TEST is a separate private page.
   - Admin does NOT need to sign up/log in as a customer to test.
   - TEST mode creates a local fake admin customer only on this browser.
   - Public buy buttons stay purchase/Gumroad-first and never free/test.
*/
(function(){
  'use strict';
  const VERSION='v47-admin-direct-test-fix';
  const ADMIN_FLAG='fitbrandAdminTestAccessV47';
  const ADMIN_SESSION='fitbrandAdminV47LoggedIn';
  const USER_KEY='fitbrandUser';
  const SESSION_USER_KEY='fitbrandSessionUser';
  const PURCHASES_KEY='fitbrandPurchases';
  const PACKAGE_KEY='fitbrandPurchasedPackage';
  const MEAL_KEY='fitbrandMealPlanUnlocked';
  const LEGACY_KEYS=['fitbrandAdminTestAccessV46','fitbrandAdminTestAccessV45','fitbrandAdminTestAccessV44','fitbrandAdminTestAccessV43','fitbrandAdminTestAccess','fitbrandAllAccessUnlocked'];
  const PRODUCTS={
    aesthetic:{name:'Aesthetic Program',focus:'Build a balanced physique',url:'index.html?purchased=aesthetic&adminTest=1'},
    shred:{name:'Shred Program',focus:'Lose fat with structure',url:'index.html?purchased=shred&adminTest=1'},
    strength:{name:'Strength Program',focus:'Build strength and power',url:'index.html?purchased=strength&adminTest=1'},
    bundle:{name:'Complete Bundle',focus:'All training tools + meal AI',url:'index.html?purchased=bundle&adminTest=1'},
    mealplan:{name:'Meal Plan AI',focus:'Meal guidance and 7-day plan',url:'recommended.html?purchased=mealplan&adminTest=1#meal-plan-ai'}
  };
  const ALL=Object.keys(PRODUCTS);
  const $=(id)=>document.getElementById(id);
  const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const page=()=>((location.pathname.split('/').pop()||'index.html').toLowerCase());
  const esc=(v)=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const read=(key, fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback));}catch{return fallback;}};
  const write=(key, val)=>localStorage.setItem(key, JSON.stringify(val));
  const gumroadConfig=()=>window.FITBRAND_GUMROAD_CONFIG||{};
  const price=()=>gumroadConfig().priceLabel || '$4.99';
  const gumroadUrl=()=>String(gumroadConfig().starterAccessUrl||'').trim();
  const gumroadReady=()=>/^https:\/\//i.test(gumroadUrl()) && !/PASTE_|YOUR_|example|gumroad\.com\/?$/i.test(gumroadUrl());

  function toast(title,msg,type='info'){
    let box=$('fbV47Toast');
    if(!box){box=document.createElement('div');box.id='fbV47Toast';box.className='fb-v47-toast';document.body.appendChild(box);}
    box.className='fb-v47-toast show '+type;
    box.innerHTML='<strong>'+esc(title)+'</strong><span>'+esc(msg)+'</span>';
    clearTimeout(box._t); box._t=setTimeout(()=>box.classList.remove('show'),4200);
  }
  window.fitbrandToast=window.fitbrandShowToast=toast;

  function currentUser(){return read(USER_KEY,null) || read(SESSION_USER_KEY,null);}
  function isFakeAdminUser(u=currentUser()){return !!(u && u.isAdminTest === true && /admin-test@fitbrand\.local/i.test(String(u.email||'')));}
  function testActive(){return localStorage.getItem(ADMIN_FLAG)==='true' || LEGACY_KEYS.some(k=>localStorage.getItem(k)==='true');}
  function savePurchases(list){write(PURCHASES_KEY,[...new Set((list||[]).filter(Boolean))]);}
  function purchases(){return read(PURCHASES_KEY,[]);}
  function makeFakeAdminUser(){
    if(!currentUser()){
      write(USER_KEY,{name:'Admin TEST',email:'admin-test@fitbrand.local',isAdminTest:true,createdAt:new Date().toISOString()});
    }
  }
  function grantTestAccess(){
    localStorage.setItem(ADMIN_FLAG,'true');
    LEGACY_KEYS.forEach(k=>localStorage.removeItem(k));
    makeFakeAdminUser();
    savePurchases([...purchases(),...ALL,'starter']);
    localStorage.setItem(PACKAGE_KEY,'bundle');
    localStorage.setItem(MEAL_KEY,'true');
    addAdminBar();
    return true;
  }
  function clearTestAccess(){
    [ADMIN_FLAG,...LEGACY_KEYS,PACKAGE_KEY,MEAL_KEY].forEach(k=>localStorage.removeItem(k));
    savePurchases(purchases().filter(x=>!['starter',...ALL].includes(x)));
    if(isFakeAdminUser(read(USER_KEY,null))) localStorage.removeItem(USER_KEY);
    if(isFakeAdminUser(read(SESSION_USER_KEY,null))) sessionStorage.removeItem(SESSION_USER_KEY);
    $('fbV47AdminBar')?.remove();
  }
  window.fitbrandGrantAdminTestAccess=grantTestAccess;
  window.fitbrandClearAdminTestAccess=clearTestAccess;
  window.fitbrandHasAdminTestAccess=testActive;

  function addAdminBar(){
    if(!testActive() || page()==='admin-test-access.html' || $('fbV47AdminBar')) return;
    const bar=document.createElement('div');
    bar.id='fbV47AdminBar';
    bar.className='fb-v47-admin-bar';
    bar.innerHTML='<div><b>TEST MODE</b><span>Admin free access is active on this browser only.</span></div><button type="button">Clear TEST</button>';
    bar.querySelector('button').addEventListener('click',()=>{clearTestAccess(); toast('TEST cleared','You are now viewing the normal customer flow.','success'); setTimeout(()=>location.reload(),650);});
    document.body.appendChild(bar);
  }

  function validateAdminPassword(pass){
    // Uses the existing admin endpoint so the real password stays server-side in Vercel.
    return fetch('/api/admin-leads',{headers:{'x-fitbrand-admin-password':pass}}).then(r=>{
      if(!r.ok) throw new Error('Wrong password or admin API not ready.');
      return true;
    });
  }

  function buildAdminPage(){
    if(page()!=='admin-test-access.html') return;
    document.body.className='fb-v47-admin-body';
    document.body.innerHTML=`
      <main class="fb-v47-admin-root">
        <section id="fbV47LoginCard" class="fb-v47-admin-card">
          <a class="fb-v47-admin-back" href="index.html">← Back to site</a>
          <span class="fb-v47-admin-badge">ADMIN TEST</span>
          <h1>FitBrand Test Center</h1>
          <p>This is a separate admin-only page. You do <b>not</b> need to sign up as a customer. Enter the admin password once, then test every paid tool for free on this browser.</p>
          <label for="fbV47AdminPassword">Admin password</label>
          <input id="fbV47AdminPassword" type="password" placeholder="Enter admin password" autocomplete="current-password">
          <button id="fbV47OpenPanel" type="button" class="fb-v47-admin-primary">Open TEST center</button>
          <button id="fbV47SkipVerify" type="button" class="fb-v47-admin-secondary">Local test only</button>
          <p id="fbV47AdminMsg" class="fb-v47-admin-msg">Use “Local test only” if the admin API is not available, but keep this URL private.</p>
        </section>
        <section id="fbV47Panel" class="fb-v47-admin-panel" hidden>
          <div class="fb-v47-panel-head">
            <div><span class="fb-v47-admin-badge">TEST</span><h1>Admin free testing</h1><p>Unlock all paid programs locally, then open each tool directly. Customers cannot access this flow.</p></div>
            <a href="index.html">Home</a>
          </div>
          <div class="fb-v47-status-card" id="fbV47Status">Status: ${testActive()?'TEST access active':'normal customer mode'}</div>
          <div class="fb-v47-admin-actions">
            <button id="fbV47UnlockAll" type="button">Unlock all TEST access</button>
            <button id="fbV47ClearAll" type="button">Clear TEST access</button>
          </div>
          <div class="fb-v47-test-grid">
            ${Object.entries(PRODUCTS).map(([k,p])=>`<article><span>TEST</span><h3>${esc(p.name)}</h3><p>${esc(p.focus)}</p><button type="button" data-v47-test="${esc(k)}">Test</button></article>`).join('')}
            <article><span>CUSTOMER</span><h3>Purchase page</h3><p>See the public Gumroad checkout page.</p><a href="purchase-access.html?product=starter">Open</a></article>
            <article><span>ACCESS</span><h3>My Products</h3><p>Check access cards after TEST unlock.</p><a href="products-access.html">Open</a></article>
          </div>
          <p class="fb-v47-admin-note"><b>Important:</b> TEST mode creates a fake local user named “Admin TEST” if you are not logged in. Press Clear TEST access before checking the normal customer flow.</p>
        </section>
      </main>`;
    const login=$('fbV47LoginCard'), panel=$('fbV47Panel'), msg=$('fbV47AdminMsg');
    const openPanel=()=>{login.hidden=true;panel.hidden=false;grantTestAccess(); refreshStatus();};
    const refreshStatus=()=>{$('fbV47Status').textContent='Status: '+(testActive()?'TEST access active — customer sign up not required':'normal customer mode');};
    if(sessionStorage.getItem(ADMIN_SESSION)==='true') openPanel();
    $('fbV47OpenPanel')?.addEventListener('click',async()=>{
      const pass=($('fbV47AdminPassword')?.value||'').trim();
      if(!pass){msg.textContent='Enter your admin password or use Local test only.'; return;}
      msg.textContent='Checking password...';
      try{await validateAdminPassword(pass); sessionStorage.setItem(ADMIN_SESSION,'true'); openPanel();}
      catch(e){msg.textContent=e.message || 'Could not verify password.';}
    });
    $('fbV47SkipVerify')?.addEventListener('click',()=>{sessionStorage.setItem(ADMIN_SESSION,'true'); openPanel();});
    $('fbV47UnlockAll')?.addEventListener('click',()=>{grantTestAccess(); refreshStatus(); toast('TEST access active','All paid tools are unlocked on this browser.','success');});
    $('fbV47ClearAll')?.addEventListener('click',()=>{clearTestAccess(); refreshStatus(); toast('TEST cleared','Normal customer flow is active again.','success');});
    $$('[data-v47-test]').forEach(btn=>btn.addEventListener('click',()=>{
      const key=btn.getAttribute('data-v47-test');
      grantTestAccess();
      sessionStorage.setItem(ADMIN_SESSION,'true');
      location.href=PRODUCTS[key]?.url || 'products-access.html';
    }));
  }

  function normalizeNavigation(){
    $$('.nav nav a, header.nav nav a').forEach(a=>{
      a.classList.remove('fb-v45-primary-cta','fb-v44-buy-button','fb-v43-buy-btn','btn-dark','btn-silver','fb-v46-buy-normalized');
      a.removeAttribute('style');
      const txt=(a.textContent||'').trim().toLowerCase();
      if(txt==='home') a.href='index.html';
      if(txt==='programs') a.href='programs.html';
      if(txt==='early access') a.href='early-access.html';
      if(txt==='recommended products') a.href='recommended.html';
      if(txt==='about us') a.href='about.html';
      if(txt==='policies') a.href='policies.html';
    });
  }

  function normalizeProgramCards(){
    if(page()!=='programs.html') return;
    $$('.program-row, .bundle-upgrade-card').forEach(card=>{
      const text=(card.textContent||'').toLowerCase();
      let product='starter';
      if(text.includes('shred')) product='shred';
      else if(text.includes('strength')) product='strength';
      else if(text.includes('meal')) product='mealplan';
      else if(text.includes('bundle')||text.includes('complete')) product='bundle';
      else if(text.includes('aesthetic')) product='aesthetic';
      const priceEl=card.querySelector('.price');
      if(priceEl){
        priceEl.classList.add('fb-v47-price-box');
        priceEl.innerHTML=`<span>Launch price</span><strong>${esc(price())}</strong><em>one-time</em><small>No subscription • Secure Gumroad checkout</small>`;
      }
      const actions=card.querySelector('.program-cart-actions, .bundle-actions');
      if(actions){
        actions.classList.add('fb-v47-card-actions');
        actions.innerHTML=`<a class="fb-v47-buy-btn" href="purchase-access.html?product=${encodeURIComponent(product)}">Buy — ${esc(price())}</a><a class="fb-v47-info-btn" href="purchase-access.html?product=${encodeURIComponent(product)}#what-you-get">See what you get</a>`;
      }
    });
  }

  function fixPublicButtons(){
    if(page()==='admin-test-access.html') return;
    $$('a,button').forEach(el=>{
      if(el.closest('.nav') || el.closest('header') || el.closest('footer') || el.closest('#fbV47AdminBar') || el.closest('.profile-menu')) return;
      const raw=((el.getAttribute('href')||'')+' '+(el.textContent||'')+' '+(el.getAttribute('onclick')||'')).toLowerCase();
      if(/admin-test-access|early-access\.html/.test(raw) && /buy|purchase|checkout|starter|unlock|program|bundle/.test(raw)){
        if(el.tagName==='A') el.href='purchase-access.html?product=starter';
        else el.onclick=(e)=>{e.preventDefault(); location.href='purchase-access.html?product=starter';};
      }
      if(/buy|purchase|checkout|get access|unlock starter|starter plan/.test(raw) && /aesthetic|shred|strength|meal|bundle|starter|program/.test(raw)){
        if(el.tagName==='A' && !/product-(belt|straps|shaker)/.test(raw)){
          let p='starter';
          if(raw.includes('shred')) p='shred'; else if(raw.includes('strength')) p='strength'; else if(raw.includes('meal')) p='mealplan'; else if(raw.includes('bundle')) p='bundle'; else if(raw.includes('aesthetic')) p='aesthetic';
          el.href='purchase-access.html?product='+p;
          el.removeAttribute('target');
        }
      }
    });
  }

  function openGumroad(){
    if(gumroadReady()) window.open(new URL(gumroadUrl(), location.href).toString(),'_blank','noopener,noreferrer');
    else toast('Payment link missing','Paste your real Gumroad product link in gumroad-config.js before customers can buy.','error');
  }
  window.fitbrandOpenGumroad=openGumroad;

  function improvePurchasePage(){
    if(page()!=='purchase-access.html') return;
    const btns=$$('button, a').filter(el=>/buy|gumroad|checkout/i.test(el.textContent||''));
    btns.forEach(el=>{
      el.classList.add('fb-v47-buy-btn');
      if(el.tagName==='BUTTON') el.onclick=(e)=>{e.preventDefault(); openGumroad();};
      if(el.tagName==='A' && /gumroad|buy|checkout/i.test(el.textContent||'')) el.addEventListener('click',(e)=>{ if(!gumroadReady()){e.preventDefault();openGumroad();} });
    });
  }

  function applyTestAccessOnPages(){
    if(!testActive()) return;
    makeFakeAdminUser();
    savePurchases([...purchases(),...ALL,'starter']);
    localStorage.setItem(PACKAGE_KEY,'bundle');
    localStorage.setItem(MEAL_KEY,'true');
    addAdminBar();
    if(page()==='index.html'){
      const p=new URLSearchParams(location.search).get('purchased');
      if(p && p!=='mealplan') localStorage.setItem(PACKAGE_KEY,p);
      const tryOpen=()=>{
        const trigger=$('openGeneratorBtn');
        if(trigger) trigger.classList.add('show');
        if(new URLSearchParams(location.search).get('adminTest')==='1' && typeof window.openGeneratorModal==='function') window.openGeneratorModal();
      };
      setTimeout(tryOpen,500); setTimeout(tryOpen,1200); setTimeout(tryOpen,2200);
    }
    if(page()==='recommended.html'){
      const unlock=()=>{
        const box=$('meal-plan-ai'); if(box) box.classList.add('unlocked');
        const gen=$('mealGenerator'); if(gen) gen.classList.add('show');
        if(new URLSearchParams(location.search).get('adminTest')==='1') box?.scrollIntoView({behavior:'smooth',block:'start'});
      };
      setTimeout(unlock,300); setTimeout(unlock,900); setTimeout(unlock,1800);
    }
    if(page()==='products-access.html'){
      const patch=()=>$$('.access-card').forEach(card=>{
        card.classList.add('owned');
        const span=card.querySelector('span'); if(span) span.textContent='Unlocked';
        const p=card.querySelector('p'); if(p) p.textContent='TEST access unlocked on this browser.';
        const a=card.querySelector('a'); if(!a) return;
        const t=(card.textContent||'').toLowerCase();
        a.textContent='Open TEST'; a.className='btn-dark fb-v47-buy-btn';
        if(t.includes('meal')) a.href='recommended.html?purchased=mealplan&adminTest=1#meal-plan-ai';
        else if(t.includes('shred')) a.href='index.html?purchased=shred&adminTest=1';
        else if(t.includes('strength')) a.href='index.html?purchased=strength&adminTest=1';
        else if(t.includes('bundle')) a.href='index.html?purchased=bundle&adminTest=1';
        else a.href='index.html?purchased=aesthetic&adminTest=1';
      });
      setTimeout(patch,400); setTimeout(patch,1200); setTimeout(patch,2200);
    }
  }

  function boot(){
    buildAdminPage();
    normalizeNavigation();
    normalizeProgramCards();
    fixPublicButtons();
    improvePurchasePage();
    applyTestAccessOnPages();
    [300,900,1800,3000].forEach(t=>setTimeout(()=>{normalizeNavigation();normalizeProgramCards();fixPublicButtons();applyTestAccessOnPages();},t));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
