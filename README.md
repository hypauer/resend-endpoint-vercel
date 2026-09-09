# Resend ↔ Framer Endpoint

A tiny serverless function that receives your Framer "Request Access" form
submission and emails a notification to **mario@hypauer.com** using
[Resend](https://resend.com).

## 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 2. Deploy to Vercel

1. Go to https://vercel.com/new and import the GitHub repo you just created.
2. Before deploying, open **Environment Variables** and add:
   - `RESEND_API_KEY` → your key from https://resend.com/api-keys
3. Click **Deploy**.
4. Once it's live, your endpoint will be at:
   ```
   https://YOUR_PROJECT.vercel.app/api/send-email
   ```

## 3. Connect it to your Framer form

1. Open your Framer project and select the form on the canvas.
2. In the right sidebar, next to **Send To**, click **Add…** → **Webhook**.
3. Paste your endpoint URL: `https://YOUR_PROJECT.vercel.app/api/send-email`
4. Publish your site.

Note: webhooks only fire on the **published** site, not in Framer's preview mode.

## 4. About the "from" address

Right now the function sends from Resend's shared testing address
(`onboarding@resend.dev`). Resend only lets unverified accounts send **to
the email address on the Resend account itself** — so this works out of
the box as long as your Resend account is signed up with
`mario@hypauer.com`.

For a more reliable, branded setup:

1. Go to https://resend.com/domains and add + verify a domain you own
   (adds a couple of DNS records).
2. In `api/send-email.js`, change:
   ```js
   const FROM_EMAIL = 'Access Requests <onboarding@resend.dev>';
   ```
   to something like:
   ```js
   const FROM_EMAIL = 'Access Requests <requests@yourdomain.com>';
   ```
3. Commit, push, and Vercel will auto-redeploy.

## 5. Test it

Submit the live form once and check the inbox at mario@hypauer.com. If
nothing arrives, check the function logs in your Vercel dashboard
(Project → Deployments → the latest deployment → Functions) for the
exact error Resend returned.
