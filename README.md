# ClientVault — Production migration status

**Phase 1 code, not approved for credential storage.** Live client records are moved from localStorage to Supabase tables secured by owner-scoped RLS and MFA assurance-level checks. The original demo localStorage records are not automatically migrated. The integrated password vault, KMS, confidential file storage, scheduled reminders, and encrypted offsite backup are **not implemented**.

## Setup required

1. Create a Supabase project. Disable signups in Authentication settings. Create **one** admin account in Authentication → Users.
2. Enroll and verify a TOTP MFA factor for that user (Authentication MFA setup; the app includes a TOTP enrollment flow).
3. Run `supabase/migrations/001_core.sql` in SQL editor. Replace the placeholder in the final commented admin insert statement with the user's UUID and run that SQL statement. Do not commit UUID or credentials unnecessarily.
4. Set Vercel environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_ADMIN_USER_ID`. The publishable key is not secret; never use service-role keys in VITE_ variables.
5. Redeploy the app. Login with the single admin account; set up MFA and complete the challenge before accessing records.
6. Test permissions using a second **test** authenticated account: all reads/writes must return empty/denied, including forged owner IDs. Test token refresh, logouts, MFA and DB backups.
7. Back up all existing demo browser data manually before switching, if needed. No automatic import is provided.

### Security boundaries
- Browser uses Supabase Auth and anon/publishable key; RLS controls database writes/reads. The application additionally verifies the configured admin UUID for UX, but the DB's `private.app_admin` and `aal2` validation is authoritative.
- Access to saved data requires TOTP MFA (aal2); authentication without MFA cannot read/write rows.
- The vault is intentionally **not available** before an externally managed KMS, backend integration, audit logging, backups, and independent security review.
- Current schema stores simple project client labels, not relational foreign keys; this is an initial migration and should be normalized before a larger production rollout.
- Stored notes are not end-to-end encrypted. Do not store passwords, API tokens or sensitive client data.
- Supabase-managed Postgres backups and file backups must be configured and tested separately.
- Source is public. Never commit any environment secrets or private keys.

## Development
```sh
cp .env.example .env.local
npm install
npm run dev
npm run build
```

Vercel build command: `npm run build`; output: `dist`.
