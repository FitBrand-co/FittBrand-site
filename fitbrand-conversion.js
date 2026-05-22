/* FitBrand v35 TikTok conversion system */
(function(){
  'use strict';

  const $ = (id) => document.getElementById(id);
  const qs = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function showToast(title, message, type='success'){
    let box = $('fbConversionToast');
    if(!box){
      box = document.createElement('div');
      box.id = 'fbConversionToast';
      box.className = 'fb-conversion-toast';
      document.body.appendChild(box);
    }
    box.className = `fb-conversion-toast show ${type}`;
    box.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
    clearTimeout(box._t);
    box._t = setTimeout(()=>box.classList.remove('show'), 4200);
  }

  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function normalizeEmail(email){ return String(email||'').trim().toLowerCase(); }
  function validEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email)); }

  function getGoalFromUrl(){
    const q = new URLSearchParams(location.search);
    return q.get('goal') || q.get('program') || q.get('product') || '';
  }

  function setupGoalButtons(){
    const goalInput = $('eaGoal');
    qsa('.fb-ea-goals button').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('.fb-ea-goals button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        if(goalInput) goalInput.value = btn.dataset.goal || btn.textContent.trim();
      });
    });
    const fromUrl = getGoalFromUrl().toLowerCase();
    if(fromUrl){
      const match = qsa('.fb-ea-goals button').find(b => b.textContent.toLowerCase().includes(fromUrl) || (b.dataset.goal||'').toLowerCase().includes(fromUrl));
      if(match) match.click();
    }
  }

  async function saveLead(payload){
    const res = await fetch('/api/early-access-leads', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    let data = null;
    try { data = await res.json(); } catch(e) {}
    if(!res.ok || data?.ok === false){
      throw new Error(data?.error || `Could not save signup (${res.status})`);
    }
    return data;
  }

  function setupEarlyAccessForm(){
    const form = $('fitbrandEarlyAccessForm');
    if(!form) return;
    const msg = $('eaMessage');
    const button = $('eaSubmitBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = normalizeEmail($('eaEmail')?.value);
      if(!validEmail(email)){
        if(msg){ msg.textContent = 'Add a valid email first.'; msg.className = 'fb-ea-message error show'; }
        return;
      }
      const payload = {
        email,
        full_name: '',
        product_interest: $('eaProduct')?.value || 'FitBrand Early Access',
        goal: $('eaGoal')?.value || 'General fitness',
        monthly_price_interest: $('eaPrice')?.value || 'Maybe',
        start_timeline: $('eaTimeline')?.value || 'Interested now',
        notes: $('eaNotes')?.value || 'TikTok mobile signup',
        source_page: $('eaSource')?.value || location.pathname
      };

      if(button){ button.disabled = true; button.textContent = 'Joining...'; }
      if(msg){ msg.textContent = 'Saving your spot...'; msg.className = 'fb-ea-message show'; }

      try{
        await saveLead(payload);
        localStorage.setItem('fitbrandEarlyAccessJoined','true');
        localStorage.setItem('fitbrandEarlyAccessEmail', email);
        if(msg){ msg.textContent = 'You’re on the list. Redirecting...'; msg.className = 'fb-ea-message success show'; }
        showToast('You’re on the list', 'We saved your early access signup.', 'success');
        setTimeout(()=>{ location.href = 'index.html?joined=early-access'; }, 1300);
      }catch(err){
        console.error(err);
        if(msg){ msg.textContent = 'Something went wrong. Please try again.'; msg.className = 'fb-ea-message error show'; }
        showToast('Signup failed', 'Please try again or refresh the page.', 'error');
        if(button){ button.disabled = false; button.textContent = 'Join free early access'; }
      }
    });
  }

  function addMobileMenu(){
    const nav = qs('header.nav');
    if(!nav || $('fbMobileMenuButton')) return;
    const actions = qs('.nav-actions', nav) || nav;
    const btn = document.createElement('button');
    btn.id = 'fbMobileMenuButton';
    btn.className = 'fb-mobile-menu-button';
    btn.type = 'button';
    btn.setAttribute('aria-label','Open menu');
    btn.innerHTML = '<span></span><span></span><span></span>';
    actions.insertBefore(btn, actions.firstChild);

    const overlay = document.createElement('div');
    overlay.id = 'fbMobileMenuOverlay';
    overlay.className = 'fb-mobile-menu-overlay';
    overlay.innerHTML = `
      <div class="fb-mobile-menu-panel">
        <div class="fb-mobile-menu-head"><strong>FitBrand</strong><button type="button" aria-label="Close menu">×</button></div>
        <a href="index.html">Home</a>
        <a href="early-access.html">Early Access</a>
        <a href="programs.html">Programs</a>
        <a href="recommended.html">Recommended Products</a>
        <a href="about.html">About us</a>
        <a href="policies.html">Policies</a>
      </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.classList.remove('show');
    btn.addEventListener('click', () => overlay.classList.add('show'));
    overlay.addEventListener('click', e => { if(e.target === overlay) close(); });
    qs('button', overlay)?.addEventListener('click', close);
    qsa('a', overlay).forEach(a => a.addEventListener('click', close));
  }

  function replaceDigitalCheckoutLinks(){
    const keywords = ['aesthetic','shred','strength','meal plan','bundle','program'];
    qsa('a,button').forEach(el => {
      const txt = (el.textContent || '').toLowerCase();
      const href = (el.getAttribute('href') || '').toLowerCase();
      const onclick = (el.getAttribute('onclick') || '').toLowerCase();
      const isDigital = keywords.some(k => txt.includes(k) || href.includes(k) || onclick.includes(k));
      const looksLikeBuy = /buy|checkout|subscribe|unlock|start|access|program|plan/i.test(txt + ' ' + href + ' ' + onclick);
      if(isDigital && looksLikeBuy && !href.includes('product-belt') && !href.includes('product-straps') && !href.includes('product-shaker')){
        if(el.tagName === 'A'){
          el.setAttribute('href','early-access.html');
        } else {
          el.addEventListener('click', ev => { ev.preventDefault(); location.href = 'early-access.html'; });
        }
      }
    });
  }

  function joinedMessage(){
    const q = new URLSearchParams(location.search);
    if(q.get('joined') === 'early-access'){
      showToast('Early access saved', 'You are now on the FitBrand launch list.', 'success');
      history.replaceState({}, document.title, location.pathname);
    }
  }

  function optimizeHomeForTikTok(){
    if(!/index\.html$|\/$/.test(location.pathname)) return;
    const hero = qs('.hero-content, .hero .container, .hero');
    if(!hero || $('fbTikTokQuickSignup')) return;
    const box = document.createElement('div');
    box.id = 'fbTikTokQuickSignup';
    box.className = 'fb-tiktok-quick';
    box.innerHTML = `<strong>Coming from TikTok?</strong><span>Join early access in 30 seconds. No payment required.</span><a href="early-access.html">Join early access</a>`;
    hero.appendChild(box);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupGoalButtons();
    setupEarlyAccessForm();
    addMobileMenu();
    replaceDigitalCheckoutLinks();
    optimizeHomeForTikTok();
    joinedMessage();
  });
})();
