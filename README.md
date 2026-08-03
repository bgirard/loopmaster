# @loopmaster/loopmaster

The loopmaster app.

## Development

```
bun i
bun dev
```

## Deploy (Vercel)

The included `vercel.json` configures:

- npm install + Vite build (`dist` output)
- SPA rewrites for client-side routes
- COOP/COEP/CORP headers required for SharedArrayBuffer / WASM

### PR previews (recommended)

1. Import this repository at [vercel.com/new](https://vercel.com/new) (GitHub integration).
2. Leave production branch as `main`.

Vercel then creates a preview deployment for every pull request and posts the URL on the PR. Prefer this over the GitHub Actions workflows below so you do not get duplicate deployments.

### PR previews via GitHub Actions (optional)

If you want CI-driven deploys instead of the Vercel GitHub app:

1. Create the Vercel project and note its org/project ids (`vercel project ls` / project settings).
2. Create a token at [vercel.com/account/tokens](https://vercel.com/account/tokens).
3. Add repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
4. In the Vercel project Git settings, disable automatic deployments (or set Ignored Build Step to `exit 0`) so only Actions deploy.
5. Open or push to a PR — `.github/workflows/vercel-preview.yml` deploys a preview and comments the URL.

Production deploys on `main` use `.github/workflows/vercel-production.yml`.

Set any `VITE_*` build env vars in the Vercel project settings. The Deno API (`bun run dev:api`) is separate from the static frontend deploy; add a rewrite or host `/api` elsewhere if you need the backend on the same domain.

## License

MIT
