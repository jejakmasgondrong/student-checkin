use anchor_lang::prelude::*;

declare_id!("DjWcuYf5QkPAPFPzyv4rgwk6oXELrjxZgodt2zkVrDuk");

const MAX_NAME: usize = 32;

#[program]
pub mod student_checkin {
    use super::*;

    pub fn check_in(ctx: Context<CheckIn>, name: String) -> Result<()> {
        require!(!name.is_empty() && name.len() <= MAX_NAME, CheckInError::InvalidName);
        let record = &mut ctx.accounts.record;
        record.name = name;
        record.checked_in_at = Clock::get()?.unix_timestamp;
        msg!("{} checked in on-chain.", record.name);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CheckIn<'info> {
    #[account(
        init,
        seeds = [student.key().as_ref()],
        bump,
        payer = student,
        space = 8 + 4 + MAX_NAME + 8
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
}

#[error_code]
pub enum CheckInError {
    #[msg("Name must be 1..=32 bytes.")]
    InvalidName,
}