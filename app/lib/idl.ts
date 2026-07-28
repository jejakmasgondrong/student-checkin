export const IDL = {
  "address": "DjWcuYf5QkPAPFPzyv4rgwk6oXELrjxZgodt2zkVrDuk",
  "metadata": { "name": "student_checkin", "version": "0.1.0", "spec": "0.1.0", "description": "Created with Anchor" },
  "instructions": [
    {
      "name": "check_in",
      "discriminator": [209, 253, 4, 217, 250, 241, 207, 50],
      "accounts": [
        {
          "name": "record",
          "writable": true,
          "pda": { "seeds": [{ "kind": "account", "path": "student" }] }
        },
        { "name": "student", "writable": true, "signer": true },
        { "name": "system_program", "address": "11111111111111111111111111111111" }
      ],
      "args": [{ "name": "name", "type": "string" }]
    }
  ],
  "accounts": [
    {
      "name": "CheckInRecord",
      "discriminator": [65, 180, 141, 52, 10, 170, 18, 193]
    }
  ],
  "errors": [
    { "code": 6000, "name": "InvalidName", "msg": "Name must be 1..=32 bytes." }
  ],
  "types": [
    {
      "name": "CheckInRecord",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "name", "type": "string" },
          { "name": "checked_in_at", "type": "i64" }
        ]
      }
    }
  ]
} as const;