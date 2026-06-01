/* FitBrand v41: checkout logo navigation + admin testing helpers */
(function(){
  'use strict';
  const ALL_ACCESS = ['aesthetic','shred','strength','bundle','mealplan'];
  const HOME = 'index.html';

  function showToast(title, message, type){
    if(window.FitBrandToast){
      window.FitBrandToast(title, message, type || 'success');
      return;
    }
    let box = document.getElementById('fb-v41-toast');
    if(!box){
      box = document.createElement('div');
      box.id = 'fb-v41-toast';
      box.className = 'fb-v41-toast';
      document.body.appendChild(box);
    }
    box.innerHTML = '<strong>' + title + '</strong><span>' + message + '</span>';
    box.classList.add('show');
    setTimeout(()=>box.classList.remove('show'), 2600);
  }

  function forceCheckoutLogoHome(){
    const isCheckout = /(^|\/)checkout\.html$/i.test(location.pathname) || /(^|\/)purchase-access\.html$/i.test(location.pathname);
    if(!isCheckout) return;
    document.querySelectorAll('a.brand, .nav .brand, .fb-purchase-mini-nav .brand').forEach(brand => {
      if(brand.tagName !== 'A') return;
      brand.setAttribute('href', HOME);
      brand.setAttribute('aria-label', 'Go to FitBrand home');
      brand.classList.add('fb-v41-logo-home');
      brand.addEventListener('click', function(e){
        e.preventDefault();
        window.location.href = HOME;
      }, true);
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
    showToast('Admin access unlocked', 'All FitBrand programs and AI tools are unlocked on this device.');
    if(typeof window.updateFitBrandProfileUI === 'function') window.updateFitBrandProfileUI();
  }

  function clearLocalTestAccess(){
    localStorage.removeItem('fitbrandPurchases');
    localStorage.removeItem('fitbrandPurchasedPackage');
    localStorage.removeItem('fitbrandMealPlanUnlocked');
    localStorage.removeItem('fitbrandAdminTestAccess');
    showToast('Test access cleared', 'Local program access has been removed from this device.', 'error');
  }

  window.FitBrandAdminTestAccess = { unlockLocalTestAccess, clearLocalTestAccess, products: ALL_ACCESS };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', forceCheckoutLogoHome);
  else forceCheckoutLogoHome();
  window.addEventListener('load', () => setTimeout(forceCheckoutLogoHome, 200));
})();
