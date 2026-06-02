/* FitBrand global system - v13 final repair */
(function(){
  'use strict';

  const USER_KEY = 'fitbrandUser';
  const SESSION_KEY = 'fitbrandSessionUser';
  const CART_KEY = 'fitbrandCart';
  const PURCHASES_KEY = 'fitbrandPurchases';
  const ORDERS_KEY = 'fitbrandOrders';
  const PROGRAM_KEY = 'fitbrandPurchasedPackage';
  const MEAL_UNLOCK_KEY = 'fitbrandMealPlanUnlocked';
  const WELCOME_KEY = 'fitbrandWelcomeChoiceSeenV13';

  const PRODUCTS = {
    aesthetic:{name:'Aesthetic Program',price:9.99,type:'digital',buy:'purchase-access.html?product=aesthetic',open:'index.html?purchased=aesthetic'},
    shred:{name:'Shred Program',price:9.99,type:'digital',buy:'purchase-access.html?product=shred',open:'index.html?purchased=shred'},
    strength:{name:'Strength Program',price:9.99,type:'digital',buy:'purchase-access.html?product=strength',open:'index.html?purchased=strength'},
    bundle:{name:'Complete Bundle + Meal Plan AI',price:24.99,type:'digital',buy:'purchase-access.html?product=bundle',open:'index.html?purchased=bundle'},
    mealplan:{name:'Meal Plan Guide AI',price:7.99,type:'digital',buy:'purchase-access.html?product=mealplan',open:'recommended.html?purchased=mealplan#meal-plan-ai'},
    belt:{name:'Lifting Belt',price:24.99,type:'physical',buy:'checkout.html?product=belt',open:'product-belt.html'},
    straps:{name:'Lifting Straps',price:12.99,type:'physical',buy:'checkout.html?product=straps',open:'product-straps.html'}
  };
  const DIGITAL = ['aesthetic','shred','strength','bundle','mealplan'];
  const PROGRAMS = ['aesthetic','shred','strength'];
  const VALID = Object.keys(PRODUCTS);

  const PLAN_LIBRARY = {
    aesthetic:{
      gym:[['Day 1 — Chest & Shoulders',['Bench Press — 4x6-8','Incline DB Press — 3x8-10','Cable Fly — 3x12-15','Lateral Raise — 4x12-15','Triceps Pushdown — 3x10-12']],['Day 2 — Back & Biceps',['Lat Pulldown — 4x8-10','Barbell Row — 4x8-10','Seated Cable Row — 3x10-12','Rear Delt Fly — 3x12-15','DB Curl — 3x10-12']],['Day 3 — Legs',['Squat — 4x6-8','Leg Press — 3x10-12','Romanian Deadlift — 3x8-10','Leg Curl — 3x12-15','Calf Raise — 4x12-15']],['Day 4 — Upper Aesthetic',['Incline Press — 4x8','Chest Supported Row — 4x10','Machine Shoulder Press — 3x10','Cable Lateral Raise — 4x15','Arms Superset — 3x12']],['Day 5 — Pump & Core',['Machine Chest Press — 3x12','Cable Row — 3x12','Leg Extension — 3x15','Hanging Leg Raise — 3x12','Plank — 3x45 sec']],['Day 6 — Weak Points',['Upper chest — 4 sets','Back width — 4 sets','Side delts — 4 sets','Arms — 4 sets','Core — 3 sets']]],
      home:[['Day 1 — Push',['Push Ups — 4xAMRAP','Feet Elevated Push Ups — 3x10-15','Band Fly — 3x15','Pike Push Ups — 4x8-12','Bench Dips — 3x12']],['Day 2 — Pull',['One Arm DB Row — 4x10','Band Pulldown — 4x12','Band Row — 3x15','Rear Delt Raise — 3x15','DB Curl — 3x12']],['Day 3 — Legs',['Goblet Squat — 4x12','Bulgarian Split Squat — 3x10','Single Leg RDL — 3x10','Glute Bridge — 3x15','Calf Raise — 4x15']],['Day 4 — Upper Aesthetic',['Push Ups — 4 sets','DB Row — 4 sets','Lateral Raise — 4x15','Band Pull Apart — 3x20','Arms Superset — 3x12']],['Day 5 — Pump & Core',['Full body circuit — 4 rounds','Mountain Climbers — 3x30 sec','Plank — 3x45 sec','Leg Raises — 3x12']],['Day 6 — Weak Points',['Shoulders — 4 sets','Back — 4 sets','Arms — 4 sets','Core — 3 sets']]]
    },
    shred:{
      gym:[['Day 1 — Full Body Strength',['Squat — 4x6-8','Bench Press — 4x6-8','Row — 4x8-10','Lateral Raise — 3x15','Incline Walk — 20 min']],['Day 2 — Conditioning',['Leg Press — 3x12','Lat Pulldown — 3x12','DB Press — 3x12','Bike Intervals — 10 rounds','Core Circuit — 3 rounds']],['Day 3 — Lower + Cardio',['Romanian Deadlift — 4x8','Bulgarian Split Squat — 3x10','Leg Curl — 3x12','Calf Raise — 4x15','Incline Walk — 25 min']],['Day 4 — Upper + HIIT',['Incline Press — 3x10','Cable Row — 3x10','Shoulder Press — 3x10','Curls + Triceps — 3x12','Bike Intervals — 12 min']],['Day 5 — Fat Loss Circuit',['Goblet Squat — 4x12','Push Ups — 4xAMRAP','Cable Row — 4x12','Walking Lunges — 3x20','Treadmill — 20 min']],['Day 6 — Active Recovery',['Steps goal — 8k-12k','Mobility — 15 min','Core — 10 min','Stretch — 10 min']]],
      home:[['Day 1 — Full Body',['Goblet Squat — 4x12','Push Ups — 4xAMRAP','DB Row — 4x12','Burpees — 3x10','Fast Walk — 25 min']],['Day 2 — Conditioning',['Jump Squats — 4x12','Mountain Climbers — 4x30 sec','Band Row — 4x15','Plank — 3x45 sec','Steps — 8k-12k']],['Day 3 — Lower Burn',['Bulgarian Split Squat — 4x10','Glute Bridge — 4x15','Single Leg RDL — 3x10','Calf Raise — 4x20','Walk — 30 min']],['Day 4 — Upper Burn',['Push Ups — 4 sets','Pike Push Ups — 3x10','Band Row — 4x15','DB Curl — 3x12','HIIT — 10 min']],['Day 5 — Fat Loss Circuit',['Squat — 20 reps','Push Ups — AMRAP','Rows — 15 reps','Lunges — 20 reps','Repeat 4 rounds']],['Day 6 — Active Recovery',['Walk — 40 min','Mobility — 15 min','Core — 10 min']]]
    },
    strength:{
      gym:[['Day 1 — Squat Focus',['Back Squat — 5x3-5','Paused Squat — 3x5','Leg Press — 3x8','Hamstring Curl — 3x10','Core — 3 sets']],['Day 2 — Bench Focus',['Bench Press — 5x3-5','Incline DB Press — 3x8','Barbell Row — 4x8','Tricep Dips — 3x8','Face Pull — 3x15']],['Day 3 — Deadlift Focus',['Deadlift — 5x3','Romanian Deadlift — 3x6-8','Lat Pulldown — 4x8','Back Extension — 3x10','Farmer Carry — 4 rounds']],['Day 4 — Overhead Focus',['Overhead Press — 5x3-5','Close Grip Bench — 3x6','Pull Ups — 4xAMRAP','Lateral Raise — 3x15','Core — 3 sets']],['Day 5 — Volume Strength',['Front Squat — 4x6','Paused Bench — 4x6','Row — 4x8','Hip Thrust — 3x8','Arms — 3x10']],['Day 6 — Recovery Strength',['Technique work — 30 min','Mobility — 15 min','Light cardio — 20 min']]],
      home:[['Day 1 — Lower Strength',['Goblet Squat — 5x8','Bulgarian Split Squat — 4x8','Single Leg RDL — 4x8','Wall Sit — 3x45 sec','Core — 3 sets']],['Day 2 — Push Strength',['Weighted Push Ups — 5x6-10','Pike Push Ups — 4x8','Slow Push Ups — 3x8','Bench Dips — 3x10','Plank — 3 sets']],['Day 3 — Pull Strength',['Heavy DB Row — 5x8','Band Row — 4x12','Towel Row — 4xAMRAP','DB Curl — 4x10','Farmer Hold — 4 rounds']],['Day 4 — Full Body Strength',['Goblet Squat — 4x8','Push Ups — 4xAMRAP','DB Row — 4x8','Split Squat — 3x10','Core — 3 sets']],['Day 5 — Volume Strength',['Tempo Squat — 4x10','Tempo Push Up — 4x10','Tempo Row — 4x10','Glute Bridge — 3x15','Carries — 4 rounds']],['Day 6 — Recovery Strength',['Mobility — 20 min','Walk — 30 min','Technique work — 15 min']]]
    }
  };

  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const parse = (raw, fallback) => { try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
  const money = (n) => '€' + Number(n || 0).toFixed(2);
  const valid = (key) => VALID.includes(key);
  const escapeHtml = (s) => String(s ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  function getPersistentUser(){ return parse(localStorage.getItem(USER_KEY), null); }
  function getSessionUser(){ return parse(sessionStorage.getItem(SESSION_KEY), null); }
  function getUser(){ return getPersistentUser() || getSessionUser(); }
  function getCart(){ return parse(localStorage.getItem(CART_KEY), []).filter(valid); }
  function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify((cart || []).filter(valid))); }
  function getOrders(){ return parse(localStorage.getItem(ORDERS_KEY), []); }
  function saveOrders(orders){ localStorage.setItem(ORDERS_KEY, JSON.stringify((orders || []).slice(0,30))); }

  function getPurchasesRaw(){
    const arr = parse(localStorage.getItem(PURCHASES_KEY), []).filter(valid);
    const program = localStorage.getItem(PROGRAM_KEY);
    if(valid(program) && !arr.includes(program)) arr.push(program);
    if(localStorage.getItem(MEAL_UNLOCK_KEY) === 'true' && !arr.includes('mealplan')) arr.push('mealplan');
    if(arr.includes('bundle') && !arr.includes('mealplan')) arr.push('mealplan');
    return [...new Set(arr)];
  }
  function getPurchases(){ return getUser() ? getPurchasesRaw() : []; }
  function savePurchases(items){ localStorage.setItem(PURCHASES_KEY, JSON.stringify([...new Set((items || []).filter(valid))])); }
  function addPurchase(key){
    if(!valid(key)) return;
    const purchases = getPurchasesRaw();
    if(!purchases.includes(key)) purchases.push(key);
    if(key === 'bundle' && !purchases.includes('mealplan')) purchases.push('mealplan');
    savePurchases(purchases);
    if(PROGRAMS.includes(key) || key === 'bundle') localStorage.setItem(PROGRAM_KEY, key);
    if(key === 'mealplan' || key === 'bundle') localStorage.setItem(MEAL_UNLOCK_KEY, 'true');
  }

  function getInitials(user){
    if(!user) return '?';
    const base = (user.name || user.email || '').trim();
    if(!base) return '?';
    const parts = base.split(/\s+/).filter(Boolean);
    if(parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    const beforeAt = base.split('@')[0].replace(/[._-]+/g,' ').trim().split(/\s+/).filter(Boolean);
    if(beforeAt.length >= 2) return (beforeAt[0][0] + beforeAt[beforeAt.length - 1][0]).toUpperCase();
    return base.slice(0,2).toUpperCase();
  }
  function displayNameFromEmail(email){ return String(email||'').split('@')[0].replace(/[._-]+/g,' ').replace(/\b\w/g, c => c.toUpperCase()); }
  function validEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'').trim()); }

  function saveFitBrandUser(data, remember){
    const prev = getUser() || {};
    const merged = Object.assign({}, prev, data || {});
    if(remember === false){
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(merged));
    } else {
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      sessionStorage.removeItem(SESSION_KEY);
    }
    sessionStorage.setItem(WELCOME_KEY, 'true');
    updateFitBrandProfileUI();
    prefillAllGenerators(false);
    return merged;
  }

  function logoutFitBrandUser(){
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    updateFitBrandProfileUI();
    closeProfileModal();
    $('profileMenu')?.classList.remove('show');
    // Purchases stay saved locally, but are hidden while logged out.
    if(location.pathname.endsWith('products-access.html') || location.pathname.endsWith('orders.html')) renderAccountPages();
    showMiniNotice('Logged out');
  }

  function ensureProfileUI(){
    if(!$('profileMenu')){
      const nav = document.querySelector('.nav');
      if(nav){
        let actions = nav.querySelector('.nav-actions');
        const cart = nav.querySelector('.cart-icon-btn');
        if(!actions){
          actions = document.createElement('div'); actions.className = 'nav-actions'; nav.appendChild(actions);
          if(cart) actions.appendChild(cart);
        }
        if(!actions.querySelector('.profile-icon-btn')){
          actions.insertAdjacentHTML('beforeend', `
            <button class="profile-icon-btn" onclick="toggleProfileMenu()" aria-label="Profile"><span id="profileInitial">?</span></button>
            <div id="profileMenu" class="profile-menu">
              <div class="profile-menu-head"><div class="profile-avatar"><span id="profileMenuInitial">?</span></div><div class="profile-menu-text"><strong id="profileMenuName">Guest</strong><br><span id="profileMenuEmail">Not logged in</span></div></div>
              <button onclick="openProfileModal('profile')" data-auth-only="1">View profile</button>
              <a class="profile-menu-link" href="profile.html" data-auth-only="1">Edit profile information</a>
              <a class="profile-menu-link" href="products-access.html" data-auth-only="1">My products / access</a>
              <a class="profile-menu-link" href="orders.html" data-auth-only="1">My orders</a>
              <button id="profileLoginBtn" onclick="openProfileModal('login')">Sign in/up</button>
              <button id="profileLogoutBtn" onclick="logoutFitBrandUser()" style="display:none;">Log out</button>
            </div>`);
        }
      }
    }
    if(!$('profileModal')){
      document.body.insertAdjacentHTML('beforeend', `
        <div id="profileModal" class="profile-modal-overlay" onclick="closeProfileModal()">
          <div class="profile-modal" onclick="event.stopPropagation()">
            <button class="profile-modal-close" onclick="closeProfileModal()">×</button>
            <div class="profile-modal-head"><div class="profile-avatar large"><span id="profileModalInitial">?</span></div><h2 id="profileModalTitle">FitBrand Profile</h2><p id="profileModalSubtitle">Sign in or continue as guest.</p></div>
            <div id="profileView" class="profile-modal-content"><div class="profile-info-box"><strong>Name</strong><span id="profileViewName">Guest</span></div><div class="profile-info-box"><strong>Email</strong><span id="profileViewEmail">Not logged in</span></div><div class="profile-info-box"><strong>Status</strong><span id="profileViewStatus">No active login</span></div></div>
            <div id="profileLogin" class="profile-modal-content" style="display:none;"><label>Email</label><input id="loginProfileEmail" type="email" placeholder="your@email.com"><label>Name</label><input id="loginProfileName" type="text" placeholder="Your name"><label class="remember-row"><input id="rememberLoginCheck" type="checkbox" checked> <span>Remember my login</span></label><button class="btn-dark" onclick="loginFitBrandUser()">Sign in/up</button><p class="profile-small-note">We send a secure login link to your email. No password needed.</p></div>
          </div>
        </div>`);
    }
  }

  function updateFitBrandProfileUI(){
    ensureProfileUI();
    const user = getUser();
    const initials = getInitials(user);
    const name = user?.name || 'Guest';
    const email = user?.email || 'Not logged in';
    ['profileInitial','profileMenuInitial','profileModalInitial'].forEach(id => { if($(id)) $(id).textContent = initials; });
    ['profileMenuName','profileViewName'].forEach(id => { if($(id)) $(id).textContent = name; });
    ['profileMenuEmail','profileViewEmail'].forEach(id => { if($(id)) $(id).textContent = email; });
    if($('profileViewStatus')) $('profileViewStatus').textContent = user ? 'Logged in with FitBrand' : 'Not logged in';
    const loginBtn = $('profileLoginBtn'), logoutBtn = $('profileLogoutBtn');
    if(loginBtn) loginBtn.textContent = 'Sign in/up';
    if(loginBtn) loginBtn.style.display = user ? 'none' : 'block';
    if(logoutBtn) logoutBtn.style.display = user ? 'block' : 'none';
    $$('[data-auth-only]').forEach(el => { el.style.display = user ? 'block' : 'none'; });
    document.body.classList.toggle('fb-logged-in', !!user);
  }

  function toggleProfileMenu(){ ensureProfileUI(); $('profileMenu')?.classList.toggle('show'); }
  function openProfileModal(mode){
    ensureProfileUI(); $('profileMenu')?.classList.remove('show');
    const user = getUser();
    const view = $('profileView'), login = $('profileLogin'), modal = $('profileModal');
    if(!modal) return;
    if(mode === 'profile' && user){
      if($('profileModalTitle')) $('profileModalTitle').textContent = 'Your profile';
      if($('profileModalSubtitle')) $('profileModalSubtitle').textContent = 'Your saved FitBrand account on this device.';
      if(view) view.style.display = 'block'; if(login) login.style.display = 'none';
    } else {
      if($('profileModalTitle')) $('profileModalTitle').textContent = 'Sign in/up';
      if($('profileModalSubtitle')) $('profileModalSubtitle').textContent = 'Use your email so orders and access can be connected to your profile.';
      if(view) view.style.display = 'none'; if(login) login.style.display = 'block';
      if($('loginProfileEmail') && user?.email) $('loginProfileEmail').value = user.email;
      if($('loginProfileName') && user?.name) $('loginProfileName').value = user.name;
    }
    updateFitBrandProfileUI();
    modal.classList.add('show');
  }
  function closeProfileModal(){ $('profileModal')?.classList.remove('show'); }
  function loginFitBrandUser(){
    const email = ($('loginProfileEmail')?.value || '').trim();
    const name = ($('loginProfileName')?.value || '').trim() || displayNameFromEmail(email);
    const remember = $('rememberLoginCheck') ? $('rememberLoginCheck').checked : true;
    if(!validEmail(email)){ alert('Please enter a valid email.'); return; }
    saveFitBrandUser({name,email}, remember);
    closeProfileModal();
    renderAccountPages();
    showMiniNotice('Signed in');
  }

  function showWelcomeChoice(){
    if(sessionStorage.getItem(WELCOME_KEY) === 'true' || getUser()) return;
    if(!['/','/index.html'].some(x => location.pathname.endsWith(x)) && !location.pathname.endsWith('recommended.html')) return;
    sessionStorage.setItem(WELCOME_KEY, 'true');
    const overlay = document.createElement('div');
    overlay.className = 'fb-welcome-overlay';
    overlay.innerHTML = `<div class="fb-welcome-card"><div class="fb-logo-mark">FB</div><h2>Welcome to FitBrand</h2><p>Sign in to save your orders, profile information and product access. You can also continue as guest.</p><div class="fb-welcome-actions"><button class="btn-dark" id="welcomeLoginBtn">Sign in/up</button><button class="btn-outline" id="welcomeGuestBtn">Continue as guest</button></div></div>`;
    document.body.appendChild(overlay);
    $('welcomeLoginBtn').onclick = () => { overlay.remove(); openProfileModal('login'); };
    $('welcomeGuestBtn').onclick = () => overlay.remove();
  }

  function updateCartCount(){
    const cart = getCart();
    $$('#cart-count,#cart-count-btn').forEach(el => { el.textContent = cart.length; el.style.display = cart.length ? 'inline-flex' : 'none'; });
    renderCartDrawer();
  }
  function addToCart(key){ if(!valid(key)) return; const cart = getCart(); cart.push(key); saveCart(cart); updateCartCount(); showMiniCartPopup(); }
  function removeDrawerItem(index){ const cart = getCart(); cart.splice(index,1); saveCart(cart); updateCartCount(); }
  function renderCartDrawer(){
    const drawerItems = $('drawer-items'), totalEl = $('drawer-total'); if(!drawerItems || !totalEl) return;
    const cart = getCart();
    if(!cart.length){ drawerItems.innerHTML = '<p>Your cart is empty.</p>'; totalEl.textContent = '€0.00'; return; }
    let total = 0;
    drawerItems.innerHTML = cart.map((key,i) => { const p = PRODUCTS[key]; total += p.price; return `<div class="drawer-item"><div><strong>${escapeHtml(p.name)}</strong><span>FitBrand product</span></div><div><strong>${money(p.price)}</strong><br><button class="remove-item-btn" onclick="removeDrawerItem(${i})">Remove</button></div></div>`; }).join('');
    totalEl.textContent = money(total);
  }
  function openCartDrawer(){ $('cart-drawer')?.classList.add('show'); $('drawer-overlay')?.classList.add('show'); renderCartDrawer(); }
  function closeCartDrawer(){ $('cart-drawer')?.classList.remove('show'); $('drawer-overlay')?.classList.remove('show'); }
  function applyDrawerDiscount(){ const msg = $('drawer-discount-message'); if(msg) msg.textContent = (($('drawer-discount')?.value || '').trim().toUpperCase() === 'FIT10') ? 'Discount applied: 10% off.' : 'Invalid code. Try FIT10.'; }
  function showMiniCartPopup(){ const p = $('mini-cart-popup'); if(!p) return; p.classList.add('show'); setTimeout(() => p.classList.remove('show'), 2500); }
  function showMiniNotice(text){
    let n = $('fb-mini-notice');
    if(!n){ n = document.createElement('div'); n.id = 'fb-mini-notice'; n.className = 'fb-mini-notice'; document.body.appendChild(n); }
    n.textContent = text; n.classList.add('show'); setTimeout(() => n.classList.remove('show'), 1800);
  }

  function itemsForCheckout(){
    const params = new URLSearchParams(location.search);
    if(params.get('cart') === 'true' && getCart().length) return getCart();
    const key = params.get('product') || 'bundle';
    return [valid(key) ? key : 'bundle'];
  }
  function checkoutLink(){ const key = (new URLSearchParams(location.search).get('product') || 'bundle'); return 'confirmation.html?product=' + encodeURIComponent(valid(key) ? key : 'bundle'); }
  function setupCheckout(){
    if(!$('stripe-link')) return;
    const emailInput = $('checkout-email'), policy = $('accept-policies'), pay = $('stripe-link');
    function update(){
      const okEmail = validEmail(emailInput?.value); const ok = okEmail && (!policy || policy.checked);
      pay.classList.toggle('btn-disabled', !ok); pay.href = ok ? checkoutLink() : '#';
      if($('checkout-email-message')) $('checkout-email-message').textContent = okEmail ? 'Email ready. Your account will be saved with this email.' : 'Enter your email before payment.';
    }
    if(emailInput){ const u = getUser(); if(u?.email && !emailInput.value) emailInput.value = u.email; emailInput.addEventListener('input', update); }
    if(policy) policy.addEventListener('change', update);
    pay.addEventListener('click', function(e){
      const email = (emailInput?.value || '').trim();
      if(!validEmail(email) || (policy && !policy.checked)){ e.preventDefault(); alert('Please enter your email and accept the policies first.'); return; }
      const u = getUser(); saveFitBrandUser({email, name:u?.name || displayNameFromEmail(email)}, true);
      const items = itemsForCheckout(); sessionStorage.setItem('fitbrandPendingCheckout', JSON.stringify(items));
      if(pay.href.endsWith('#')){ e.preventDefault(); location.href = checkoutLink(); }
    });
    update();
  }
  function processConfirmation(){
    if(!location.pathname.endsWith('confirmation.html')) return;
    const params = new URLSearchParams(location.search);
    let product = params.get('product') || params.get('purchased');
    const pending = parse(sessionStorage.getItem('fitbrandPendingCheckout'), []);
    const items = pending.length ? pending.filter(valid) : (valid(product) ? [product] : []);
    items.forEach(addPurchase);
    if(items.length){
      const orders = getOrders();
      orders.unshift({date:new Date().toISOString(), items, status:'Confirmed'}); saveOrders(orders);
      sessionStorage.removeItem('fitbrandPendingCheckout'); localStorage.removeItem(CART_KEY); updateCartCount();
      const main = items.includes('bundle') ? 'bundle' : (items.find(x => DIGITAL.includes(x)) || items[0]);
      const btn = $('accessButton');
      if(btn){ btn.href = (main === 'mealplan') ? PRODUCTS.mealplan.open : PROGRAMS.includes(main) || main === 'bundle' ? 'index.html?purchased=' + main : 'recommended.html'; btn.textContent = DIGITAL.includes(main) ? 'Open your access' : 'Continue shopping'; }
      if($('confirmationText')) $('confirmationText').textContent = 'Your order is confirmed. Your access is saved to this device and will be visible when you are logged in.';
    }
  }

  function renderAccountPages(){
    const user = getUser();
    const locked = $('accountLocked');
    if(locked) locked.style.display = user ? 'none' : 'grid';
    const productsSection = $('products'), ordersSection = $('orders');
    if(productsSection) productsSection.style.display = user ? 'block' : 'none';
    if(ordersSection) ordersSection.style.display = user ? 'block' : 'none';
    if($('accountIntro')) $('accountIntro').textContent = user ? `Signed in as ${user.email || user.name}.` : 'Sign in to see saved access and orders on this device.';

    if($('accessGrid')){
      const owned = getPurchases();
      $('accessGrid').innerHTML = ['aesthetic','shred','strength','bundle','mealplan','belt','straps'].map(key => {
        const p = PRODUCTS[key], has = owned.includes(key);
        return `<article class="access-card ${has?'owned':''}"><div><span>${has?'Unlocked':'Locked'}</span><h3>${escapeHtml(p.name)}</h3><p>${has?'You have access on this device.':'Buy — $4.99 to unlock this product.'}</p></div><a class="${has?'btn-dark':'btn-outline'}" href="${has?p.open:p.buy}">${has?'Open':'Buy — $4.99'}</a></article>`;
      }).join('');
    }
    if($('ordersList')){
      const orders = user ? getOrders() : [];
      $('ordersList').innerHTML = orders.length ? orders.map(o => `<div class="order-card"><strong>${escapeHtml((o.items||[o.product]).map(k=>PRODUCTS[k]?.name||k).join(', '))}</strong><span>${new Date(o.date).toLocaleString()} • ${escapeHtml(o.status || 'Confirmed')}</span></div>`).join('') : '<p>No orders saved yet.</p>';
    }
  }

  function hasMealAccess(){ const p = getPurchases(); return p.includes('mealplan') || p.includes('bundle'); }
  function unlockMealIfUrl(){ const q = new URLSearchParams(location.search); if(q.get('purchased') === 'mealplan' || q.get('purchased') === 'bundle' || q.get('product') === 'mealplan'){ addPurchase(q.get('purchased') || 'mealplan'); } }
  function handleMealPreviewClick(){
    unlockMealIfUrl();
    if(!getUser()){ openProfileModal('login'); return; }
    if(hasMealAccess()){
      $('meal-plan-ai')?.classList.add('unlocked'); $('mealGenerator')?.classList.add('show'); setupMealWizard(); $('meal-plan-ai')?.scrollIntoView({behavior:'smooth',block:'start'});
    } else {
      const buy = document.querySelector('a[href="purchase-access.html?product=mealplan"]');
      buy?.scrollIntoView({behavior:'smooth',block:'center'}); if(buy){ buy.classList.add('fb-pulse'); setTimeout(()=>buy.classList.remove('fb-pulse'),1500); }
    }
  }
  function syncMealHidden(vals){ Object.entries(vals).forEach(([id,v]) => { if($(id)) $(id).value = v ?? ''; }); }
  function setupMealWizard(){
    const gen = $('mealGenerator'); if(!gen || $('fitbrandMealWizard')) return;
    const grid = gen.querySelector('.meal-grid'); if(grid) grid.style.display = 'none';
    const oldBtn = gen.querySelector('.meal-generate-btn'); if(oldBtn) oldBtn.style.display = 'none';
    const u = getUser() || {};
    const wizard = document.createElement('div'); wizard.id = 'fitbrandMealWizard'; wizard.className = 'fb-meal-wizard';
    wizard.innerHTML = `
      <div class="fb-meal-wizard-head"><div><h3>Meal Plan Builder</h3><p>Step-by-step, clean and fast.</p></div><span id="mealStepPill">1 / 6</span></div><div class="fb-meal-progress"><span id="mealProgressFill"></span></div>
      <div class="fb-meal-profile-row"><button type="button" id="mealUseProfile">Use saved profile info</button><a href="profile.html">Change information</a></div>
      <section class="fb-meal-step active" data-step="1"><h4>Choose your goal</h4><div class="fb-meal-options"><button data-field="goal" data-value="fatloss" type="button"><strong>Lose fat</strong><span>High protein and controlled calories.</span></button><button data-field="goal" data-value="muscle" type="button"><strong>Build muscle</strong><span>Fuel growth and performance.</span></button><button data-field="goal" data-value="maintenance" type="button"><strong>Maintain</strong><span>Clean eating and stable weight.</span></button></div></section>
      <section class="fb-meal-step" data-step="2"><h4>Your body details</h4><div class="fb-meal-mini-form"><input id="wizAge" type="number" placeholder="Age"><select id="wizGender"><option value="">Gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select><input id="wizWeight" type="number" placeholder="Weight kg"><input id="wizHeight" type="number" placeholder="Height cm"></div></section>
      <section class="fb-meal-step" data-step="3"><h4>Training activity</h4><div class="fb-meal-options"><button data-field="trainingDays" data-value="0" type="button"><strong>0-1 days</strong><span>Light routine</span></button><button data-field="trainingDays" data-value="3" type="button"><strong>2-3 days</strong><span>Moderate routine</span></button><button data-field="trainingDays" data-value="5" type="button"><strong>4-5 days</strong><span>Consistent training</span></button><button data-field="trainingDays" data-value="6" type="button"><strong>6+ days</strong><span>Very active</span></button></div></section>
      <section class="fb-meal-step" data-step="4"><h4>Food style</h4><div class="fb-meal-options"><button data-field="diet" data-value="normal" type="button"><strong>Balanced</strong><span>Normal flexible foods.</span></button><button data-field="diet" data-value="highprotein" type="button"><strong>High protein</strong><span>More protein focused.</span></button><button data-field="diet" data-value="budget" type="button"><strong>Budget</strong><span>Cheap and simple.</span></button><button data-field="diet" data-value="easy" type="button"><strong>Fast meals</strong><span>Low cooking time.</span></button><button data-field="diet" data-value="vegetarian" type="button"><strong>Vegetarian</strong><span>No meat.</span></button></div></section>
      <section class="fb-meal-step" data-step="5"><h4>Meals per day</h4><div class="fb-meal-options"><button data-field="meals" data-value="3" type="button"><strong>3 meals</strong><span>Simple</span></button><button data-field="meals" data-value="4" type="button"><strong>4 meals</strong><span>Balanced</span></button><button data-field="meals" data-value="5" type="button"><strong>5 meals</strong><span>Structured</span></button></div></section>
      <section class="fb-meal-step" data-step="6"><h4>Final preferences</h4><div class="fb-meal-mini-form"><select id="wizStyle"><option value="balanced">Balanced</option><option value="lowcalorie">Low calorie</option><option value="bulking">Bulking</option><option value="simple">Very simple</option></select><select id="wizTime"><option value="normal">Normal cooking</option><option value="fast">Under 15 min</option><option value="prep">Meal prep friendly</option></select><input id="wizAvoid" class="wide" placeholder="Foods to avoid / allergies"></div><button type="button" id="mealFinalGenerate" class="fb-meal-generate-final">Generate my 7-day meal plan</button></section>
      <div class="fb-meal-choice-actions"><button type="button" id="mealBackBtn">Back</button><button type="button" id="mealNextBtn">Next</button></div>`;
    gen.insertBefore(wizard, gen.firstChild);
    const state = {goal:u.goal || '', trainingDays:u.trainingDays || '', diet:'normal', meals:'4'}; let step = 1;
    function fillProfile(){ ['Age','Gender','Weight','Height'].forEach(k => { const map={Age:'age',Gender:'gender',Weight:'weight',Height:'height'}; const el=$('wiz'+k); if(el && u[map[k]]) el.value = u[map[k]]; }); if($('wizAvoid') && u.allergies) $('wizAvoid').value = u.allergies; }
    function choose(field,value){ state[field]=String(value); $$(`#fitbrandMealWizard [data-field="${field}"]`).forEach(b => b.classList.toggle('selected', b.dataset.value === String(value))); }
    function sync(){ syncMealHidden({mealGoal:state.goal, mealTrainingDays:state.trainingDays, mealDiet:state.diet, mealMeals:state.meals, mealAge:$('wizAge')?.value, mealGender:$('wizGender')?.value, mealWeight:$('wizWeight')?.value, mealHeight:$('wizHeight')?.value, mealAvoid:$('wizAvoid')?.value, mealStyle:$('wizStyle')?.value||'balanced', mealTime:$('wizTime')?.value||'normal', mealActivity:'normal', mealDifficulty:'easy'}); }
    function render(){ $$('#fitbrandMealWizard .fb-meal-step').forEach(s => s.classList.toggle('active', Number(s.dataset.step)===step)); $('mealStepPill').textContent = `${step} / 6`; $('mealProgressFill').style.width = (step/6*100)+'%'; $('mealBackBtn').style.visibility = step===1?'hidden':'visible'; $('mealNextBtn').style.display = step===6?'none':'inline-flex'; sync(); }
    wizard.addEventListener('click', e => { const btn=e.target.closest('button'); if(!btn) return; if(btn.id==='mealUseProfile'){ fillProfile(); render(); return; } if(btn.dataset.field){ choose(btn.dataset.field, btn.dataset.value); } if(btn.id==='mealBackBtn' && step>1){ step--; render(); } if(btn.id==='mealNextBtn' && step<6){ step++; render(); } if(btn.id==='mealFinalGenerate'){ sync(); generateMealPlan(); } });
    fillProfile(); if(state.goal) choose('goal',state.goal); if(state.trainingDays) choose('trainingDays',state.trainingDays); choose('diet','normal'); choose('meals','4'); render();
  }

  function estimateCalories(weight,height,age,gender,goal,trainingDays){
    let bmr = gender === 'female' ? 10*weight + 6.25*height - 5*age - 161 : 10*weight + 6.25*height - 5*age + 5;
    let activity = trainingDays >= 5 ? 1.65 : trainingDays >= 3 ? 1.50 : 1.30;
    let calories = Math.round(bmr * activity); if(goal==='fatloss') calories -= 400; if(goal==='muscle') calories += 250;
    return Math.max(1400, Math.round(calories/50)*50);
  }
  function generateMealPlan(){
    const goal=$('mealGoal')?.value, gender=$('mealGender')?.value, age=Number($('mealAge')?.value), weight=Number($('mealWeight')?.value), height=Number($('mealHeight')?.value), trainingDays=Number($('mealTrainingDays')?.value), meals=Number($('mealMeals')?.value||4), diet=$('mealDiet')?.value||'normal', avoid=$('mealAvoid')?.value||'';
    if(!goal || !gender || !age || !weight || !height || $('mealTrainingDays')?.value===''){ alert('Please complete the meal plan steps first.'); return; }
    const calories=estimateCalories(weight,height,age,gender,goal,trainingDays), protein=Math.round(weight*(goal==='fatloss'?2.1:1.8)), fat=Math.round((calories*.25)/9), carbs=Math.max(80,Math.round((calories-protein*4-fat*9)/4));
    const banks={normal:[['Breakfast',['Oats with Greek yogurt','Berries','Protein source']],['Lunch',['Chicken rice bowl','Mixed vegetables','Fruit']],['Dinner',['Lean protein','Rice or potatoes','Green vegetables']],['Snack',['Skyr/protein yogurt','Banana','Rice cakes']],['Extra Meal',['Wholegrain wrap','Turkey/chicken/tofu','Salad']]],vegetarian:[['Breakfast',['Oats','Greek yogurt','Berries']],['Lunch',['Tofu rice bowl','Beans','Vegetables']],['Dinner',['Eggs or tofu','Potatoes','Salad']],['Snack',['Skyr','Fruit','Protein shake']],['Extra Meal',['Lentil pasta','Tomato sauce','Salad']]],highprotein:[['Breakfast',['Eggs or skyr','Oats','Protein shake']],['Lunch',['Chicken bowl','Extra chicken','Vegetables']],['Dinner',['Lean beef/chicken/salmon','Rice','Cottage cheese']],['Snack',['Protein yogurt','Protein bar','Fruit']],['Extra Meal',['Tuna/chicken wrap','Salad','Water']]],budget:[['Breakfast',['Oats','Banana','Milk/yogurt']],['Lunch',['Rice','Eggs/chicken','Frozen vegetables']],['Dinner',['Potatoes','Tuna/eggs/chicken','Vegetables']],['Snack',['Yogurt','Rice cakes','Apple']],['Extra Meal',['Pasta','Eggs/tuna','Tomato sauce']]],easy:[['Breakfast',['Protein yogurt','Granola','Fruit']],['Lunch',['Ready rice','Pre-cooked chicken/tofu','Bagged salad']],['Dinner',['Wrap bowl','Lean protein','Microwave rice/potatoes']],['Snack',['Protein shake','Banana','Rice cakes']],['Extra Meal',['Cottage cheese','Toast','Fruit']]]};
    const bank=banks[diet]||banks.normal, days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const weekly=days.map((d,i)=>({day:d, meals:bank.map((_,j)=>bank[(i+j)%bank.length]).slice(0,meals)}));
    if($('mealOutputTitle')) $('mealOutputTitle').textContent='Your 7-Day FitBrand Meal Plan';
    if($('mealOutputSubtitle')) $('mealOutputSubtitle').textContent=`Built for ${goal}, ${weight}kg, ${height}cm, training ${trainingDays} days per week.`;
    if($('mealOutputPill')) $('mealOutputPill').textContent=`${meals} MEALS / ${diet.toUpperCase()}`;
    if($('macroGrid')) $('macroGrid').innerHTML=[['Calories',calories],['Protein',protein+'g'],['Carbs',carbs+'g'],['Fat',fat+'g']].map(x=>`<div class="macro-box"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');
    if($('mealDays')) $('mealDays').innerHTML=weekly[0].meals.map(m=>`<div class="meal-day-card"><h4>${m[0]}</h4><ul>${m[1].map(i=>`<li>${i}</li>`).join('')}</ul></div>`).join('');
    if($('mealWeekPlan')) $('mealWeekPlan').innerHTML=weekly.map(d=>`<div class="meal-week-day"><h4>${d.day}</h4><div class="meal-week-meals">${d.meals.map(m=>`<div class="meal-mini"><strong>${m[0]}</strong><span>${m[1].join(' • ')}</span></div>`).join('')}</div></div>`).join('');
    const notes=`Follow this for 7-14 days, then adjust calories based on progress. ${goal==='fatloss'?'If weight is not moving after 2 weeks, reduce 150-200 calories or add steps. ':''}${goal==='muscle'?'If weight is not increasing slowly, add 150-250 calories. ':''}${avoid?'Avoid these foods: '+avoid+'. ':''}This is general fitness guidance, not medical nutrition advice.`;
    if($('mealNotes')) $('mealNotes').textContent=notes;
    window.latestMealPlanText = 'FITBRAND 7-DAY MEAL PLAN\n\n' + weekly.map(d=>d.day+'\n'+d.meals.map(m=>'- '+m[0]+': '+m[1].join(', ')).join('\n')).join('\n\n') + '\n\nCalories: '+calories+' | Protein: '+protein+'g | Carbs: '+carbs+'g | Fat: '+fat+'g\n\n'+notes;
    $('mealOutput')?.classList.add('show'); $('mealOutput')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function downloadMealPlanPDF(){ printText('FitBrand Meal Plan', window.latestMealPlanText || 'Generate your meal plan first.'); }
  function resetMealPlan(){ $('mealOutput')?.classList.remove('show'); if($('mealWeekPlan')) $('mealWeekPlan').innerHTML=''; }

  function unlockedPrograms(){ const p=getPurchases(); return p.includes('bundle') ? PROGRAMS : PROGRAMS.filter(x=>p.includes(x)); }
  function openGeneratorModal(){
    if(!getUser()){ openProfileModal('login'); return; }
    const allowed = unlockedPrograms(); if(!allowed.length){ alert('This generator unlocks after purchasing a program or bundle.'); return; }
    $('fitbrandGeneratorModal')?.classList.add('show'); buildProgramTrackPanel(allowed); prefillAllGenerators(false);
  }
  function closeGeneratorModal(){ $('fitbrandGeneratorModal')?.classList.remove('show'); }
  function buildProgramTrackPanel(allowed){
    const body=document.querySelector('#fitbrandGeneratorModal .fb-modal-body'); if(!body) return; $('fbProgramTrackPanel')?.remove();
    const copy={aesthetic:['Aesthetic AI','Hypertrophy, symmetry and visual proportions.'],shred:['Shred AI','Fat loss, conditioning and muscle retention.'],strength:['Strength AI','Strength progression, main lifts and performance.']};
    const panel=document.createElement('div'); panel.id='fbProgramTrackPanel'; panel.className='fb-program-track-panel';
    panel.innerHTML=`<h3>${allowed.length>1?'Choose your unlocked AI':'Your unlocked program AI'}</h3><p>${allowed.length>1?'Bundle access lets you choose between all three program AIs.':'This generator is customized to the program you bought.'}</p><div class="fb-program-track-options">${allowed.map((k,i)=>`<button type="button" data-track="${k}" class="${i===0?'selected':''}"><strong>${copy[k][0]}</strong><span>${copy[k][1]}</span></button>`).join('')}</div>`;
    body.insertBefore(panel, body.firstChild); setTrainingTrack(allowed[0]);
    panel.addEventListener('click',e=>{ const b=e.target.closest('[data-track]'); if(!b) return; panel.querySelectorAll('button').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); setTrainingTrack(b.dataset.track); });
  }
  function setTrainingTrack(track){
    if($('modalPackage')) $('modalPackage').value=track;
    if($('modalGoal')) $('modalGoal').value = track==='shred'?'fatloss':track==='strength'?'strength':'muscle';
    const fields = {aesthetic:['Upper chest focus','Shoulder width','Arm detail','Balanced proportions'],shred:['Fat loss speed','Daily steps','Cardio level','Meal consistency'],strength:['Squat focus','Bench focus','Deadlift focus','Overall power']};
    let box=$('fbTrackSpecificOptions');
    if(!box){ box=document.createElement('div'); box.id='fbTrackSpecificOptions'; box.className='fb-track-specific-options'; const divider=document.querySelector('#fitbrandGeneratorModal .fb-divider'); divider?.insertAdjacentElement('afterend',box); }
    box.innerHTML=`<h4>${track.charAt(0).toUpperCase()+track.slice(1)} settings</h4><div>${fields[track].map((x,i)=>`<label><input type="radio" name="trackFocus" value="${escapeHtml(x)}" ${i===0?'checked':''}> ${escapeHtml(x)}</label>`).join('')}</div>`;
  }
  function generateModalPlan(){
    const allowed=unlockedPrograms(); if(!allowed.length){ alert('This generator unlocks after purchase.'); return; }
    let track=$('modalPackage')?.value || allowed[0]; if(!allowed.includes(track)) track=allowed[0];
    const u=getUser()||{}, place=$('modalPlace')?.value || u.trainingLocation || 'gym', days=Math.max(3,Math.min(6,Number($('modalDays')?.value || u.trainingDays || 4))), level=$('modalLevel')?.value || u.level || 'beginner';
    const lib=(PLAN_LIBRARY[track][place] || PLAN_LIBRARY[track].gym).slice(0,days);
    const focus=document.querySelector('input[name="trackFocus"]:checked')?.value || 'balanced progress';
    if($('modalPlanTitle')) $('modalPlanTitle').textContent=`Your ${PRODUCTS[track].name} Plan`;
    if($('modalPlanSubtitle')) $('modalPlanSubtitle').textContent=`Customized for ${place} training, ${days} days per week, ${level} level. Focus: ${focus}.`;
    if($('modalPlanPill')) $('modalPlanPill').textContent=`${days} DAYS / ${place.toUpperCase()}`;
    if($('modalPlanDays')) $('modalPlanDays').innerHTML=lib.map(d=>`<div class="fb-plan-day"><h4>${d[0]}</h4><ul>${d[1].map(x=>`<li>${x}</li>`).join('')}</ul></div>`).join('');
    $('modalPlanOutput')?.classList.add('show');
    const text=`FITBRAND ${PRODUCTS[track].name.toUpperCase()} PLAN\n\n${lib.map(d=>d[0]+'\n'+d[1].map(x=>'- '+x).join('\n')).join('\n\n')}\n\nFocus: ${focus}`;
    window.latestTrainingPlanText=text;
    addDownloadButtonsToProgramOutput(); $('modalPlanOutput')?.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function addDownloadButtonsToProgramOutput(){
    const out=$('modalPlanOutput'); if(!out || $('fbPlanDownloadRow')) return;
    out.insertAdjacentHTML('beforeend',`<div id="fbPlanDownloadRow" class="fb-plan-download-row"><button type="button" onclick="downloadTrainingPlanPDF()">Download PDF</button><button type="button" onclick="downloadTrainingPlanPNG()">Download PNG</button></div>`);
  }
  function printText(title,text){
    const w=window.open('','_blank'); if(!w) return; w.document.write(`<html><head><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;padding:40px;line-height:1.55;color:#111}h1{font-size:34px}.brand{font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#555}pre{white-space:pre-wrap;font-family:Arial,sans-serif}</style></head><body><div class="brand">FitBrand</div><h1>${escapeHtml(title)}</h1><pre>${escapeHtml(text)}</pre><script>window.print();<\/script></body></html>`); w.document.close();
  }
  function downloadTrainingPlanPDF(){ printText('Your FitBrand Training Plan', window.latestTrainingPlanText || 'Generate your plan first.'); }
  function downloadTrainingPlanPNG(){
    const text=window.latestTrainingPlanText || 'Generate your plan first.'; const canvas=document.createElement('canvas'), ctx=canvas.getContext('2d'); canvas.width=1200; canvas.height=1600; ctx.fillStyle='#0b0b0b'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#fff'; ctx.font='bold 42px Arial'; ctx.fillText('FITBRAND TRAINING PLAN',70,85); ctx.font='24px Arial'; const lines=text.split('\n'); let y=145; lines.forEach(line=>{ if(y>1540) return; ctx.fillText(line.slice(0,82),70,y); y+=34; }); const a=document.createElement('a'); a.href=canvas.toDataURL('image/png'); a.download='fitbrand-training-plan.png'; a.click();
  }

  function prefillAllGenerators(){
    const u=getUser(); if(!u) return;
    const maps={modalAge:'age',modalGender:'gender',modalWeight:'weight',modalHeight:'height',modalPlace:'trainingLocation',modalDays:'trainingDays',modalLevel:'level',mealAge:'age',mealGender:'gender',mealWeight:'weight',mealHeight:'height',mealTrainingDays:'trainingDays',mealAvoid:'allergies'};
    Object.entries(maps).forEach(([id,k])=>{ if($(id) && u[k] && !$(id).value) $(id).value=u[k]; });
  }
  function detectPurchaseUrls(){
    const q=new URLSearchParams(location.search); const p=q.get('purchased') || q.get('product'); if(valid(p)) addPurchase(p);
    if(p==='bundle') addPurchase('mealplan');
    if(PROGRAMS.includes(p) || p==='bundle') $('openGeneratorBtn')?.classList.add('show');
    if(getPurchases().some(x=>PROGRAMS.includes(x)||x==='bundle')) $('openGeneratorBtn')?.classList.add('show');
    if($('openGeneratorBtn')){ const canTrain = !!getUser() && getPurchases().some(x=>PROGRAMS.includes(x)||x==='bundle'); $('openGeneratorBtn').classList.toggle('show', canTrain); }
    if(location.pathname.endsWith('recommended.html')){ const mealBox=$('meal-plan-ai'); if(mealBox){ if(getUser() && hasMealAccess()){ mealBox.classList.add('unlocked'); setupMealWizard(); } else { mealBox.classList.remove('unlocked'); } } }
  }

  function initProfilePage(){
    const form=$('fullProfileForm'); if(!form) return;
    const u=getUser() || {};
    const map={pfName:'name',pfEmail:'email',pfPhone:'phone',pfAddress:'address',pfGender:'gender',pfAge:'age',pfWeight:'weight',pfHeight:'height',pfLevel:'level',pfTrainingLocation:'trainingLocation',pfTrainingDays:'trainingDays',pfEquipment:'equipment',pfAllergies:'allergies',pfGoal:'goal'};
    Object.entries(map).forEach(([id,k])=>{ if($(id) && u[k]) $(id).value=u[k]; });
    form.onsubmit=function(e){ e.preventDefault(); const data={}; Object.entries(map).forEach(([id,k])=>{ if($(id)) data[k]=$(id).value.trim ? $(id).value.trim() : $(id).value; }); if(!data.name || !validEmail(data.email)){ alert('Please add at least a valid name and email.'); return; } saveFitBrandUser(data,true); location.href='index.html'; };
  }
  function enhanceBundleBox(){
    const box=document.querySelector('.fitbrand-bundle-offer'); if(!box) return;
    box.classList.add('fb-bundle-super');
    if(!box.querySelector('.fb-bundle-benefits')) box.insertAdjacentHTML('beforeend',`<div class="fb-bundle-benefits"><span>All 3 programs</span><span>Meal Plan Guide AI included</span><span>Best value</span><span>Training generator access</span></div>`);
  }

  function boot(){
    ensureProfileUI(); updateFitBrandProfileUI(); updateCartCount(); setupCheckout(); processConfirmation(); renderAccountPages(); initProfilePage(); detectPurchaseUrls(); enhanceBundleBox(); prefillAllGenerators(false); showWelcomeChoice();
    $$('.cart-icon-btn').forEach(btn => { btn.onclick = function(e){ e.preventDefault(); openCartDrawer(); }; });
    document.addEventListener('click', e => { const m=$('profileMenu'), b=document.querySelector('.profile-icon-btn'); if(m && b && !m.contains(e.target) && !b.contains(e.target)) m.classList.remove('show'); });
    setTimeout(()=>{ updateFitBrandProfileUI(); renderAccountPages(); },50);
  }

  Object.assign(window,{getFitBrandUser:getUser,saveFitBrandUser,logoutFitBrandUser,updateFitBrandProfileUI,updateProfileUI:updateFitBrandProfileUI,toggleProfileMenu,openProfileModal,closeProfileModal,loginFitBrandUser,updateCartCount,addToCart,removeDrawerItem,renderCartDrawer,openCartDrawer,closeCartDrawer,applyDrawerDiscount,handleMealPreviewClick,generateMealPlan,downloadMealPlanPDF,resetMealPlan,openGeneratorModal,closeGeneratorModal,generateModalPlan,downloadTrainingPlanPDF,downloadTrainingPlanPNG});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* ===== FITBRAND v14 HOTFIX: profile state, access gate, AI polish, coming soon ===== */
(function(){
  'use strict';
  const USER='fitbrandUser', SESSION='fitbrandSessionUser', CART='fitbrandCart', PUR='fitbrandPurchases', PROG='fitbrandPurchasedPackage', MEAL='fitbrandMealPlanUnlocked';
  const PRODUCTS={aesthetic:['Aesthetic Program',9.99,'index.html?purchased=aesthetic'],shred:['Shred Program',9.99,'index.html?purchased=shred'],strength:['Strength Program',9.99,'index.html?purchased=strength'],bundle:['Complete Bundle + Meal Plan AI',24.99,'index.html?purchased=bundle'],mealplan:['Meal Plan Guide AI',7.99,'recommended.html?purchased=mealplan#meal-plan-ai'],belt:['Lifting Belt',24.99,'product-belt.html'],straps:['Lifting Straps',12.99,'product-straps.html']};
  const PROGRAMS=['aesthetic','shred','strength'], VALID=Object.keys(PRODUCTS), COMING=['belt','straps'];
  const $=id=>document.getElementById(id), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const parse=(v,f)=>{try{return v?JSON.parse(v):f}catch{return f}};
  const valid=k=>VALID.includes(k), money=n=>'€'+Number(n||0).toFixed(2), emailOk=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e||'').trim());
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  function user(){return parse(localStorage.getItem(USER),null)||parse(sessionStorage.getItem(SESSION),null)}
  function displayName(email){return String(email||'').split('@')[0].replace(/[._-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
  function initials(u){if(!u)return'?';let b=(u.name||u.email||'').trim();if(!b)return'?';let p=b.split(/\s+/).filter(Boolean);if(p.length>1)return(p[0][0]+p[p.length-1][0]).toUpperCase();let e=b.split('@')[0].replace(/[._-]+/g,' ').trim().split(/\s+/).filter(Boolean);if(e.length>1)return(e[0][0]+e[e.length-1][0]).toUpperCase();return b.slice(0,2).toUpperCase()}
  function rawPurchases(){let a=parse(localStorage.getItem(PUR),[]).filter(valid);let p=localStorage.getItem(PROG);if(valid(p)&&!a.includes(p))a.push(p);if(localStorage.getItem(MEAL)==='true'&&!a.includes('mealplan'))a.push('mealplan');if(a.includes('bundle')&&!a.includes('mealplan'))a.push('mealplan');return[...new Set(a)]}
  function purchases(){return user()?rawPurchases():[]}
  function cart(){return parse(localStorage.getItem(CART),[]).filter(k=>valid(k)&&!COMING.includes(k))}
  function saveCart(c){localStorage.setItem(CART,JSON.stringify((c||[]).filter(k=>valid(k)&&!COMING.includes(k))))}
  function normalizeProfile(){
    let nav=document.querySelector('.nav'); if(!nav)return;
    let actions=nav.querySelector('.nav-actions'), cartBtn=nav.querySelector('.cart-icon-btn');
    if(!actions){actions=document.createElement('div');actions.className='nav-actions';nav.appendChild(actions)}
    if(cartBtn&&cartBtn.parentElement!==actions)actions.prepend(cartBtn);
    let btn=actions.querySelector('.profile-icon-btn'); if(!btn){btn=document.createElement('button');btn.className='profile-icon-btn';btn.innerHTML='<span id="profileInitial">?</span>';actions.appendChild(btn)}
    btn.type='button';btn.onclick=e=>{e.preventDefault();toggleProfileMenu()};
    let menu=$('profileMenu'); if(!menu){menu=document.createElement('div');menu.id='profileMenu';menu.className='profile-menu';actions.appendChild(menu)}
    menu.innerHTML='<div class="profile-menu-head"><div class="profile-avatar"><span id="profileMenuInitial">?</span></div><div class="profile-menu-id"><strong id="profileMenuName">Guest</strong><br><span id="profileMenuEmail">Not logged in</span></div></div><button type="button" data-auth-only="1" onclick="openProfileModal(\'profile\')">View profile</button><a class="profile-menu-link" data-auth-only="1" href="profile.html">Edit profile information</a><a class="profile-menu-link" data-auth-only="1" href="products-access.html">My products / access</a><a class="profile-menu-link" data-auth-only="1" href="orders.html">My orders</a><button type="button" id="profileLoginBtn" data-guest-only="1" onclick="openProfileModal(\'login\')">Sign in/up</button><button type="button" id="profileLogoutBtn" data-auth-only="1" onclick="logoutFitBrandUser()">Log out</button>';
    if(!$('profileModal')) document.body.insertAdjacentHTML('beforeend','<div id="profileModal" class="profile-modal-overlay" onclick="closeProfileModal()"><div class="profile-modal" onclick="event.stopPropagation()"><button class="profile-modal-close" type="button" onclick="closeProfileModal()">×</button><div class="profile-modal-head"><div class="profile-avatar large"><span id="profileModalInitial">?</span></div><h2 id="profileModalTitle">Sign in/up</h2><p id="profileModalSubtitle">Use your email to save orders, product access and profile info.</p></div><div id="profileView" class="profile-modal-content" style="display:none"><div class="profile-info-box"><strong>Name</strong><span id="profileViewName">Guest</span></div><div class="profile-info-box"><strong>Email</strong><span id="profileViewEmail">Not logged in</span></div><div class="profile-info-box"><strong>Status</strong><span id="profileViewStatus">Not logged in</span></div></div><div id="profileLogin" class="profile-modal-content"><label>Email</label><input id="loginProfileEmail" type="email" placeholder="your@email.com"><label>Name</label><input id="loginProfileName" type="text" placeholder="Your full name"><label class="remember-row"><input id="rememberLoginCheck" type="checkbox" checked><span>Remember my login</span></label><button class="btn-dark" type="button" onclick="loginFitBrandUser()">Sign in/up</button><p class="profile-small-note">We send a secure login link to your email. No password needed.</p></div></div></div>');
  }
  function updateProfileUI(){normalizeProfile();let u=user();document.body.classList.toggle('fb-is-logged-in',!!u);document.body.classList.toggle('fb-is-logged-out',!u);['profileInitial','profileMenuInitial','profileModalInitial'].forEach(id=>{if($(id))$(id).textContent=initials(u)});['profileMenuName','profileViewName'].forEach(id=>{if($(id))$(id).textContent=u?.name||'Guest'});['profileMenuEmail','profileViewEmail'].forEach(id=>{if($(id))$(id).textContent=u?.email||'Not logged in'});if($('profileViewStatus'))$('profileViewStatus').textContent=u?'Logged in with FitBrand':'Not logged in';$$('[data-auth-only]').forEach(e=>e.style.display=u?'flex':'none');$$('[data-guest-only],#profileLoginBtn').forEach(e=>e.style.display=u?'none':'flex');$$('#profileLogoutBtn').forEach(e=>e.style.display=u?'flex':'none');gateAccess()}
  function toggleProfileMenu(){normalizeProfile();updateProfileUI();$('profileMenu')?.classList.toggle('show')}
  function openProfileModal(mode){normalizeProfile();$('profileMenu')?.classList.remove('show');let u=user(),m=$('profileModal'),v=$('profileView'),l=$('profileLogin');if(!m)return;if(mode==='profile'&&u){$('profileModalTitle').textContent='Your profile';$('profileModalSubtitle').textContent='Your saved FitBrand customer profile.';v.style.display='grid';l.style.display='none'}else{$('profileModalTitle').textContent='Sign in/up';$('profileModalSubtitle').textContent='Use your email so access and orders connect to your profile.';v.style.display='none';l.style.display='grid';if($('loginProfileEmail'))$('loginProfileEmail').value=u?.email||'';if($('loginProfileName'))$('loginProfileName').value=u?.name||''}updateProfileUI();m.classList.add('show')}
  function closeProfileModal(){$('profileModal')?.classList.remove('show')}
  function loginFitBrandUser(){let email=($('loginProfileEmail')?.value||'').trim(),name=($('loginProfileName')?.value||'').trim()||displayName(email),remember=$('rememberLoginCheck')?$('rememberLoginCheck').checked:true;if(!emailOk(email)){alert('Please enter a valid email.');return}let old=user()||{},u=Object.assign({},old,{name,email});if(remember){localStorage.setItem(USER,JSON.stringify(u));sessionStorage.removeItem(SESSION)}else{sessionStorage.setItem(SESSION,JSON.stringify(u));localStorage.removeItem(USER)}sessionStorage.setItem('fitbrandWelcomeChoiceSeenV13','true');closeProfileModal();updateProfileUI();prefillGenerators();if(sessionStorage.getItem('fitbrandPendingMealOpen')==='1'){sessionStorage.removeItem('fitbrandPendingMealOpen');setTimeout(()=>handleMealPreviewClick(),150)}notice('Signed in')}
  function logoutFitBrandUser(){localStorage.removeItem(USER);sessionStorage.removeItem(SESSION);$('profileMenu')?.classList.remove('show');closeProfileModal();updateProfileUI();gateAccess();notice('Logged out')}
  function gateAccess(){let u=user();if(!u){$('meal-plan-ai')?.classList.remove('unlocked');$('openGeneratorBtn')?.classList.remove('show')}else{if(purchases().some(k=>PROGRAMS.includes(k)||k==='bundle'))$('openGeneratorBtn')?.classList.add('show');if(location.pathname.endsWith('recommended.html')&&(purchases().includes('mealplan')||purchases().includes('bundle')))$('meal-plan-ai')?.classList.add('unlocked')}if($('accountLocked'))$('accountLocked').style.display=u?'none':'grid';if($('products'))$('products').style.display=u?'block':'none';if($('orders'))$('orders').style.display=u?'block':'none'}
  function notice(t){let n=$('fb-mini-notice');if(!n){n=document.createElement('div');n.id='fb-mini-notice';n.className='fb-mini-notice';document.body.appendChild(n)}n.textContent=t;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),1800)}
  function addToCart(k){if(COMING.includes(k)){notice('Coming soon');return}if(!valid(k))return;let c=cart();c.push(k);saveCart(c);updateCartCount();let p=$('mini-cart-popup');if(p){p.classList.add('show');setTimeout(()=>p.classList.remove('show'),2600)}}
  function updateCartCount(){let c=cart();$$('#cart-count,#cart-count-btn').forEach(e=>{e.textContent=c.length;e.style.display=c.length?'inline-flex':'none'});renderDrawer()}
  function renderDrawer(){let w=$('drawer-items'),t=$('drawer-total');if(!w||!t)return;let c=cart();if(!c.length){w.innerHTML='<p>Your cart is empty.</p>';t.textContent='€0.00';return}let sum=0;w.innerHTML=c.map((k,i)=>{let p=PRODUCTS[k];sum+=p[1];return '<div class="drawer-item"><div><strong>'+esc(p[0])+'</strong><span>FitBrand product</span></div><div><strong>'+money(p[1])+'</strong><br><button class="remove-item-btn" onclick="removeDrawerItem('+i+')">Remove</button></div></div>'}).join('');t.textContent=money(sum)}
  function removeDrawerItem(i){let c=cart();c.splice(i,1);saveCart(c);updateCartCount()}
  function openCartDrawer(){$('cart-drawer')?.classList.add('show');$('drawer-overlay')?.classList.add('show');renderDrawer()}
  function closeCartDrawer(){$('cart-drawer')?.classList.remove('show');$('drawer-overlay')?.classList.remove('show')}
  function prefillGenerators(){let u=user()||{};[['modalAge','age'],['modalGender','gender'],['modalWeight','weight'],['modalHeight','height'],['modalPlace','trainingLocation'],['modalDays','trainingDays'],['modalLevel','level']].forEach(([id,k])=>{if($(id)&&u[k]&&!$(id).value)$(id).value=u[k]})}
  function handleMealPreviewClick(){if(!user()){sessionStorage.setItem('fitbrandPendingMealOpen','1');openProfileModal('login');return}if(!(purchases().includes('mealplan')||purchases().includes('bundle'))){let b=document.querySelector('a[href="purchase-access.html?product=mealplan"]');b?.scrollIntoView({behavior:'smooth',block:'center'});notice('Buy — $4.99 to unlock this product');return}let box=$('meal-plan-ai');if(box){box.classList.add('unlocked');buildMealWizard();box.scrollIntoView({behavior:'smooth',block:'start'})}}
  function buildMealWizard(){let gen=$('mealGenerator');if(!gen)return;gen.querySelector('.meal-grid')?.classList.add('fb-hidden-original');gen.querySelector('.meal-generate-btn')?.classList.add('fb-hidden-original');$('fitbrandMealWizard')?.remove();let u=user()||{},wiz=document.createElement('div');wiz.id='fitbrandMealWizard';wiz.className='fb-meal-wizard fb-premium-ai-wizard';wiz.innerHTML='<div class="fb-ai-top"><div><span>FitBrand AI</span><h3>Personal Meal Plan Builder</h3><p>Answer step by step. Your saved profile can fill the boring information automatically.</p></div><strong id="mealStepPill">1 / 6</strong></div><div class="fb-ai-progress"><i id="mealProgressFill"></i></div><div class="fb-ai-profile-card"><div><strong>'+esc(u.name||'Profile info')+'</strong><span>'+(u.weight||'No weight')+' kg • '+(u.height||'No height')+' cm • '+(u.gender||'No gender selected')+'</span></div><button type="button" id="mealUseProfile">Use profile info</button><a href="profile.html">Change information</a></div><section class="fb-ai-step active" data-step="1"><h4>What is your goal?</h4><div class="fb-choice-grid"><button data-field="goal" data-value="fatloss"><b>Lose fat</b><small>Controlled calories and high protein.</small></button><button data-field="goal" data-value="muscle"><b>Build muscle</b><small>More fuel for growth and strength.</small></button><button data-field="goal" data-value="maintenance"><b>Maintain</b><small>Balanced clean eating.</small></button></div></section><section class="fb-ai-step" data-step="2"><h4>Your body details</h4><div class="fb-ai-form-grid"><input id="wizAge" type="number" placeholder="Age"><select id="wizGender"><option value="">Gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select><input id="wizWeight" type="number" placeholder="Weight kg"><input id="wizHeight" type="number" placeholder="Height cm"></div></section><section class="fb-ai-step" data-step="3"><h4>How active are you?</h4><div class="fb-choice-grid"><button data-field="trainingDays" data-value="0"><b>0-1 days</b><small>Light activity.</small></button><button data-field="trainingDays" data-value="3"><b>2-3 days</b><small>Moderate routine.</small></button><button data-field="trainingDays" data-value="5"><b>4-5 days</b><small>Consistent training.</small></button><button data-field="trainingDays" data-value="6"><b>6+ days</b><small>Very active.</small></button></div></section><section class="fb-ai-step" data-step="4"><h4>Choose food style</h4><div class="fb-choice-grid"><button data-field="diet" data-value="normal"><b>Balanced</b><small>Flexible meals.</small></button><button data-field="diet" data-value="highprotein"><b>High protein</b><small>More protein focused.</small></button><button data-field="diet" data-value="budget"><b>Budget</b><small>Simple cheaper foods.</small></button><button data-field="diet" data-value="easy"><b>Fast meals</b><small>Low cooking time.</small></button><button data-field="diet" data-value="vegetarian"><b>Vegetarian</b><small>No meat.</small></button></div></section><section class="fb-ai-step" data-step="5"><h4>Meals per day</h4><div class="fb-choice-grid"><button data-field="meals" data-value="3"><b>3 meals</b><small>Simple plan.</small></button><button data-field="meals" data-value="4"><b>4 meals</b><small>Balanced plan.</small></button><button data-field="meals" data-value="5"><b>5 meals</b><small>Structured plan.</small></button></div></section><section class="fb-ai-step" data-step="6"><h4>Final preferences</h4><div class="fb-ai-form-grid"><select id="wizStyle"><option value="balanced">Balanced</option><option value="lowcalorie">Low calorie</option><option value="bulking">Bulking</option><option value="simple">Very simple</option></select><select id="wizTime"><option value="normal">Normal cooking</option><option value="fast">Under 15 min</option><option value="prep">Meal prep friendly</option></select><input id="wizAvoid" class="wide" placeholder="Foods to avoid / allergies"></div><button class="fb-ai-generate" id="mealFinalGenerate" type="button">Generate 7-day meal plan</button></section><div class="fb-ai-actions"><button id="mealBackBtn" type="button">Back</button><button id="mealNextBtn" type="button">Next</button></div>';gen.prepend(wiz);let state={goal:u.goal||'',trainingDays:u.trainingDays||'',diet:'normal',meals:'4'},step=1;function set(f,v){state[f]=String(v);$$('#fitbrandMealWizard [data-field="'+f+'"]').forEach(b=>b.classList.toggle('selected',b.dataset.value===String(v)))}function fill(){[['wizAge','age'],['wizGender','gender'],['wizWeight','weight'],['wizHeight','height'],['wizAvoid','allergies']].forEach(([id,k])=>{if($(id)&&u[k])$(id).value=u[k]})}function sync(){let vals={mealGoal:state.goal,mealTrainingDays:state.trainingDays,mealDiet:state.diet,mealMeals:state.meals,mealAge:$('wizAge')?.value,mealGender:$('wizGender')?.value,mealWeight:$('wizWeight')?.value,mealHeight:$('wizHeight')?.value,mealAvoid:$('wizAvoid')?.value,mealStyle:$('wizStyle')?.value||'balanced',mealTime:$('wizTime')?.value||'normal'};Object.entries(vals).forEach(([id,v])=>{if($(id))$(id).value=v||''})}function render(){$$('#fitbrandMealWizard .fb-ai-step').forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===step));$('mealStepPill').textContent=step+' / 6';$('mealProgressFill').style.width=(step/6*100)+'%';$('mealBackBtn').style.visibility=step===1?'hidden':'visible';$('mealNextBtn').style.display=step===6?'none':'inline-flex';sync()}wiz.addEventListener('click',e=>{let b=e.target.closest('button');if(!b)return;if(b.id==='mealUseProfile'){fill();sync();notice('Profile info added');return}if(b.dataset.field){set(b.dataset.field,b.dataset.value);sync()}if(b.id==='mealBackBtn'&&step>1){step--;render()}if(b.id==='mealNextBtn'&&step<6){step++;render()}if(b.id==='mealFinalGenerate'){sync();window.generateMealPlan&&window.generateMealPlan()}});fill();if(state.goal)set('goal',state.goal);if(state.trainingDays)set('trainingDays',state.trainingDays);set('diet','normal');set('meals','4');render()}
  function makeComingSoon(){if(!/product-(belt|straps)\.html$/.test(location.pathname))return;$$('a[href*="checkout.html?product=belt"],a[href*="checkout.html?product=straps"],button[onclick*="belt"],button[onclick*="straps"]').forEach(el=>{let d=document.createElement('div');d.className='coming-soon-pill';d.textContent='Coming soon';el.replaceWith(d)});$$('.stock-box span').forEach(s=>{if(/Available/i.test(s.textContent))s.textContent='Coming soon';if(/Ships/i.test(s.textContent))s.textContent='Launching soon'})}
  function renderAccess(){if(!$('accessGrid'))return;let own=purchases();$('accessGrid').innerHTML=['aesthetic','shred','strength','bundle','mealplan'].map(k=>{let p=PRODUCTS[k],has=own.includes(k);return '<article class="access-card '+(has?'owned':'')+'"><div><span>'+(has?'Unlocked':'Locked')+'</span><h3>'+esc(p[0])+'</h3><p>'+(has?'You have access on this device.':'Buy — $4.99 to unlock this product.')+'</p></div><a class="'+(has?'btn-dark':'btn-outline')+'" href="'+(has?p[2]:'purchase-access.html?product='+k)+'">'+(has?'Open':'Buy — $4.99')+'</a></article>'}).join('')}
  function boot(){normalizeProfile();updateProfileUI();updateCartCount();makeComingSoon();renderAccess();gateAccess();prefillGenerators();if(user()&&(purchases().includes('mealplan')||purchases().includes('bundle'))&&$('meal-plan-ai'))buildMealWizard();$$('.cart-icon-btn').forEach(b=>b.onclick=e=>{e.preventDefault();openCartDrawer()});document.addEventListener('click',e=>{let m=$('profileMenu'),b=document.querySelector('.profile-icon-btn');if(m&&b&&!m.contains(e.target)&&!b.contains(e.target))m.classList.remove('show')});setTimeout(()=>{updateProfileUI();renderAccess();makeComingSoon()},250)}
  Object.assign(window,{toggleProfileMenu,openProfileModal,closeProfileModal,loginFitBrandUser,logoutFitBrandUser,updateFitBrandProfileUI:updateProfileUI,updateProfileUI,addToCart,removeDrawerItem,updateCartCount,openCartDrawer,closeCartDrawer,handleMealPreviewClick});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

