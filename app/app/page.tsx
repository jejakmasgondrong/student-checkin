"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { useCallback, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { IDL } from "@/lib/idl";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

interface CheckInRecord {
  name: string;
  checkedInAt: number;
}

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [name, setName] = useState("");
  const [record, setRecord] = useState<CheckInRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [txSig, setTxSig] = useState("");

  const getProvider = useCallback(() => {
    return new AnchorProvider(connection, wallet as any, {});
  }, [connection, wallet]);

  const getProgram = useCallback(() => {
    return new Program(IDL as unknown as Idl, getProvider());
  }, [getProvider]);

  const getPda = useCallback((publicKey: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [publicKey.toBuffer()],
      new PublicKey(IDL.address)
    );
  }, []);

  const fetchRecord = useCallback(async () => {
    if (!wallet.publicKey) return;
    const [pda] = getPda(wallet.publicKey);
    try {
      const program = getProgram();
      const account = await program.account.checkInRecord.fetch(pda);
      setRecord({
        name: account.name,
        checkedInAt: Number(account.checkedInAt),
      });
    } catch {
      setRecord(null);
    }
  }, [wallet.publicKey, getProgram, getPda]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const handleCheckIn = async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !name.trim()) return;
    setLoading(true);
    try {
      const program = getProgram();
      const tx = await program.methods.checkIn(name.trim()).rpc();
      setTxSig(tx);
      await fetchRecord();
      setName("");
    } catch (err: any) {
      alert(err.message || "Check-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Student Check-In</h1>
          <p className="text-sm opacity-70">Solana devnet — Anchor</p>
        </div>

        <div className="flex justify-center">
          <WalletMultiButton />
        </div>

        {wallet.publicKey && (
          <>
            <div className="p-4 rounded-lg border space-y-4">
              <h2 className="font-semibold">Check In</h2>
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
                disabled={loading || !name.trim()}
                className="w-full py-2 rounded bg-blue-600 text-white font-medium disabled:opacity-50"
              >
                {loading ? "Checking in..." : "Check In"}
              </button>
            </div>

            {txSig && (
              <p className="text-xs text-center break-all opacity-60">
                Tx: {txSig.slice(0, 32)}...
              </p>
            )}

            <div className="p-4 rounded-lg border space-y-2">
              <h2 className="font-semibold">Your Record</h2>
              {record ? (
                <div className="text-sm space-y-1">
                  <p>
                    <span className="opacity-60">Name:</span> {record.name}
                  </p>
                  <p>
                    <span className="opacity-60">Checked in:</span>{" "}
                    {new Date(record.checkedInAt * 1000).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm opacity-50">No record found. Check in above!</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}