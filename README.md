# ClientVault — Firebase-based Client Manager (Setup Required)

ClientVault is a React/Vite client management workspace with Firebase email/password authentication and Cloud Firestore records.

> **NOT approved for sensitive client data.** This version intentionally does not implement the encrypted credential vault, enforced MFA, private file uploads, scheduled reminders, audited backups or an independent security review. Never store credentials, API tokens or client secrets in fields or notes.

## Why no Vercel environment variables?
Firebase **Web App config is public project identification**, unlike a Firebase Admin SDK service-account key. It can be committed safely when Firestore security rules and authentication are configured correctly. Never commit private service-account credentials. Firebase may require billing for some features; review Firestore and Authentication plan limits.

## Setup (one-time)
1. Firebase Console -> Add project -> build a **Web App** (</> icon). Copy the Web SDK config values: apiKey, authDomain, projectId and appId.
2. Authentication -> Sign-in method -> enable **Email/Password**. Do not enable anonymous login or any public-facing signup UI. **Firebase Email/Password itself generally permits self-signup through the public API when enabled; the app relies on strict UID-locked Firestore rules to prevent new accounts reading client data.** If you require blocked account creation, implement privileged Auth blocking functions via Firebase Authentication with Identity Platform or another backend authorization mechanism.
3. Authentication -> Users -> Add user to create an administrator. Copy that user's **Firebase UID**. The old Supabase UID is not valid here.
4. In `src/firebase-config.js`, replace all placeholder values, including `ADMIN_UID`. Only put *Firebase Web SDK public config* and the non-secret UID into this file.
5. Edit `firestore.rules` to replace `REPLACE_FIREBASE_AUTH_ADMIN_UID` with the exact same UID, then **publish** the rules in Firebase Console -> Firestore Database -> Rules. You can also deploy them with Firebase CLI after configuring `.firebaserc`. **Do not proceed unless rules are published and tested.**
6. Firestore Database -> Create database (production mode) -> select a region. Firebase may require billing setup depending on current policy and selected region.
7. In Firebase Console -> Authentication -> Settings -> Authorized domains, add the deployed Vercel domain. Review phishing/email enumeration protection, session settings, account recovery and MFA requirements.
8. GitHub commit triggers Vercel build. No Vercel env vars are needed for this version because Firebase Web SDK config is provided in the repo.
9. Open deployed Vercel URL, sign in, add a **dummy** client, refresh, confirm persistence, delete it and verify deletion.

### Required security testing
- With Firebase emulator, verify: unauthenticated requests denied; a different UID denied for every collection; admin can create/query/delete own records; spoofed ownerId rejected; disallowed fields rejected; updates denied; other collections denied.
- Never use a public client configuration as proof of data authorization; only deployed Firestore rules enforce it.
- Before real customer records: implement backups/restore tests, MFA enforcement, rules regression tests, audit trails and data validation. Disable any unneeded Firebase Auth providers.
- No migration from Supabase data is performed by this change. Any existing Supabase project and Vercel integrations must be disconnected/deleted by the project owner only after verifying no needed data remains.

## Development
```bash
npm install
npm run dev
npm run build
```

## Vercel
Framework Vite, build `npm run build`, output `dist`.
