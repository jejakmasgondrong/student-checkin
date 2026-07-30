# AGENTS.md — student-checkin frontend (devnet)

A Next.js frontend that calls the deployed `student_checkin` Anchor program.
Devnet only.

## Stack & versions (do not drift)

- `@coral-xyz/anchor` ^0.32.1 · `@solana/web3.js` ^1.98.4 · `@solana/wallet-adapter-react` 0.15.x
- Node 20 LTS, Next.js 16+ (App Router), Tailwind CSS v4

## Rules

- Read the deployed interface from the IDL (`lib/idl.ts`) — NEVER hardcode instruction names or account layouts.
- Sign via `@solana/wallet-adapter-react` (`useWallet`, `useAnchorWallet`). The frontend holds NO private key.
- Derive PDAs with `PublicKey.findProgramAddressSync` using the program's seeds.
- All RPC to devnet, never mainnet. RPC endpoint from `NEXT_PUBLIC_RPC_URL` env var (defaults to `https://api.devnet.solana.com`).

## Anti-hallucination

- NEVER invent package / SDK / instruction names. Real ones only.
- Unsure a name exists? STOP and ask — don't `npm install` an invented dependency.

## Security

- NEVER hardcode / commit a keypair or seed phrase. `.env` is gitignored.
- Devnet only. The program ID comes from the IDL, not a hardcoded constant.
