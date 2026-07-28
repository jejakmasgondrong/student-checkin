# AGENTS.md -- student-checkin (devnet)

A Solana check-in program (Anchor + Rust). Devnet only.

## Stack and versions (do not drift)

- Anchor 1.0.0 (crate `anchor-lang`). Solana CLI Agave >= 2.0. Rust stable.
- Frontend: `@solana/web3.js`, `@solana/wallet-adapter-react`. Node 20 LTS.
- Package manager: npm

## Build & test

- `anchor build`
- `anchor test --validator legacy` -- 2 passing
