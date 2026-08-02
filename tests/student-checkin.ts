import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StudentCheckin } from "../target/types/student_checkin";
import assert from "assert";

const SECONDS_PER_DAY = 86400;

function today(): number {
  return Math.floor(Date.now() / 1000 / SECONDS_PER_DAY);
}

async function pdaFor(program: anchor.Program, key: anchor.web3.PublicKey, day: number) {
  return anchor.web3.PublicKey.findProgramAddress(
    [key.toBuffer(), new anchor.BN(day).toBuffer("le", 8)],
    program.programId
  );
}

describe("student-checkin", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.StudentCheckin as Program<StudentCheckin>;
  const day = today();

  it("checks in once per day and stores the name", async () => {
    const [pda] = await pdaFor(program, provider.wallet.publicKey, day);

    await program.methods.checkIn("Ada", new anchor.BN(day)).rpc();

    const record = await program.account.checkInRecord.fetch(pda);
    assert.equal(record.name, "Ada");
    assert.equal(record.day.toNumber(), day);
  });

  it("rejects a second check-in from the same wallet on the same day", async () => {
    await assert.rejects(
      () => program.methods.checkIn("Ada", new anchor.BN(day)).rpc()
    );
  });

  it("allows check-in again on a new day", async () => {
    const nextDay = day + 1;
    const [pda] = await pdaFor(program, provider.wallet.publicKey, nextDay);

    await program.methods.checkIn("Ada", new anchor.BN(nextDay)).rpc();

    const record = await program.account.checkInRecord.fetch(pda);
    assert.equal(record.name, "Ada");
    assert.equal(record.day.toNumber(), nextDay);
  });

  it("rejects an empty name", async () => {
    await assert.rejects(
      () => program.methods.checkIn("", new anchor.BN(day)).rpc()
    );
  });
});
