# ClientVault — Frontend Prototype

Client-wise dashboard for projects, tasks, payment records, renewals and notes. This repository contains a **frontend-only demo**, not a production password manager.

## Run

```bash
npm install
npm run dev
```

## Deployment
Build command: `npm run build`; output directory: `dist`.

## Security notice
Demo data is saved in browser localStorage. **Do not store actual client passwords, confidential files, or customer information.** Secure admin authentication, Supabase Postgres/RLS, independently managed KMS, backups, audit logging and a security review remain unimplemented.

The original prototype ZIP is also available in the ChatGPT conversation.