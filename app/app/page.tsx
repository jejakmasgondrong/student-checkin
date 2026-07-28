"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Program, AnchorProvider, Idl, BorshCoder } from "@coral-xyz/anchor";
import { useCallback, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { IDL } from "@/lib/idl";

const PROGRAM_ID = new PublicKey(IDL.address);

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

  const getPda = useCallback((publicKey: PublicKey) => {
    return PublicKey.findProgramAddressSync(
      [publicKey.toBuffer()],
      PROGRAM_ID
    );
  }, []);

  const fetchRecord = useCallback(async () => {
    if (!wallet.publicKey) return;
    const [pda] = getPda(wallet.publicKey);
    try {
      const accountInfo = await connection.getAccountInfo(pda);
      if (!accountInfo) {
        setRecord(null);
        return;
      }
      const coder = new BorshCoder(IDL as unknown as Idl);
      const decoded = coder.accounts.decode("CheckInRecord", accountInfo.data);
      setRecord({
        name: decoded.name,
        checkedInAt: Number(decoded.checkedInAt),
      });
    } catch {
      setRecord(null);
    }
  }, [wallet.publicKey, connection, getPda]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const handleCheckIn = async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !name.trim()) return;
    setLoading(true);
    try {
      const provider = new AnchorProvider(connection, wallet as any, {});
      const program = new Program(IDL as unknown as Idl, provider);
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