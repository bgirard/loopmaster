# @loopmaster/loopmaster

The loopmaster app.

## Development

```
bun i
bun dev
```

## Deploy (Vercel)

Import this repository in [Vercel](https://vercel.com/new) with the GitHub integration. The included `vercel.json` configures:

- `npm ci` + Vite build (`dist` output)
- SPA rewrites for client-side routes
- COOP / COEP `credentialless` / CORP headers for SharedArrayBuffer / WASM without blocking CDN fonts and scripts

With Git connected, every pull request gets a preview deployment and Vercel posts the URL on the PR. Pushes to `main` deploy production.

Set any `VITE_*` build env vars in the Vercel project settings. The Deno API (`bun run dev:api`) is separate from the static frontend deploy; add a rewrite or host `/api` elsewhere if you need the backend on the same domain.

## License

MIT
