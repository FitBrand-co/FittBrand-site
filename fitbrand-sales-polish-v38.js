/* FitBrand v39 sales/prices/buttons/popup alignment
   Purpose: one clear paid offer, consistent buttons, safer mobile UX. */
(function(){
  'use strict';
  const DIGITAL = new Set(['aesthetic','shred','strength','bundle','mealplan']);
  const cfg = () => window.FITBRAND_GUMROAD || {};
  const STARTER_PRICE = () => cfg().productPrice || '$4.99';
  const STARTER_URL = 'purchase-access.html';
  const productNames = {
    aesthetic:'Aesthetic Program',
    shred:'Shred Program',
    strength:'Strength Program',
    bundle:'Complete Bundle',
    mealplan:'Meal Plan Guide AI'
  };

  const safeText = (el, text) => { if(el && (el.textContent || '').trim() !== text) el.textContent = text; };
  const qs = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const oldAddToCart = window.addToCart;
  window.addToCart = function(product){
    if(DIGITAL.has(product)){
      if(window.FitBrandToast){
        window.FitBrandToast('Starter access', `${productNames[product] || 'Digital access'} is included in the FitBrand Starter Plan for ${STARTER_PRICE()}.`);
      }
      setTimeout(()=>{ window.location.href = STARTER_URL + '?product=' + encodeURIComponent(product || 'starter'); }, 280);
      return;
    }
    return typeof oldAddToCart === 'function' ? oldAddToCart(product) : undefined;
  };

  function cleanDigitalCart(){
    try{
      const cart = JSON.parse(localStorage.getItem('fitbrandCart') || '[]');
      const cleaned = cart.filter(item => !DIGITAL.has(typeof item === 'string' ? item : item?.slug));
      if(cleaned.length !== cart.length) localStorage.setItem('fitbrandCart', JSON.stringify(cleaned));
    }catch{}
  }

  function updateTextNodes(){
    const price = STARTER_PRICE();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      let t=n.nodeValue || '';
      const original=t;
      t=t.replace(/€9\.99\s*\/\s*month/gi, `${price} one-time`);
      t=t.replace(/€7\.99\s*\/\s*month/gi, `${price} one-time`);
      t=t.replace(/€24\.99\s*\/\s*month/gi, `${price} one-time`);
      t=t.replace(/Target price:\s*€9\.99\s*\/\s*month/gi, `Starter access: ${price} one-time`);
      t=t.replace(/Target price:\s*€24\.99\s*\/\s*month/gi, `Starter access: ${price} one-time`);
      t=t.replace(/Target price:\s*\$4\.99\s*one-time/gi, `Starter access: ${price} one-time`);
      t=t.replace(/Premium programs as a subscription/gi, 'Start with one simple access pass');
      t=t.replace(/Current launch pricing is shown with clear monthly billing/gi, 'Current beta pricing is one-time and handled through Gumroad');
      t=t.replace(/Launch offer/gi, 'Beta access');
      t=t.replace(/Request bundle access/gi, `Buy Starter Plan — ${price}`);
      t=t.replace(/Buy Starter Plan\s*—\s*\$4\.99/gi, `Buy Starter Plan — ${price}`);
      if(t!==original) n.nodeValue=t;
    });
  }

  function alignButtons(){
    const price = STARTER_PRICE();
    qs('a[href^="purchase-access.html"], a[href*="purchase-access.html"]').forEach(a=>{
      if(/admin/i.test(a.href)) return;
      const text=(a.textContent||'').trim();
      if(!/view access/i.test(text)) safeText(a, `Buy Starter Plan — ${price}`);
      a.classList.add('fb-primary-buy-btn');
      a.setAttribute('aria-label', `Buy FitBrand Starter Plan for ${price}`);
    });
    qs('button[onclick*="addToCart(\'aesthetic\')"],button[onclick*="addToCart(\'shred\')"],button[onclick*="addToCart(\'strength\')"],button[onclick*="addToCart(\'bundle\')"],button[onclick*="addToCart(\'mealplan\')"]').forEach(btn=>{
      safeText(btn, `Buy Starter Plan — ${price}`);
      btn.classList.add('fb-secondary-buy-btn');
    });
    qs('[data-gumroad-buy]').forEach(btn=>{
      safeText(btn, `Buy Starter Plan — ${price}`);
      btn.classList.add('fb-primary-buy-btn');
    });
    qs('.program-cart-actions,.bundle-actions,.meal-buy-row').forEach(row=>row.classList.add('fb-v39-actions-safe'));
  }

  function ensureGumroadWarning(){
    const p = new URLSearchParams(location.search);
    if(p.get('gumroad') === 'missing' && window.FitBrandToast){
      window.FitBrandToast('Gumroad link missing','Paste your Gumroad product link into gumroad-config.js before customers can buy.','error');
    }
  }

  function addMobileStickyBuy(){
    if(!/purchase-access|programs|recommended|index/.test(location.pathname) && !location.pathname.endsWith('/')) return;
    if(document.querySelector('.fb-v39-mobile-sticky-buy')) return;
    const price = STARTER_PRICE();
    const bar=document.createElement('a');
    bar.className='fb-v39-mobile-sticky-buy';
    bar.href='purchase-access.html';
    bar.innerHTML=`<span>Starter Plan</span><strong>Buy — ${price}</strong>`;
    document.body.appendChild(bar);
    let last=0;
    const update=()=>{
      const y=window.scrollY||0;
      bar.classList.toggle('show', y>340 && y>=last-40);
      last=y;
    };
    window.addEventListener('scroll', update, {passive:true}); update();
  }

  function boot(){
    cleanDigitalCart();
    updateTextNodes();
    alignButtons();
    ensureGumroadWarning();
    addMobileStickyBuy();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('load',()=>setTimeout(boot,250));
})();
