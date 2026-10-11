# ClientVault — React Demo with Supabase Admin Login

This is a demo workspace. It has an **email/password login and logout via Supabase Auth**, but its client data is still saved in browser localStorage; **do not use for real client data or credentials**.

## Setup

1. Create a [Supabase](https://supabase.com/dashboard) project.
2. In **Authentication → Providers → Email**, disable public signups / new user registration. Disable anonymous sign-ins if enabled.
3. In **Authentication → Users**, provision one verified admin user via the dashboard admin flow. Keep the password secret. For a production rollout, configure MFA and server-side access rules.
4. Copy this admin user's UUID from Authentication → Users.
5. Copy **Project URL** and the **publishable/anon** browser key from Supabase settings. Never use the service role or secret key in a VITE_ variable.
6. In Vercel → Project → Settings → Environment Variables add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_ADMIN_USER_ID` (UUID of the sole allowed admin)
7. Redeploy your Vercel project. Existing deployed bundles do not receive new build-time variables until redeployed.

For local development:
```bash
cp .env.example .env.local
# fill in the three variables
npm install
npm run dev
```
The login form is displayed only when configured. There is no public sign-up page, and non-admin user UUIDs are rejected by the React UI.

## IMPORTANT SECURITY LIMITATION
**The admin UUID gate in React is NOT server-side authorization.** The app currently has no private backend database; all demo records use localStorage and can be accessed or changed by anyone controlling their browser or visiting the same origin from that browser. Supabase authentication does not make localStorage secure, nor does it secure future database tables by itself.

Before storing real client records: move data to server-authorized storage, implement RLS/backend owner enforcement, MFA policies, credential KMS, activity logging, private files and tested backups. Never commit credentials or passwords to GitHub.

Logout ends the Supabase session in the current browser and hides the dashboard; already saved localStorage demo content remains on that browser. Clear it manually when using a shared device.

## Build
```bash
npm run build
```
Vercel preset: Vite · Build command: `npm run build` · Output directory: `dist`.
