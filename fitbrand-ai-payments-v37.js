/* FitBrand v37 — Gumroad payment path + evidence-based generator upgrade */
(function(){
  'use strict';

  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const cfg = () => window.FITBRAND_GUMROAD || {starterAccessUrl:'https://gumroad.com/', productPrice:'€4.99'};
  const isRealGumroad = () => /^https:\/\/.+gumroad\.com\/.+/i.test(cfg().starterAccessUrl || '');

  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function toast(title, text, type='success'){
    let box = $('fbV37Toast');
    if(!box){
      box = document.createElement('div');
      box.id = 'fbV37Toast';
      box.className = 'fb-v37-toast';
      document.body.appendChild(box);
    }
    box.className = 'fb-v37-toast show ' + type;
    box.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span>`;
    clearTimeout(window.__fbV37ToastTimer);
    window.__fbV37ToastTimer = setTimeout(()=>box.classList.remove('show'), 3200);
  }

  function openGumroad(product='starter'){
    const url = cfg().starterAccessUrl;
    if(!isRealGumroad()){
      toast('Gumroad link missing', 'Create your Gumroad product, then paste the product URL into gumroad-config.js.', 'error');
      return false;
    }
    window.open(url + (url.includes('?') ? '&' : '?') + 'wanted=true&product=' + encodeURIComponent(product), '_blank', 'noopener');
    return true;
  }

  function patchPaymentButtons(){
    const gumroadLabel = `Buy Starter Access — ${cfg().productPrice || '€4.99'}`;
    $$('.fb-gumroad-buy, [data-gumroad-buy]').forEach(btn=>{
      btn.textContent = gumroadLabel;
      btn.addEventListener('click', (e)=>{ e.preventDefault(); openGumroad(btn.dataset.product || 'starter'); });
    });

    // Add a clear payment CTA to purchase-access if it exists.
    const purchaseCard = document.querySelector('.fb-purchase-card');
    if(purchaseCard && !$('fbGumroadPaymentCard')){
      const card = document.createElement('section');
      card.id = 'fbGumroadPaymentCard';
      card.className = 'fb-payment-card-v37';
      card.innerHTML = `
        <div class="fb-payment-badge-v37">Fast payment test</div>
        <h2>Buy starter access now</h2>
        <p>Use Gumroad to pay safely. After purchase, use the same email on FitBrand so we can unlock your access.</p>
        <button class="fb-gumroad-main-btn" type="button" data-gumroad-buy>${gumroadLabel}</button>
        <div class="fb-payment-proof-v37"><span>Secure Gumroad checkout</span><span>Manual access unlock</span><span>No Stripe needed yet</span></div>
        <p class="fb-payment-note-v37">If the Gumroad button says the link is missing, create your Gumroad product and paste the product URL into <strong>gumroad-config.js</strong>.</p>
      `;
      purchaseCard.parentNode.insertBefore(card, purchaseCard);
      card.querySelector('[data-gumroad-buy]').addEventListener('click', e=>{ e.preventDefault(); openGumroad('starter'); });
    }
  }

  // Evidence-based training engine (static knowledge, not live internet).
  const TRAINING = {
    evidenceNotes: [
      'Strength and muscle gain work best with progressive overload, consistent weekly volume and recovery.',
      'Beginner lifters should prioritize technique, full range of motion and repeatable progress before advanced intensity techniques.',
      'WHO-style health guidance still matters: include regular movement, cardio/steps and muscle-strengthening work.',
      'This generator gives general fitness guidance and is not medical advice.'
    ],
    templates: {
      aesthetic: {
        goal: 'balanced muscle growth, shoulder-to-waist look and proportion',
        split: ['Upper push + shoulders','Lower body + core','Pull + arms','Upper hypertrophy','Lower posterior chain','Optional pump + conditioning'],
        focus: ['Upper chest','Lateral delts','Back width','Arms','Core control']
      },
      shred: {
        goal: 'fat loss while keeping muscle and performance',
        split: ['Full body strength','Conditioning + core','Upper body volume','Lower body strength','Full body metabolic','Steps + mobility'],
        focus: ['Protein consistency','Steps','Zone 2 cardio','Heavy compound retention','Sleep/recovery']
      },
      strength: {
        goal: 'stronger compound lifts and measurable progression',
        split: ['Squat focus','Bench focus','Deadlift focus','Upper assistance','Lower assistance','Technique + speed work'],
        focus: ['Main lift technique','Progressive load','Rest periods','Bracing','Accessory balance']
      }
    }
  };

  function getUserProfile(){
    try { return JSON.parse(localStorage.getItem('fitbrandUser') || sessionStorage.getItem('fitbrandSessionUser') || '{}') || {}; }
    catch { return {}; }
  }

  function getTrainingInputs(){
    const u = getUserProfile();
    const track = $('modalPackage')?.value || 'aesthetic';
    return {
      track: ['aesthetic','shred','strength'].includes(track) ? track : 'aesthetic',
      goal: $('modalGoal')?.value || (track === 'shred' ? 'fatloss' : track === 'strength' ? 'strength' : 'muscle'),
      age: Number($('modalAge')?.value || u.age || 18),
      weight: Number($('modalWeight')?.value || u.weight || 75),
      height: Number($('modalHeight')?.value || u.height || 180),
      place: $('modalPlace')?.value || u.trainingLocation || 'gym',
      days: Math.max(3, Math.min(6, Number($('modalDays')?.value || u.trainingDays || 4))),
      level: $('modalLevel')?.value || u.level || 'beginner',
      limit: $('modalLimit')?.value || 'none',
      focus: document.querySelector('input[name="trackFocus"]:checked')?.value || 'balanced progress'
    };
  }

  function makeExercises(input, dayName, i){
    const home = input.place === 'home';
    const level = input.level;
    const setsMain = level === 'beginner' ? '3 sets' : level === 'intermediate' ? '3–4 sets' : '4 sets';
    const repsHeavy = input.track === 'strength' ? '3–6 reps' : '6–10 reps';
    const repsVolume = input.track === 'strength' ? '5–8 reps' : '8–15 reps';
    const rest = input.track === 'strength' ? '2–4 min rest on main lifts' : '60–120 sec rest';

    const gymBank = {
      push: [`Bench press — ${setsMain} x ${repsHeavy}`, `Incline dumbbell press — 3 x ${repsVolume}`, `Cable/lateral raise — 3 x 12–20`, `Triceps pressdown — 2–3 x 10–15`],
      pull: [`Pull-up or lat pulldown — ${setsMain} x ${repsVolume}`, `Row variation — 3–4 x 8–12`, `Rear delt fly — 3 x 12–20`, `Curl variation — 2–3 x 10–15`],
      legs: [`Squat or leg press — ${setsMain} x ${repsHeavy}`, `Romanian deadlift — 3 x 6–10`, `Leg curl — 3 x 10–15`, `Calves + core — 3 rounds`],
      full: [`Squat/hinge pattern — ${setsMain} x ${repsHeavy}`, `Press pattern — 3 x ${repsVolume}`, `Pull pattern — 3 x ${repsVolume}`, `Loaded carry or core — 3 rounds`]
    };
    const homeBank = {
      push: [`Push-up progression — ${setsMain} x 8–15`, `Pike push-up — 3 x 6–12`, `Chair dips — 3 x 8–12`, `Slow tempo lateral raises if bands available — 3 x 15–20`],
      pull: [`Band row/backpack row — ${setsMain} x 10–15`, `Doorframe/towel row if safe — 3 x 8–12`, `Reverse snow angels — 3 x 12–20`, `Backpack curls — 3 x 10–15`],
      legs: [`Bulgarian split squat — ${setsMain} x 8–12/leg`, `Backpack Romanian deadlift — 3 x 10–15`, `Wall sit — 3 x 30–60 sec`, `Core circuit — 3 rounds`],
      full: [`Split squat — ${setsMain} x 8–12`, `Push-up progression — 3 x 8–15`, `Row variation — 3 x 10–15`, `Plank/dead bug — 3 rounds`]
    };
    const bank = home ? homeBank : gymBank;
    const type = /pull|back|arms/i.test(dayName) ? 'pull' : /lower|squat|deadlift|leg|posterior/i.test(dayName) ? 'legs' : /full|conditioning/i.test(dayName) ? 'full' : 'push';
    const cardio = input.track === 'shred' ? ['Finish: 15–25 min incline walk/bike or 8k–12k total daily steps'] : [];
    const limitNote = input.limit !== 'none' ? [`Modification: choose pain-free range because limitation = ${input.limit}`] : [];
    return [...bank[type], ...cardio, ...limitNote, `Progression: when all sets hit top reps with good form, add small weight or harder variation`, `Intensity: stop most sets with 1–3 reps in reserve`, rest];
  }

  function buildTrainingPlan(input){
    const template = TRAINING.templates[input.track] || TRAINING.templates.aesthetic;
    const days = template.split.slice(0, input.days).map((day, i)=>({
      title: `Day ${i+1} — ${day}`,
      items: makeExercises(input, day, i)
    }));
    const weekly = input.track === 'shred'
      ? ['Daily protein target: 1.6–2.2g/kg bodyweight', 'Aim for 7k–12k steps/day depending on recovery', 'Use cardio as support, not punishment']
      : input.track === 'strength'
        ? ['Track main lifts weekly', 'Prioritize sleep and longer rest periods', 'Keep assistance work controlled']
        : ['Prioritize form, full range and weekly volume', 'Train each muscle about 2x/week when possible', 'Keep pump work controlled and repeatable'];
    return {template, days, weekly};
  }

  window.generateModalPlan = function(){
    const input = getTrainingInputs();
    if(input.age && input.age < 13){ toast('Age requirement', 'FitBrand is 13+ with parent/guardian permission for users under 18.', 'error'); return; }
    const plan = buildTrainingPlan(input);
    if($('modalPlanTitle')) $('modalPlanTitle').textContent = `Your ${input.track.charAt(0).toUpperCase()+input.track.slice(1)} Plan`;
    if($('modalPlanSubtitle')) $('modalPlanSubtitle').textContent = `Built for ${input.place}, ${input.days} days/week, ${input.level}. Focus: ${input.focus}.`;
    if($('modalPlanPill')) $('modalPlanPill').textContent = `${input.days} DAYS / ${input.place.toUpperCase()}`;
    if($('modalPlanDays')) $('modalPlanDays').innerHTML = `
      <div class="fb-v37-source-card"><strong>Evidence-based rules used</strong><ul>${TRAINING.evidenceNotes.map(n=>`<li>${escapeHtml(n)}</li>`).join('')}</ul></div>
      ${plan.days.map(day=>`<div class="fb-plan-day"><h4>${escapeHtml(day.title)}</h4><ul>${day.items.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div>`).join('')}
      <div class="fb-v37-source-card"><strong>Weekly focus</strong><ul>${plan.weekly.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div>
    `;
    const text = `FITBRAND ${input.track.toUpperCase()} PLAN\n\n` + plan.days.map(d=>d.title+'\n'+d.items.map(x=>'- '+x).join('\n')).join('\n\n') + '\n\nEvidence notes:\n' + TRAINING.evidenceNotes.map(x=>'- '+x).join('\n');
    window.latestTrainingPlanText = text;
    $('modalPlanOutput')?.classList.add('show');
    $('modalPlanOutput')?.scrollIntoView({behavior:'smooth', block:'nearest'});
    toast('Plan generated', 'Your evidence-based FitBrand plan is ready.', 'success');
  };

  // Evidence-based meal plan override.
  function mifflin(weight, height, age, gender){
    return gender === 'female' ? (10*weight + 6.25*height - 5*age - 161) : (10*weight + 6.25*height - 5*age + 5);
  }
  function calorieTarget(weight,height,age,gender,goal,days,activity){
    const multiplier = activity === 'high' ? 1.7 : activity === 'low' ? 1.35 : days >= 5 ? 1.6 : days >= 3 ? 1.5 : 1.35;
    let kcal = mifflin(weight,height,age,gender) * multiplier;
    if(goal === 'fatloss') kcal -= 350;
    if(goal === 'muscle') kcal += 250;
    return Math.max(gender === 'female' ? 1300 : 1500, Math.round(kcal/50)*50);
  }
  function mealBank(diet, time){
    const quick = time === 'fast';
    const normal = [
      ['Breakfast', quick ? ['Greek yogurt/skyr','Oats or granola','Berries','Protein shake if needed'] : ['Oats','Greek yogurt or eggs','Berries','Peanut/almond butter']],
      ['Lunch', ['Chicken/tofu rice bowl','Mixed vegetables','Olive oil/avocado','Fruit']],
      ['Dinner', ['Lean protein','Potatoes/rice/pasta','Green vegetables','Simple sauce']],
      ['Snack', ['Protein yogurt or shake','Banana/apple','Rice cakes or nuts']],
      ['Extra meal', ['Wholegrain wrap','Turkey/chicken/tofu','Salad','Light dressing']]
    ];
    const veg = [
      ['Breakfast', ['Oats','Greek yogurt or soy yogurt','Berries','Seeds']],
      ['Lunch', ['Tofu/tempeh bowl','Rice or quinoa','Beans','Vegetables']],
      ['Dinner', ['Eggs/tofu/lentils','Potatoes or pasta','Salad']],
      ['Snack', ['Skyr/soy yogurt','Fruit','Protein shake if needed']],
      ['Extra meal', ['Lentil pasta','Tomato sauce','Vegetables']]
    ];
    const budget = [
      ['Breakfast', ['Oats','Milk/yogurt','Banana']],
      ['Lunch', ['Rice','Eggs/chicken/tuna/beans','Frozen vegetables']],
      ['Dinner', ['Potatoes/pasta','Lean protein','Frozen vegetables']],
      ['Snack', ['Skyr/yogurt','Fruit']],
      ['Extra meal', ['Wrap/sandwich','Protein source','Salad']]
    ];
    if(diet === 'vegetarian') return veg;
    if(diet === 'budget') return budget;
    return normal;
  }
  function getMealInputs(){
    return {
      goal: $('mealGoal')?.value || 'maintenance',
      gender: $('mealGender')?.value || 'male',
      age: Number($('mealAge')?.value || 18),
      weight: Number($('mealWeight')?.value || 75),
      height: Number($('mealHeight')?.value || 180),
      days: Number($('mealTrainingDays')?.value || 3),
      meals: Number($('mealMeals')?.value || 4),
      diet: $('mealDiet')?.value || 'normal',
      style: $('mealStyle')?.value || 'balanced',
      avoid: $('mealAvoid')?.value || '',
      time: $('mealTime')?.value || 'normal',
      activity: $('mealActivity')?.value || 'normal'
    };
  }
  window.generateMealPlan = function(){
    if(typeof window.syncMealWizardToReal === 'function') window.syncMealWizardToReal();
    const input = getMealInputs();
    if(!input.goal || !input.age || !input.weight || !input.height){ toast('Missing details','Fill in goal, age, weight and height first.','error'); return; }
    if(input.age < 13){ toast('Age requirement', 'FitBrand is 13+ with parent/guardian permission for users under 18.', 'error'); return; }
    const kcal = calorieTarget(input.weight,input.height,input.age,input.gender,input.goal,input.days,input.activity);
    const protein = Math.round(input.weight * (input.goal === 'fatloss' ? 2.0 : 1.8));
    const fat = Math.round((kcal * 0.25)/9);
    const carbs = Math.max(80, Math.round((kcal - protein*4 - fat*9)/4));
    const bank = mealBank(input.diet,input.time);
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day, idx)=>({
      day,
      meals: bank.map((m,i)=>bank[(i+idx)%bank.length]).slice(0,input.meals)
    }));
    const notes = [
      'Protein target is based on common sports-nutrition practice for preserving/gaining lean mass.',
      'Use this for 7–14 days, then adjust calories based on scale trend, performance and hunger.',
      input.goal === 'fatloss' ? 'If bodyweight does not move for 2 weeks, reduce 150–200 kcal or increase steps.' : '',
      input.goal === 'muscle' ? 'If bodyweight is not slowly increasing, add 150–250 kcal.' : '',
      input.avoid ? 'Avoid/replace: '+input.avoid+'.' : '',
      'General nutrition guidance only; not medical advice.'
    ].filter(Boolean);
    if($('mealOutputTitle')) $('mealOutputTitle').textContent = 'Your Evidence-Based FitBrand Meal Plan';
    if($('mealOutputSubtitle')) $('mealOutputSubtitle').textContent = `${kcal} kcal target • ${protein}g protein • ${input.meals} meals/day`;
    if($('mealOutputPill')) $('mealOutputPill').textContent = `${input.meals} MEALS / ${input.diet.toUpperCase()}`;
    if($('macroGrid')) $('macroGrid').innerHTML = [['Calories',kcal],['Protein',protein+'g'],['Carbs',carbs+'g'],['Fat',fat+'g']].map(x=>`<div class="macro-box"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');
    if($('mealDays')) $('mealDays').innerHTML = days[0].meals.map(m=>`<div class="meal-day-card"><h4>${escapeHtml(m[0])}</h4><ul>${m[1].map(i=>`<li>${escapeHtml(i)}</li>`).join('')}</ul></div>`).join('');
    if($('mealWeekPlan')) $('mealWeekPlan').innerHTML = days.map(d=>`<div class="meal-week-day"><h4>${d.day}</h4><div class="meal-week-meals">${d.meals.map(m=>`<div class="meal-mini"><strong>${escapeHtml(m[0])}</strong><span>${m[1].map(escapeHtml).join(' • ')}</span></div>`).join('')}</div></div>`).join('');
    if($('mealNotes')) $('mealNotes').innerHTML = `<strong>How to use it</strong><ul>${notes.map(n=>`<li>${escapeHtml(n)}</li>`).join('')}</ul>`;
    window.latestMealPlanText = `FITBRAND MEAL PLAN\nCalories: ${kcal}\nProtein: ${protein}g\nCarbs: ${carbs}g\nFat: ${fat}g\n\n` + days.map(d=>d.day+'\n'+d.meals.map(m=>'- '+m[0]+': '+m[1].join(', ')).join('\n')).join('\n\n') + '\n\nNotes:\n' + notes.map(n=>'- '+n).join('\n');
    $('mealOutput')?.classList.add('show');
    $('mealOutput')?.scrollIntoView({behavior:'smooth', block:'start'});
    toast('Meal plan generated', 'Your calorie, macro and 7-day plan is ready.', 'success');
  };

  function addSourceTrust(){
    if(document.querySelector('.fb-v37-evidence-strip')) return;
    const target = document.querySelector('.fb-purchase-hero, .hero-content, .section-head');
    if(!target) return;
    const strip = document.createElement('div');
    strip.className = 'fb-v37-evidence-strip';
    strip.innerHTML = '<span>Evidence-based training rules</span><span>Progressive overload</span><span>Calories + macros</span><span>13+ with guardian permission</span>';
    target.appendChild(strip);
  }

  function boot(){
    patchPaymentButtons();
    addSourceTrust();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.FitBrandGumroad = {open: openGumroad, patch: patchPaymentButtons};
})();