/* ===== FITBRAND v15 FINAL AUTH + AGE SAFETY PATCH ===== */
(function(){
  'use strict';
  const USER='fitbrandUser', SESSION='fitbrandSessionUser', PUR='fitbrandPurchases', PROG='fitbrandPurchasedPackage', MEAL='fitbrandMealPlanUnlocked';
  const $=id=>document.getElementById(id);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const parse=(v,f)=>{try{return v?JSON.parse(v):f}catch{return f}};
  const validEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e||'').trim());
  function user(){return parse(localStorage.getItem(USER),null)||parse(sessionStorage.getItem(SESSION),null)}
  function initials(u){
    if(!u)return'?';
    let b=(u.name||u.email||'').trim(); if(!b)return'?';
    let parts=b.split(/\s+/).filter(Boolean);
    if(parts.length>1)return (parts[0][0]+parts[parts.length-1][0]).toUpperCase();
    let emailParts=b.split('@')[0].replace(/[._-]+/g,' ').trim().split(/\s+/).filter(Boolean);
    if(emailParts.length>1)return (emailParts[0][0]+emailParts[emailParts.length-1][0]).toUpperCase();
    return b.slice(0,2).toUpperCase();
  }
  function displayName(email){return String(email||'').split('@')[0].replace(/[._-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
  function purchasesRaw(){let a=parse(localStorage.getItem(PUR),[]);let p=localStorage.getItem(PROG);if(p&&!a.includes(p))a.push(p);if(localStorage.getItem(MEAL)==='true'&&!a.includes('mealplan'))a.push('mealplan');if(a.includes('bundle')&&!a.includes('mealplan'))a.push('mealplan');return [...new Set(a)];}
  function purchases(){return user()?purchasesRaw():[]}
  function ensureProfileMenu(){
    const nav=document.querySelector('.nav'); if(!nav)return;
    let actions=nav.querySelector('.nav-actions');
    const cart=nav.querySelector('.cart-icon-btn');
    if(!actions){actions=document.createElement('div');actions.className='nav-actions';nav.appendChild(actions)}
    if(cart&&cart.parentElement!==actions)actions.prepend(cart);
    let btn=actions.querySelector('.profile-icon-btn');
    if(!btn){btn=document.createElement('button');btn.className='profile-icon-btn';btn.type='button';btn.setAttribute('aria-label','Profile');btn.innerHTML='<span id="profileInitial">?</span>';actions.appendChild(btn)}
    btn.onclick=function(e){e.preventDefault();toggleProfileMenu()};
    let menu=$('profileMenu');
    if(!menu){menu=document.createElement('div');menu.id='profileMenu';menu.className='profile-menu';actions.appendChild(menu)}
    menu.innerHTML='<div class="profile-menu-head"><div class="profile-avatar"><span id="profileMenuInitial">?</span></div><div class="profile-menu-id"><strong id="profileMenuName">Guest</strong><br><span id="profileMenuEmail">Not logged in</span></div></div><button type="button" data-auth-only="1" onclick="openProfileModal(\'profile\')">View profile</button><a class="profile-menu-link" data-auth-only="1" href="profile.html">Edit profile information</a><a class="profile-menu-link" data-auth-only="1" href="products-access.html">My products / access</a><a class="profile-menu-link" data-auth-only="1" href="orders.html">My orders</a><button type="button" id="profileLoginBtn" data-guest-only="1" onclick="openProfileModal(\'login\')">Sign in/up</button><button type="button" id="profileLogoutBtn" data-auth-only="1" onclick="logoutFitBrandUser()">Log out</button>';
    if(!$('profileModal')){
      document.body.insertAdjacentHTML('beforeend','<div id="profileModal" class="profile-modal-overlay" onclick="closeProfileModal()"><div class="profile-modal" onclick="event.stopPropagation()"><button class="profile-modal-close" type="button" onclick="closeProfileModal()">×</button><div class="profile-modal-head"><div class="profile-avatar large"><span id="profileModalInitial">?</span></div><h2 id="profileModalTitle">Sign in/up</h2><p id="profileModalSubtitle">Use your email to save orders, product access and profile info.</p></div><div id="profileView" class="profile-modal-content" style="display:none"><div class="profile-info-box"><strong>Name</strong><span id="profileViewName">Guest</span></div><div class="profile-info-box"><strong>Email</strong><span id="profileViewEmail">Not logged in</span></div><div class="profile-info-box"><strong>Status</strong><span id="profileViewStatus">Not logged in</span></div></div><div id="profileLogin" class="profile-modal-content"><label>Email</label><input id="loginProfileEmail" type="email" placeholder="your@email.com"><label>Name</label><input id="loginProfileName" type="text" placeholder="Your full name"><label class="remember-row"><input id="rememberLoginCheck" type="checkbox" checked><span>Remember my login</span></label><button class="btn-dark" type="button" onclick="loginFitBrandUser()">Sign in/up</button><p class="profile-small-note">We send a secure login link to your email. No password needed.</p></div></div></div>');
    }
  }
  function updateAuthUI(){
    ensureProfileMenu();
    const u=user();
    document.body.classList.toggle('fb-is-logged-in',!!u);
    document.body.classList.toggle('fb-is-logged-out',!u);
    ['profileInitial','profileMenuInitial','profileModalInitial'].forEach(id=>{if($(id))$(id).textContent=initials(u)});
    ['profileMenuName','profileViewName'].forEach(id=>{if($(id))$(id).textContent=u?.name||'Guest'});
    ['profileMenuEmail','profileViewEmail'].forEach(id=>{if($(id))$(id).textContent=u?.email||'Not logged in'});
    if($('profileViewStatus'))$('profileViewStatus').textContent=u?'Logged in with FitBrand':'Not logged in';
    $$('[data-auth-only]').forEach(el=>{el.style.display=u?'flex':'none'});
    $$('[data-guest-only],#profileLoginBtn').forEach(el=>{el.style.display=u?'none':'flex'});
    if($('profileLogoutBtn'))$('profileLogoutBtn').style.display=u?'flex':'none';
    renderAccessIfPresent();
  }
  function toggleProfileMenu(){ensureProfileMenu();updateAuthUI();$('profileMenu')?.classList.toggle('show')}
  function openProfileModal(mode){
    ensureProfileMenu();updateAuthUI();$('profileMenu')?.classList.remove('show');
    const u=user(), modal=$('profileModal'), view=$('profileView'), login=$('profileLogin'); if(!modal)return;
    if(mode==='profile'&&u){
      $('profileModalTitle').textContent='Your profile'; $('profileModalSubtitle').textContent='Your saved FitBrand profile on this device.'; view.style.display='block'; login.style.display='none';
    }else{
      $('profileModalTitle').textContent='Sign in/up'; $('profileModalSubtitle').textContent='Use your email so orders and product access connect to your profile.'; view.style.display='none'; login.style.display='block';
      if(u){if($('loginProfileEmail'))$('loginProfileEmail').value=u.email||''; if($('loginProfileName'))$('loginProfileName').value=u.name||'';}
    }
    modal.classList.add('show');
  }
  function closeProfileModal(){$('profileModal')?.classList.remove('show')}
  function saveUser(data,remember){
    const merged=Object.assign({},user()||{},data||{});
    if(remember===false){sessionStorage.setItem(SESSION,JSON.stringify(merged));localStorage.removeItem(USER)}else{localStorage.setItem(USER,JSON.stringify(merged));sessionStorage.removeItem(SESSION)}
    updateAuthUI();return merged;
  }
  function loginFitBrandUser(){
    const email=($('loginProfileEmail')?.value||'').trim();
    const name=($('loginProfileName')?.value||'').trim()||displayName(email);
    const remember=$('rememberLoginCheck')?$('rememberLoginCheck').checked:true;
    if(!validEmail(email)){alert('Please enter a valid email.');return}
    saveUser({email,name},remember);closeProfileModal();notice('Signed in');
  }
  function logoutFitBrandUser(){
    localStorage.removeItem(USER);sessionStorage.removeItem(SESSION);
    $('profileMenu')?.classList.remove('show');closeProfileModal();
    const meal=$('meal-plan-ai'); if(meal)meal.classList.remove('unlocked');
    const out=$('mealOutput'); if(out)out.classList.remove('show');
    const modal=$('fitbrandGeneratorModal'); if(modal)modal.classList.remove('show');
    updateAuthUI();notice('Logged out');
  }
  function notice(text){
    let n=$('fb-mini-notice');if(!n){n=document.createElement('div');n.id='fb-mini-notice';n.className='fb-mini-notice';document.body.appendChild(n)}
    n.textContent=text;n.classList.add('show');setTimeout(()=>n.classList.remove('show'),1800);
  }
  function renderAccessIfPresent(){
    const grid=$('accessGrid'); if(!grid)return;
    const logged=!!user(); document.body.classList.toggle('fb-access-logged-out',!logged);
    const productMap={aesthetic:['Aesthetic Program','index.html?purchased=aesthetic'],shred:['Shred Program','index.html?purchased=shred'],strength:['Strength Program','index.html?purchased=strength'],bundle:['Complete Bundle + Meal Plan AI','index.html?purchased=bundle'],mealplan:['Meal Plan Guide AI','recommended.html?purchased=mealplan#meal-plan-ai']};
    const own=purchases();
    grid.innerHTML=Object.keys(productMap).map(k=>{const has=own.includes(k);const p=productMap[k];return '<article class="access-card '+(has?'owned':'')+'"><div><span>'+(has?'Unlocked':'Locked')+'</span><h3>'+p[0]+'</h3><p>'+(has?'You have access on this logged-in profile/device.':(logged?'Buy — $4.99 to unlock this product.':'Log in to view saved access.'))+'</p></div><a class="'+(has?'btn-dark':'btn-outline')+'" href="'+(has?p[1]:(logged?'purchase-access.html?product='+k:'#'))+'">'+(has?'Open':(logged?'Buy — $4.99':'Log in required'))+'</a></article>'}).join('');
  }
  function ageFrom(ids){for(const id of ids){const v=Number($(id)?.value);if(v)return v}return 0}
  function showAgeError(ids){
    ids.forEach(id=>$(id)?.classList.add('fb-age-error'));
    alert('You must be at least 13 years old to use FitBrand AI generators. Users aged 13–17 need permission from a parent or guardian.');
  }
  function checkAge(ids){const age=ageFrom(ids); if(age && age<13){showAgeError(ids);return false} return true}
  function patchAgeValidation(){
    const oldMeal=window.generateMealPlan;
    window.generateMealPlan=function(){if(!checkAge(['mealAge','wizAge']))return;return oldMeal&&oldMeal.apply(this,arguments)};
    const oldModal=window.generateModalPlan;
    window.generateModalPlan=function(){if(!checkAge(['modalAge','genAge']))return;return oldModal&&oldModal.apply(this,arguments)};
    document.addEventListener('input',e=>{if(e.target&&['mealAge','wizAge','modalAge','genAge','pfAge'].includes(e.target.id))e.target.classList.remove('fb-age-error')});
  }
  function patchProfileForm(){
    const form=$('fullProfileForm'); if(!form||form.dataset.v15Patched)return; form.dataset.v15Patched='1';
    form.addEventListener('submit',function(e){
      const age=Number($('pfAge')?.value||0); if(age&&age<13){e.preventDefault();alert('Users aged 13–17 need parent or guardian permission. For AI generators, the minimum age is 13 with parent or guardian permission.');return false}
    },true);
  }
  function boot(){
    ensureProfileMenu();updateAuthUI();patchAgeValidation();patchProfileForm();
    document.addEventListener('click',e=>{const m=$('profileMenu'),b=document.querySelector('.profile-icon-btn');if(m&&b&&!m.contains(e.target)&&!b.contains(e.target))m.classList.remove('show')});
    setInterval(updateAuthUI,1200);
  }
  Object.assign(window,{toggleProfileMenu,openProfileModal,closeProfileModal,loginFitBrandUser,logoutFitBrandUser,updateFitBrandProfileUI:updateAuthUI,updateProfileUI:updateAuthUI,getFitBrandUser:user,saveFitBrandUser:saveUser});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();


/* ===== FITBRAND_V27_FINAL_STABILITY_PATCH ===== */
(function(){
  'use strict';
  const USER_KEY='fitbrandUser';
  const SESSION_KEY='fitbrandSessionUser';
  const CART_KEY='fitbrandCart';
  const qs=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const id=x=>document.getElementById(x);
  const read=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
  const readSession=(k)=>{try{return JSON.parse(sessionStorage.getItem(k)||'null')}catch{return null}};
  const realUser=()=>{
    const u=read(USER_KEY)||readSession(SESSION_KEY);
    return (u && u.email && (u.backend==='supabase' || u.supabaseId)) ? u : null;
  };
  function cleanPriceText(){
    qs('.price,.product-price,.meal-price,.drawer-item strong,.cart-total span,.summary-row span,.order-card strong').forEach(el=>{
      let t=el.textContent||'';
      t=t.replace(/(\/\s*mo){2,}/gi,'/mo').replace(/(\/\s*month)(\s*\/\s*month)+/gi,' / month');
      t=t.replace(/€(?:4\.99|6\.99)\s*\/\s*mo/gi,'$4.99 one-time');
      t=t.replace(/€(?:4\.99|6\.99)\s*\/\s*month/gi,'$4.99 one-time');
      t=t.replace(/€(?:4\.99|6\.99)(?![0-9])/g,'$4.99 one-time');
      if(t!==el.textContent) el.textContent=t;
    });
  }
  function setProfileUI(){
    const u=realUser();
    document.body.classList.toggle('fb-is-logged-in',!!u);
    document.body.classList.toggle('fb-is-logged-out',!u);
    if(!u){
      if(read(USER_KEY) && !(read(USER_KEY).backend==='supabase' || read(USER_KEY).supabaseId)) localStorage.removeItem(USER_KEY);
      if(readSession(SESSION_KEY) && !(readSession(SESSION_KEY).backend==='supabase' || readSession(SESSION_KEY).supabaseId)) sessionStorage.removeItem(SESSION_KEY);
    }
    const name=u?(u.name||u.email.split('@')[0]):'Guest';
    const email=u?u.email:'Not logged in';
    const initials=u?name.replace(/[._-]+/g,' ').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase():'?';
    ['profileInitial','profileMenuInitial','profileModalInitial'].forEach(k=>{if(id(k)) id(k).textContent=initials});
    ['profileMenuName','profileViewName'].forEach(k=>{if(id(k)) id(k).textContent=name});
    ['profileMenuEmail','profileViewEmail'].forEach(k=>{if(id(k)) id(k).textContent=email});
    if(id('profileViewStatus')) id('profileViewStatus').textContent=u?'Logged in with FitBrand':'Not logged in';
    qs('[data-auth-only], .profile-menu a[href="profile.html"], .profile-menu a[href="products-access.html"], .profile-menu a[href="orders.html"], #profileLogoutBtn').forEach(el=>{
      el.style.setProperty('display',u?'flex':'none','important');
      el.style.setProperty('visibility',u?'visible':'hidden','important');
      el.style.setProperty('pointer-events',u?'auto':'none','important');
    });
    qs('[data-guest-only], #profileLoginBtn').forEach(el=>{
      el.style.setProperty('display',u?'none':'flex','important');
      el.style.setProperty('visibility',u?'hidden':'visible','important');
      el.style.setProperty('pointer-events',u?'none':'auto','important');
    });
  }
  function showNotice(title,msg,type){
    let box=id('fbAuthMessage');
    if(!box){
      box=document.createElement('div');box.id='fbAuthMessage';box.className='fb-auth-message';
      box.innerHTML='<div class="fb-auth-message-card"><button type="button" class="fb-auth-message-close">×</button><div class="fb-auth-message-icon" id="fbAuthMessageIcon">!</div><h3 id="fbAuthMessageTitle"></h3><p id="fbAuthMessageText"></p><button type="button" class="fb-auth-message-ok">Got it</button></div>';
      document.body.appendChild(box);
      box.addEventListener('click',e=>{if(e.target===box||e.target.closest('button')) box.classList.remove('show')});
    }
    box.classList.toggle('error',type==='error'); box.classList.toggle('success',type!=='error');
    if(id('fbAuthMessageIcon')) id('fbAuthMessageIcon').textContent=type==='error'?'!':'✓';
    if(id('fbAuthMessageTitle')) id('fbAuthMessageTitle').textContent=title;
    if(id('fbAuthMessageText')) id('fbAuthMessageText').textContent=msg;
    box.classList.add('show');
  }
  async function supabaseClient(){
    if(window.__fitbrandSupabaseClient) return window.__fitbrandSupabaseClient;
    if(!window.FITBRAND_CONFIG || !window.FITBRAND_CONFIG.supabaseUrl || !window.FITBRAND_CONFIG.supabaseAnonKey) return null;
    for(let i=0;i<60;i++){
      if(window.supabase && window.supabase.createClient){
        window.__fitbrandSupabaseClient=window.supabase.createClient(window.FITBRAND_CONFIG.supabaseUrl,window.FITBRAND_CONFIG.supabaseAnonKey);
        return window.__fitbrandSupabaseClient;
      }
      await new Promise(r=>setTimeout(r,100));
    }
    return null;
  }
  window.logoutFitBrandUser=async function(){
    try{const sb=await supabaseClient(); if(sb) await sb.auth.signOut();}catch(e){}
    localStorage.removeItem(USER_KEY); sessionStorage.removeItem(SESSION_KEY);
    document.querySelector('.profile-menu')?.classList.remove('show');
    id('profileMenu')?.classList.remove('show');
    if(typeof window.closeProfileModal==='function') try{window.closeProfileModal()}catch(e){}
    setProfileUI(); showNotice('Logged out','You have been signed out of FitBrand.','success');
  };
  function handleExpiredMagicLink(){
    const url=new URL(location.href); const hash=location.hash||'';
    if(hash.includes('error=') || url.searchParams.get('error')){
      const desc=decodeURIComponent((hash.match(/error_description=([^&]+)/)||[])[1]||url.searchParams.get('error_description')||'This login link is invalid or has expired. Please request a new login link.').replace(/\+/g,' ');
      history.replaceState({},document.title,location.pathname+location.search.replace(/[?&]error[^&]*/g,''));
      setTimeout(()=>showNotice('Login link expired',desc,'error'),250);
    }
  }
  document.addEventListener('click',function(e){
    const checkout=e.target.closest('a[href*="checkout.html"], #stripe-link');
    if(checkout && !realUser()){
      e.preventDefault();
      sessionStorage.setItem('fitbrandCheckoutAfterLogin', checkout.getAttribute('href')||location.href);
      showNotice('Sign in required','Please sign in before continuing to checkout. This keeps your order and product access connected to your account.','error');
      if(typeof window.openProfileModal==='function') setTimeout(()=>window.openProfileModal('login'),250);
      return;
    }
    setTimeout(()=>{setProfileUI();cleanPriceText()},60);
  },true);
  const oldUpdate=window.updateFitBrandProfileUI||window.updateProfileUI;
  window.updateFitBrandProfileUI=window.updateProfileUI=function(){try{if(typeof oldUpdate==='function') oldUpdate()}catch(e){} setProfileUI(); cleanPriceText();};
  document.addEventListener('DOMContentLoaded',()=>{handleExpiredMagicLink(); setProfileUI(); cleanPriceText(); setTimeout(setProfileUI,500); setTimeout(cleanPriceText,900);});
  window.addEventListener('load',()=>{setProfileUI();cleanPriceText()});
})();

/* FITBRAND_V27_CLEAN */


/* ===== FITBRAND v36 MANUAL ACCESS BUY FLOW ===== */
(function(){
  'use strict';
  const DIGITAL = ['aesthetic','shred','strength','bundle','mealplan'];
  const PURCHASE_URL = key => 'purchase-access.html?product=' + encodeURIComponent(key || 'bundle');

  function patchDigitalBuyLinks(){
    document.querySelectorAll('a[href*="early-access.html?product="], a[href*="checkout.html?product="]').forEach(a => {
      const href = a.getAttribute('href') || '';
      const match = href.match(/[?&]product=([^&]+)/);
      const key = match ? decodeURIComponent(match[1]) : '';
      if(DIGITAL.includes(key)) {
        a.setAttribute('href', PURCHASE_URL(key));
        if(/join|buy|start|early/i.test(a.textContent || '')) a.textContent = 'Buy — $4.99';
      }
    });
    document.querySelectorAll('a[href="checkout.html?cart=true"]').forEach(a => {
      if(/bundle|program|checkout|start/i.test(a.textContent || '')) {
        a.setAttribute('href', PURCHASE_URL('bundle'));
        a.textContent = 'Request bundle access';
      }
    });
  }

  const oldAddToCart = window.addToCart;
  window.addToCart = function(key){
    if(DIGITAL.includes(key)) {
      location.href = PURCHASE_URL(key);
      return;
    }
    if(typeof oldAddToCart === 'function') return oldAddToCart.apply(this, arguments);
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchDigitalBuyLinks);
  else patchDigitalBuyLinks();
})();
