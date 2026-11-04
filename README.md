# Color & Learn / لون وتعلّم

Bilingual static bookstore for children’s printable learning books at **www.anasnader.net**.

## Catalog
- 20 Arabic printable book listings (10 subjects, two age groups) — **AED 10** each.
- Six Arabic bundle listings — starter **AED 40**, discovery **AED 40**, complete set **AED 65** (each age group).
- 20 proposed English editions (coming soon; the separate English drafts require editorial review).
- Cover images sourced from the owner's connected Shopify catalog.
- Product PDFs are intentionally **not committed to this public repository**.

## Publish the website
1. In this repository open **Settings → Pages**.
2. Choose **Deploy from a branch**, then **main** and **/(root)**; save.
3. Under custom domain use **www.anasnader.net** (a CNAME file is committed).
4. In Cloudflare DNS, set **www** as a CNAME to **ananader1977.github.io** (DNS-only during setup). Check and preserve any existing DNS settings before changing them.
5. After the certificate is provisioned, turn on **Enforce HTTPS** in GitHub Pages.

## Checkout
**IMPORTANT: Real credit-card checkout is intentionally disabled.** Shopify catalog products were still DRAFT when retrieved. Before enabling real sales, publish the approved products, attach and test secure PDF delivery, configure a supported credit-card gateway, run a real **gateway test-mode** transaction, and verify order/receipt/download behavior.

The **Try demo card** button only simulates success locally with **4242 4242 4242 4242**, future expiry and a CVV. It does not communicate with a bank, save card data, or create an order. Do not enter real card information. The live payment button deliberately shows a disabled message.

## Contact
The contact page uses **ananader1@gmail.com**. Submitting the form opens the visitor’s default email application (mailto); it does not submit through a backend.

## Before launch
Check all Arabic books for cover punctuation and square-character issues, thoroughly review the English drafts, attach protected PDFs in Shopify, enable genuine card checkout, and verify DNS/HTTPS.

## Redeployment
GitHub Pages redeploy requested after the custom-domain DNS check succeeded on 2026-11-03. The site is served from the `main` branch, repository root.

## Two-copy license and protected delivery (Nov 4 2026)
- Storefront now displays **two personal-use printable copies included** for each purchased digital PDF. This is a permitted print count, **not** a promise of two physical shipments or a download limit of two.
- All 20 Arabic PDF products and 6 Arabic ZIP bundles have digital assets attached in Shopify (verified individually). They remain DRAFT.
- 20 English edition listings have been created in Shopify as DRAFT at AED 10 each. The English PDF drafts are in the separately provided `color-learn-english-20-drafts.zip` archive, but **they have not been attached to the Shopify variants** and remain under quality review.
- Do not commit paid PDFs into this public GitHub repo: GitHub Pages cannot enforce payment-gated access.
- To enable delivery: attach each English PDF through Shopify > Apps > Digital Products; use **Send automatically** after payment; enable the Digital Products block on both Shopify Thank you and Order status pages; test with Shopify payment gateway test mode and confirm delivery to customer email.
- Customer email should be collected at **Shopify hosted checkout**, not by an unauthenticated form that exposes paid PDFs. No downloads should appear merely because a user types an email address.
- Merchant requested copies of transaction/download communications at `ananader2026@hotmail.com`. Shopify Settings > Notifications > Staff notifications can send a **new-order alert** to that address; it is NOT a CC of the Digital Products customer email or a PDF attachment. A true duplicate digital-delivery email requires a separate automation and should not include a publicly shareable or reusable paid file link.
- Card payments are still disabled on the GitHub site until gateway and order delivery are verified. Nothing here claims a test transaction was completed.
