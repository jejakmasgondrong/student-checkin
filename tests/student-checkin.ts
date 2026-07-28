import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StudentCheckin } from "../target/types/student_checkin";
import assert from "assert";

describe("student-checkin", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.StudentCheckin as Program<StudentCheckin>;

  it("checks in and stores the name", async () => {
    const [pda] = await anchor.web3.PublicKey.findProgramAddress(
      [provider.wallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods.checkIn("Ada").rpc();

    const record = await program.account.checkInRecord.fetch(pda);
    assert.equal(record.name, "Ada");
  });

  it("rejects a second check-in from the same wallet", async () => {
    await assert.rejects(
      () => program.methods.checkIn("Ada").rpc()
    );
  });
});