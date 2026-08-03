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
- SPA rewrites for client-side routes (API paths under `/api` are left alone)
- COOP/COEP/CORP headers required for SharedArrayBuffer / WASM

Set any `VITE_*` build env vars in the Vercel project settings. The Deno API (`bun run dev:api`) is separate from the static frontend deploy; point `/api` at your API host if you run it elsewhere.

## License

MIT
