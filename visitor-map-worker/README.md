# Visitor Map Worker

This folder contains a minimal Cloudflare Worker + D1 backend for the visitor map module added to the site.

It is designed for a statically hosted site:

- the Jekyll site sends a lightweight `POST /api/visit` request from the browser
- the Worker resolves approximate geolocation from Cloudflare request metadata
- the Worker stores only a salted hash of the visitor IP, not the raw IP address
- the about page fetches `GET /api/visitors` and renders the world map with Plotly

## Files

- `src/index.js`: Worker API
- `schema.sql`: D1 schema
- `wrangler.jsonc`: deployment config

## Deploy

1. Create a D1 database.
2. Put the returned `database_id` into `wrangler.jsonc`.
3. Run the schema against the database.
4. Add a secret salt for hashing IP addresses.
5. Deploy the Worker.
6. Copy the Worker URL into `visitor_map.api_url` in the site's `_config.yml`.

Typical Wrangler commands:

```bash
wrangler d1 create visitor-map
wrangler d1 execute visitor-map --remote --file schema.sql
wrangler secret put VISITOR_SALT
wrangler deploy
```

## GitHub Actions deployment

This repo also includes `.github/workflows/deploy-visitor-map-worker.yml`.

To use it, add these GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VISITOR_SALT`

Then update `wrangler.jsonc` with your real D1 `database_id` and push changes under `visitor-map-worker/`.

## Notes

- Set `ALLOWED_ORIGIN` in `wrangler.jsonc` to your production site origin.
- The frontend tracker currently records one visit per browser roughly every 6 hours.
- If you prefer a different backend, keep the same response shape from `GET /api/visitors` and the site module will still work.
