# @loopmaster/loopmaster

The loopmaster app.

## Development

```
bun i
bun dev
```

## Deploy (Vercel)

Import this repository in [Vercel](https://vercel.com/new). The included `vercel.json` configures:

- Bun install + Vite build (`dist` output)
- SPA rewrites for client-side routes
- COOP/COEP/CORP headers required for SharedArrayBuffer / WASM

Set any `VITE_*` build env vars in the Vercel project settings. The Deno API (`bun run dev:api`) is separate from the static frontend deploy; add a rewrite or host `/api` elsewhere if you need the backend on the same domain.

## License

MIT
