"use client";

import { useConnection, useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import idlJson from "@/idl/student_checkin.json";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const SECONDS_PER_DAY = 86400;

interface CheckInRecord {
  name: string;
  checkedInAt: number;
  day: number;
  publicKey: string;
}

function currentDay(): number {
  return Math.floor(Date.now() / 1000 / SECONDS_PER_DAY);
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleString();
}

function getErrorMessage(err: any): string {
  const msg: string = err?.message || String(err || "");
  const lower = msg.toLowerCase();

  if (
    lower.includes("account") &&
    (lower.includes("already") || lower.includes("exists") || lower.includes("in use"))
  ) {
    return "You have already checked in today. Please come back tomorrow!";
  }

  if (
    lower.includes("insufficient lamports") ||
    lower.includes("insufficient funds") ||
    lower.includes("0x1") ||
    lower.includes("attempt to debit") ||
    lower.includes("rent")
  ) {
    return "Insufficient SOL in your wallet. Add devnet SOL to your wallet and try again.";
  }

  if (lower.includes("user rejected") || lower.includes("rejected the request") || lower.includes("denied")) {
    return "Transaction was rejected. Please approve the request in your wallet and try again.";
  }

  if (
    lower.includes("blockhash") ||
    lower.includes("expired") ||
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("not confirmed")
  ) {
    return "Transaction timed out or expired. Please try again.";
  }

  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("connection") ||
    lower.includes("rpc") ||
    lower.includes("getaddrinfo")
  ) {
    return "Network or RPC error. Check your connection and try again.";
  }

  if (lower.includes("invalid name") || lower.includes("name must")) {
    return "Name must be between 1 and 32 characters.";
  }

  if (lower.includes("wallet") || lower.includes("not connected")) {
    return "Please connect your wallet first.";
  }

  return "Check-in failed. Please try again.";
}

export default function Home() {
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [record, setRecord] = useState<CheckInRecord | null>(null);
  const [allRecords, setAllRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const day = useMemo(() => currentDay(), []);

  useEffect(() => setMounted(true), []);

  const programId = useMemo(() => new PublicKey(idlJson.address), []);

  const getProgram = useCallback(() => {
    if (!anchorWallet) return null;
    const provider = new AnchorProvider(connection, anchorWallet, {});
    return new Program(idlJson as any, provider);
  }, [connection, anchorWallet]);

  const getPda = useCallback(
    (key: PublicKey, dayNumber: number) => {
      return PublicKey.findProgramAddressSync(
        [key.toBuffer(), new BN(dayNumber).toBuffer("le", 8)],
        programId
      );
    },
    [programId]
  );

  const fetchRecord = useCallback(async () => {
    if (!publicKey) return;
    const [pda] = getPda(publicKey, currentDay());
    const program = getProgram();
    if (!program) return;
    try {
      const account = await (program as any).account.checkInRecord.fetch(pda);
      setRecord({
        name: account.name,
        checkedInAt: Number(account.checkedInAt),
        day: Number(account.day),
        publicKey: pda.toString(),
      });
    } catch {
      setRecord(null);
    }
  }, [publicKey, getProgram, getPda]);

  const fetchAllRecords = useCallback(async () => {
    const program = getProgram();
    if (!program) return;
    setLoadingList(true);
    try {
      const accounts = await (program as any).account.checkInRecord.all();
      const records: CheckInRecord[] = accounts
        .map(({ publicKey: pk, account }: any) => ({
          name: account.name,
          checkedInAt: Number(account.checkedInAt),
          day: Number(account.day),
          publicKey: pk.toString(),
        }))
        .sort((a: CheckInRecord, b: CheckInRecord) => b.checkedInAt - a.checkedInAt);
      setAllRecords(records);
    } catch (err: any) {
      console.error("Error fetching records:", err);
      setError(err.message || "Failed to load student list");
    } finally {
      setLoadingList(false);
    }
  }, [getProgram]);

  useEffect(() => {
    if (connected) {
      fetchRecord();
      fetchAllRecords();
    }
  }, [connected, fetchRecord, fetchAllRecords]);

  const handleCheckIn = async () => {
    if (!anchorWallet || !publicKey || !name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const program = getProgram();
      if (!program) return;
      const today = currentDay();
      const sig = await program.methods.checkIn(name.trim(), new BN(today)).rpc();
      setTxSig(sig);
      await fetchRecord();
      await fetchAllRecords();
      setName("");
    } catch (err: any) {
      console.error("Check-in error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const todayString = new Date(day * SECONDS_PER_DAY * 1000).toDateString();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Student Check-In</h1>
          <p className="text-sm opacity-70">Solana devnet — Anchor</p>
          <p className="text-xs opacity-60">Today: {todayString}</p>
        </div>

        <div className="flex justify-center">
          <WalletMultiButton />
        </div>

        {mounted && publicKey && (
          <>
            <div className="p-4 rounded-lg border space-y-4">
              <h2 className="font-semibold">Check In</h2>
              {record ? (
                <div className="rounded bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-400">
                  You have already checked in today. Please come back tomorrow!
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Your name (max 32 chars)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={32}
                    className="w-full px-3 py-2 rounded border bg-transparent"
                  />
                  <button
                    onClick={handleCheckIn}
                    disabled={!connected || loading || !name.trim()}
                    className="w-full py-2 rounded bg-blue-600 text-white font-medium disabled:opacity-50"
                  >
                    {loading ? "Checking in..." : !connected ? "Connect wallet first" : "Check In Today"}
                  </button>
                  {error && <p className="text-xs text-red-400">{error}</p>}
                </>
              )}
            </div>

            {txSig && (
              <p className="text-xs text-center break-all opacity-60">
                Tx:{" "}
                <a
                  href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {txSig.slice(0, 8)}…
                </a>
              </p>
            )}

            <div className="p-4 rounded-lg border space-y-2">
              <h2 className="font-semibold">Your Record Today</h2>
              {record ? (
                <div className="text-sm space-y-1">
                  <p>
                    <span className="opacity-60">Name:</span> {record.name}
                  </p>
                  <p>
                    <span className="opacity-60">Checked in:</span> {formatDate(record.checkedInAt)}
                  </p>
                  <p>
                    <span className="opacity-60">Day:</span> {record.day}
                  </p>
                </div>
              ) : (
                <p className="text-sm opacity-50">
                  No record today. Check in above to get started!
                </p>
              )}
            </div>
          </>
        )}

        <div className="p-4 rounded-lg border space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">All Students</h2>
            {connected && (
              <button
                onClick={fetchAllRecords}
                disabled={loadingList}
                className="text-xs text-blue-400 underline disabled:opacity-50"
              >
                {loadingList ? "Refreshing..." : "Refresh"}
              </button>
            )}
          </div>
          {connected ? (
            allRecords.length > 0 ? (
              <ul className="text-sm space-y-2">
                {allRecords.map((r) => (
                  <li key={r.publicKey} className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs opacity-60">
                        {new Date(r.day * SECONDS_PER_DAY * 1000).toDateString()}
                      </p>
                    </div>
                    <p className="text-xs opacity-60">{formatDate(r.checkedInAt)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm opacity-50">
                {loadingList ? "Loading..." : "No students have checked in yet."}
              </p>
            )
          ) : (
            <p className="text-sm opacity-50">Connect wallet to view the student list.</p>
          )}
        </div>
      </div>
    </div>
  );
}
