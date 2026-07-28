# AGENTS.md -- student-checkin (devnet)

A Solana check-in program (Anchor + Rust). Devnet only.

## Stack & versions (do not drift)

- Anchor 1.0.0 (crate `anchor-lang`). Solana CLI Agave >= 2.0. Rust stable.
- Frontend: `@solana/web3.js`, `@solana/wallet-adapter-react`. Node 20 LTS.

## Build & test

- `anchor build` -- compile to BPF; writes the IDL to `target/idl/`.
- `anchor test` -- local validator + `tests/*.ts`. Green = 2 passing.
