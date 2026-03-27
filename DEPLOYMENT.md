# VOID SUPPLY Deployment

## What is already safe

- The original connected Supabase project was not modified.
- The app now uses local browser storage by default.
- A separate backend only turns on if you add new `VITE_BEATS_*` env vars.

## 1. Separate Supabase project

1. Create a brand-new Supabase project for `VOID SUPPLY`.
2. Run the SQL in [backend/void-supply-separate-supabase.sql](/C:/Users/rin/Documents/New%20project/backend/void-supply-separate-supabase.sql).
3. Copy `.env.example` to `.env.local`.
4. Fill in:
   - `VITE_BEATS_SUPABASE_URL`
   - `VITE_BEATS_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_BEATS_STORAGE_BUCKET`

## 2. Payment links

Add any of these to `.env.local`:

- `VITE_STRIPE_CHECKOUT_URL`
- `VITE_CASHAPP_URL`
- `VITE_PAYPAL_URL`
- `VITE_APPLE_PAY_URL`
- `VITE_GOOGLE_PAY_URL`
- `VITE_BANK_TRANSFER_URL`

The checkout/payment buttons on the site will use those URLs automatically.

## 3. Deploy

This is a standard Vite app. You can deploy it to Vercel, Netlify, or Cloudflare Pages.

### Vercel

1. Import the repo/project folder.
2. Framework preset: `Vite`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add the same env vars from `.env.local`.

### Netlify

1. New site from repo.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add the same env vars.

## Local preview

- Dev server: `npm run dev`
- Default URL: `http://localhost:8080`
