# Badr Clinic

Private anesthesia practice management PWA for individual anesthesiologists.
React + TypeScript + Tailwind + Supabase (Postgres, Auth, Storage, RLS).

## Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts, jsPDF
- **Backend**: Supabase (Postgres + Row Level Security, Google OAuth, Storage)
- **PWA**: vite-plugin-pwa (installable, offline app-shell caching, network-first API caching)

## 1. Set up Supabase

1. Create a new project at supabase.com.
2. In the SQL editor, run `supabase/schema.sql` (creates all tables, enums, RLS
   policies, triggers, views, and the `attachments` storage bucket).
3. In **Authentication → Providers**, enable **Google** and paste your OAuth
   client ID/secret (create these in Google Cloud Console → APIs & Services →
   Credentials → OAuth 2.0 Client ID, type "Web application", with your
   Supabase auth callback URL as an authorized redirect URI).
4. In **Authentication → URL Configuration**, add your deployed app URL (and
   `http://localhost:5173` for local dev) to Redirect URLs.
5. Copy your Project URL and anon public key into `.env.local` (see below).

## 2. Configure environment

```bash
cp .env.example .env.local
# fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GOOGLE_CLIENT_ID
```

## 3. Install & run

```bash
npm install
npm run dev
```

## 4. Build & deploy

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare
Pages). The app is installable on iOS/Android/desktop once served over HTTPS.

## Security model

Every clinical table (`cases`, `patients`, `facilities`, `case_revenue`,
`attachments`, `clinical_tags`, `research_collections`) carries an
`owner_id` column and a Row Level Security policy restricting all
select/insert/update/delete to rows where `owner_id = auth.uid()`. There is
no cross-user visibility anywhere in the schema — this is a single-tenant-
per-clinician data model, not a shared clinic database. Analytics views use
`security_invoker = true` so RLS is still enforced per caller.

Storage: patient attachments live in a private `attachments` bucket, keyed
by `{user_id}/{case_id}/{filename}`, with a storage policy that only allows
a user to read/write their own folder.

## Module map

| Module | Where |
|---|---|
| Dashboard (stats + 3 charts) | `src/pages/Dashboard.tsx`, `src/hooks/useDashboard.ts` |
| Cases (quick/advanced entry, completion score) | `src/pages/Cases.tsx`, `src/components/cases/` |
| Patients (search, autocomplete, timeline) | `src/pages/Patients.tsx` |
| Revenue (fee/adjustment engine, analytics) | `src/pages/Revenue.tsx` |
| Facilities (default deduction %) | `src/pages/Facilities.tsx` |
| Research (advanced filters + saved collections) | `src/pages/Research.tsx` |
| Attachments (clinically-important findings only) | `src/pages/CaseDetail.tsx` |
| PDFs (Financial vs Logbook, strictly separated) | `src/lib/pdf.ts` |
| Default libraries (ASA, anesthesia, tags) | `src/types/database.ts`, seeded via `seed_default_tags_for_user` SQL function |

## Notes on the completion score

Calculated server-side in `compute_case_completion()` (a Postgres function)
from 10 tracked optional fields (surgeon, diagnosis, medical history, ASA,
airway, anesthesia type, revenue, notes, tags, and at least one attachment).
It recalculates automatically via triggers on every case write and on
attachment add/remove, so the score shown in the UI is always authoritative
— never computed client-side and never stale.
