use anchor_lang::prelude::*;

declare_id!("FhdBeBTPm5LKmwL2HEJgc567ZGa5Wy5JfZSiBfL1dvNL");

const MAX_NAME: usize = 32;

#[program]
pub mod student_checkin {
    use super::*;

    /// Records a check-in for `name` on a given epoch `day`.
    ///
    /// The PDA is derived from (student, day), so each student can check in
    /// at most once per day. A second check-in on the same day fails because
    /// the account already exists.
    pub fn check_in(ctx: Context<CheckIn>, name: String, day: i64) -> Result<()> {
        require!(!name.is_empty() && name.len() <= MAX_NAME, CheckInError::InvalidName);

        let record = &mut ctx.accounts.record;
        record.name = name;
        record.day = day;
        record.checked_in_at = Clock::get()?.unix_timestamp;
        msg!("{} checked in on day {}.", record.name, day);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, day: i64)]
pub struct CheckIn<'info> {
    #[account(
        init,
        seeds = [student.key().as_ref(), day.to_le_bytes().as_ref()],
        bump,
        payer = student,
        space = 8 + 4 + MAX_NAME + 8 + 8
    )]
    pub record: Account<'info, CheckInRecord>,
    #[account(mut)]
    pub student: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct CheckInRecord {
    pub name: String,
    pub checked_in_at: i64,
    pub day: i64,
}

#[error_code]
pub enum CheckInError {
    #[msg("Name must be 1..=32 bytes.")]
    InvalidName,
}
