# Trenchhub

Community platform built with Next.js.

## Vercel Setup (required env vars)

### 1. Database — Upstash Redis (KV)
Go to Vercel Dashboard → Storage → Create → KV (Upstash Redis) → Connect to project.

This auto-adds:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

### 2. Image Uploads — Vercel Blob
Go to Vercel Dashboard → Storage → Create → Blob → Connect to project.

This auto-adds:
- `BLOB_READ_WRITE_TOKEN`

Once both are connected, redeploy. Everything works.

## Local Dev

Create a `.env.local` file:
```
KV_REST_API_URL=your_upstash_url
KV_REST_API_TOKEN=your_upstash_token
BLOB_READ_WRITE_TOKEN=your_blob_token
```

Then `npm run dev`.
