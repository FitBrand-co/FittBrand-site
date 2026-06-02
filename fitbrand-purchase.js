/* FitBrand manual purchase request flow v36 */
(function(){
  'use strict';

  const PRODUCTS = {
    aesthetic:{name:'Aesthetic Program',price:'$4.99 one-time',desc:'Workout structure for building a more aesthetic physique.'},
    shred:{name:'Shred Program',price:'$4.99 one-time',desc:'Training structure for losing fat and staying consistent.'},
    strength:{name:'Strength Program',price:'$4.99 one-time',desc:'Strength-focused training with clear progression.'},
    mealplan:{name:'Meal Plan Guide AI',price:'$4.99 one-time',desc:'Meal guidance and simple structure for your goal.'},
    bundle:{name:'Complete Bundle + Meal Plan AI',price:'$4.99 one-time',desc:'All FitBrand programs plus Meal Plan Guide AI access.'}
  };

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

  function validEmail(email){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'').trim());}

  function setProductFromUrl(){
    const params = new URLSearchParams(location.search);
    const product = params.get('product');
    if(product && PRODUCTS[product] && $('manualProduct')) $('manualProduct').value = product;
  }

  function updateProductSummary(){
    const key = $('manualProduct')?.value || 'aesthetic';
    const p = PRODUCTS[key] || PRODUCTS.aesthetic;
    const box = $('manualProductSummary');
    if(!box) return;
    box.innerHTML = `<strong>${esc(p.name)}</strong><span>${esc(p.price)}</span><p>${esc(p.desc)}</p>`;
  }

  function showMessage(type, message){
    const el = $('manualPurchaseMessage');
    if(!el) return;
    el.className = 'fb-purchase-message show ' + (type === 'error' ? 'error' : 'success');
    el.textContent = message;
  }

  async function submitPurchaseRequest(e){
    e.preventDefault();
    const btn = $('manualPurchaseSubmit');
    const email = $('manualEmail')?.value.trim();
    const product = $('manualProduct')?.value;
    const name = $('manualName')?.value.trim();
    if(!validEmail(email)) { showMessage('error','Enter a valid email first.'); return; }
    if(!PRODUCTS[product]) { showMessage('error','Choose a valid product.'); return; }

    const payload = {
      email,
      full_name: name,
      product_slug: product,
      product_name: PRODUCTS[product].name,
      price_label: PRODUCTS[product].price,
      payment_reference: $('manualPaymentRef')?.value.trim() || '',
      notes: $('manualNotes')?.value.trim() || '',
      source_page: 'purchase-access-v43'
    };

    const oldText = btn?.textContent;
    if(btn){ btn.disabled = true; btn.textContent = 'Sending request...'; }
    try{
      const res = await fetch('/api/manual-purchase-request', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(()=>({}));
      if(!res.ok || !data.ok) throw new Error(data.error || 'Could not save request.');
      localStorage.setItem('fitbrandPurchaseRequestSubmitted','yes');
      showMessage('success','Request sent. We will verify payment manually and unlock access for this email.');
      setTimeout(()=>{ location.href='index.html?purchase_request=sent'; }, 2200);
    }catch(err){
      console.error(err);
      showMessage('error', err.message || 'Could not send request. Please try again.');
    }finally{
      if(btn){ btn.disabled = false; btn.textContent = oldText || 'Buy — $4.99'; }
    }
  }

  function boot(){
    setProductFromUrl();
    updateProductSummary();
    $('manualProduct')?.addEventListener('change', updateProductSummary);
    $('fitbrandPurchaseRequestForm')?.addEventListener('submit', submitPurchaseRequest);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
