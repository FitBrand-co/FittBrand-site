/* FitBrand v40 final polish: mobile layout, nav button fix, checkout UX, AI guidance */
(function(){
  'use strict';
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const price = (window.FITBRAND_GUMROAD && window.FITBRAND_GUMROAD.productPrice) || '$4.99';
  function fixNavBuyButtons(){
    // Undo the earlier global buy-button styling inside top navigation.
    $$('.nav nav a, .fb-purchase-mini-nav a, .mobile-panel a').forEach(a=>{
      a.classList.remove('fb-primary-buy-btn','fb-secondary-buy-btn');
      a.removeAttribute('aria-label');
      if(a.closest('.nav nav') && /purchase-access\.html/i.test(a.getAttribute('href')||'')){
        a.classList.add('fb-nav-buy-link');
        a.textContent='Starter Plan';
      }
    });
  }
  function compactPrices(){
    $$('.price,.meal-price').forEach(el=>{
      const txt=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(/Starter access|one-time|\$4\.99|€4\.99/.test(txt) && !el.classList.contains('fb-compact-price')){
        el.classList.add('fb-compact-price');
        el.innerHTML=`<strong>${price}</strong><span>one-time starter access</span>`;
      }
    });
    $$('a[href*="purchase-access.html"],button[data-gumroad-buy]').forEach(el=>{
      if(el.closest('.nav') || el.closest('.mobile-panel') || el.closest('.fb-purchase-mini-nav')) return;
      if(!/details|home|join/i.test((el.textContent||'').trim())) el.textContent=`Buy — ${price}`;
    });
  }
  function makeLogoHome(){
    $$('.brand').forEach(a=>{ if(a.tagName==='A') a.setAttribute('href','index.html'); });
  }
  function improvePurchasePage(){
    if(!/purchase-access\.html/.test(location.pathname)) return;
    const hero=$('.fb-purchase-hero');
    if(hero && !$('.fb-v40-safe-note')) hero.insertAdjacentHTML('beforeend', `<p class="fb-v40-safe-note">You will be sent to Gumroad for payment. FitBrand does not store card details.</p>`);
    const btn=$('[data-gumroad-buy]');
    if(btn) btn.textContent=`Continue to secure checkout — ${price}`;
  }
  function addGeneratorEducation(){
    const meal=$('#meal-plan-ai .meal-ai-lock-head');
    if(meal && !$('.fb-v40-ai-proof', meal.parentElement)){
      meal.insertAdjacentHTML('afterend', `<div class="fb-v40-ai-proof"><article><strong>Evidence-based structure</strong><span>Calories are estimates, protein is prioritized, and weekly adjustments are based on progress.</span></article><article><strong>Safer output</strong><span>The generator gives general guidance, not medical or dietetic advice.</span></article><article><strong>Practical meals</strong><span>Plans focus on easy protein sources, carbs for training and balanced fats.</span></article></div>`);
    }
    const modal=$('#fitbrandGeneratorModal .fb-modal-body');
    if(modal && !$('#fbV40TrainingProof')){
      modal.insertAdjacentHTML('afterbegin', `<div id="fbV40TrainingProof" class="fb-v40-training-proof"><strong>Training logic</strong><span>Plans use goal, days, level and location to suggest a simple structure with progressive overload notes. Start conservative and adjust if recovery is poor.</span></div>`);
    }
  }
  function boot(){fixNavBuyButtons();compactPrices();makeLogoHome();improvePurchasePage();addGeneratorEducation();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('load',()=>setTimeout(boot,350));
})();
