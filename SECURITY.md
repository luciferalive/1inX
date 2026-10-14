# Security Policy

If you find a security problem, please **don't open a public issue**.
Use GitHub's "Report a vulnerability" button (Security tab) to tell the maintainers privately.

Notes for self-hosters:
- Only Supabase's *publishable* (anon) key belongs in client-side env vars. Protect data with Row Level Security.
- `SUPABASE_SERVICE_ROLE_KEY` is a secret. Keep it server-side and never commit it.
