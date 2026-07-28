# AGENTS.md -- student-checkin (devnet)

A Solana check-in program (Anchor + Rust) with Next.js frontend. Devnet only.

## Stack & versions (do not drift)

- Anchor 1.0.0 (crate `anchor-lang`). Solana CLI Agave >= 2.0. Rust stable.
- Frontend: Next.js 16, `@solana/web3.js` v1, `@solana/wallet-adapter-react`, `@coral-xyz/anchor`. Node 20 LTS.
- Package manager: npm

## Structure

```
├── programs/student-checkin/   Anchor program (Rust)
├── app/                        Next.js frontend
├── tests/                      Anchor test (TS)
└── Anchor.toml                 Anchor config (devnet)
```

## Build & test

- `anchor build` -- build program
- `anchor test --validator legacy` -- 2 passing
- `cd app && npm run dev` -- frontend dev server
- `cd app && npm run build` -- frontend prod build

## Deploy

- `anchor deploy` -- deploy program to devnet (requires devnet SOL)
- Frontend deployed separately (Vercel or similar)

## Frontend pages

- `/` -- check-in form + record display (wallet required)

## Status

- Program: ✅ complete, 2 passing tests
- Frontend: ✅ built, wallet connect + check-in UI
- Deploy program: ✅ deployed to devnet — Program ID `DjWcuYf5QkPAPFPzyv4rgwk6oXELrjxZgodt2zkVrDuk`
- Deploy frontend: ✅ Vercel — https://student-checkin-superteam.vercel.app
- Version: v0.3.0