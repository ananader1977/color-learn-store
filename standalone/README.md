# Color & Learn standalone sandbox backend

This provides a **completely Shopify-independent test environment**, separate from the public GitHub Pages storefront. It cannot process real money and does not pretend a simulated payment is gateway-confirmed.

## Deploy
Render Web Service: Node, repo `ananader1977/color-learn-store`, branch main, build command `echo ready`, start command `node standalone/server.js`; no dependencies required. Health: `/api/health`.

Configure these PRIVATE environment variables in Render:
- `ADMIN_UPLOAD_KEY` — strong random secret for protected PDF uploads
- `TEST_ACCESS_CODE` — separate strong random code for owner-only simulated test orders
- `DOWNLOAD_SIGNING_SECRET` — strong random HMAC key
- `PUBLIC_BASE_URL` — https://YOUR-SERVICE.onrender.com
- `RESEND_API_KEY` — API key from Resend transactional email service; optional but required for actual email
- `EMAIL_FROM` — verified sender, e.g. `Color & Learn <orders@your-verified-domain.example>`
- `COPY_MERCHANT_EMAIL=true` — send BCC order/delivery notice to `ananader2026@hotmail.com` when provider permits it
- `DATA_DIR` — writable private directory; default /tmp/color-learn-data (EPHEMERAL).
- `PERSISTENT_STORAGE=true` — set only after configuring an actually durable Render disk; not sufficient on its own.

### Usage
1. Browse hosted site and add Arabic books to cart.
2. Open `/standalone/checkout.html`. Owner uploads each book PDF with admin key and exact ID (`ar-0-3-5`, `ar-0-5-8`, `en-0-3-5`, etc.).
3. Owner enters test access code and real test email. Server records a simulated approval, generates expiring HMAC download links, and sends email through Resend **if configured**.
4. The downloadable PDFs are accessible only via server-validated signed links. They're NEVER served as public GitHub assets. Links expire after one hour.
5. For actual payments later, replace simulation with a payment provider's hosted checkout and **server-side signed payment webhook verification** before creating an order. Do NOT reuse the demo checkout for actual transactions.

### Important limitations
- No real payment gateway wired.
- Without Resend verification/API key no email will send.
- Free Render ephemeral storage can delete protected PDFs and test orders any time; use a paid persistent disk or private R2/S3 with durable database before real launch.
- Test access code is required, but still do not distribute it publicly.
- A frontend cannot send CC emails or securely verify financial transactions by itself.
- This sandbox cannot replace business licensing/compliance or actual payment merchant approval.
