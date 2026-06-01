/* FitBrand v38 cookie consent + clean popups */
(function(){
  'use strict';
  const STORAGE_KEY = 'fitbrand_cookie_choice_v39';
  const hasChoice = () => !!localStorage.getItem(STORAGE_KEY);
  const choice = () => localStorage.getItem(STORAGE_KEY);

  function loadScript(src){
    if(document.querySelector('script[src="'+src+'"]')) return;
    const s = document.createElement('script');
    s.defer = true;
    s.src = src;
    document.head.appendChild(s);
  }
  function enableAnalytics(){
    try{
      window.va = window.va || function(){(window.vaq = window.vaq || []).push(arguments)};
      window.si = window.si || function(){(window.siq = window.siq || []).push(arguments)};
      loadScript('/_vercel/insights/script.js');
      loadScript('/_vercel/speed-insights/script.js');
    }catch(e){ console.warn('Analytics could not load', e); }
  }
  function showToast(title, text, type){
    let box = document.getElementById('fbUniversalToast');
    if(!box){ box=document.createElement('div'); box.id='fbUniversalToast'; box.className='fb-universal-toast'; document.body.appendChild(box); }
    box.className='fb-universal-toast show ' + (type || '');
    box.innerHTML='<strong>'+escapeHtml(title)+'</strong><span>'+escapeHtml(text)+'</span>';
    clearTimeout(window.__fbUniversalToastTimer);
    window.__fbUniversalToastTimer=setTimeout(()=>box.classList.remove('show'),3300);
  }
  function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  window.FitBrandToast = showToast;

  function createBanner(){
    if(hasChoice()) { if(choice()==='accepted') enableAnalytics(); return; }
    const banner = document.createElement('div');
    banner.id = 'fitbrandCookieBanner';
    banner.className = 'fb-cookie-banner';
    banner.innerHTML = `
      <div class="fb-cookie-card">
        <div class="fb-cookie-copy">
          <strong>FitBrand uses cookies</strong>
          <p>Necessary storage keeps login, cart and product access working. With your permission, we use basic analytics to improve the mobile experience. You can choose necessary only. <a href="policies.html#cookies">Cookie policy</a></p>
        </div>
        <div class="fb-cookie-actions">
          <button type="button" class="fb-cookie-secondary" data-cookie-decline>Necessary only</button>
          <button type="button" class="fb-cookie-primary" data-cookie-accept>Accept analytics</button>
        </div>
      </div>`;
    document.body.appendChild(banner);
    banner.querySelector('[data-cookie-accept]').addEventListener('click',()=>{
      localStorage.setItem(STORAGE_KEY,'accepted');
      banner.remove();
      enableAnalytics();
      showToast('Cookies saved','Analytics accepted. You can change this in your browser storage settings.');
    });
    banner.querySelector('[data-cookie-decline]').addEventListener('click',()=>{
      localStorage.setItem(STORAGE_KEY,'necessary');
      banner.remove();
      showToast('Cookies saved','Only necessary browser storage will be used.');
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', createBanner); else createBanner();
})();
