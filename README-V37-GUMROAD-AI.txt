FitBrand v37 — payment + evidence AI upgrade

What changed:
- Added Gumroad payment path without needing Stripe checkout yet.
- Added gumroad-config.js. Paste your real Gumroad product URL there.
- purchase-access.html now shows a Gumroad payment card plus manual request fallback.
- Training and meal generators are upgraded with evidence-based logic: progressive overload, frequency/volume guidance, calorie/macros, protein targets and safer notes.
- The AI/generator is still a static website generator. It does not browse the live internet itself. To make it use live AI/internet, you need a paid backend/API and moderation.

After upload:
1. Create Gumroad product: FitBrand Starter Access, recommended test price €4.99.
2. Copy the Gumroad product link.
3. Open gumroad-config.js and replace starterAccessUrl with your Gumroad URL.
4. Commit and redeploy.
5. Test purchase-access.html and recommended.html.

Important:
- If you are under 18, involve a parent/legal guardian for payouts and account verification.
- This is general fitness information, not medical advice.
