# DocSign — Document Signature App (DocuSign Clone)

A full‑stack MERN‑Supabase application that lets users upload PDF documents, drag‑and‑drop signatures, invite external signers via email links, and download the final signed PDF––all with an audit trail.

---

## ✨ Features

| Category         | Highlights                                                                      |
| ---------------- | ------------------------------------------------------------------------------- |
| **Auth**         | Email‑OTP registration, JWT login (HTTP‑only cookie)                            |
| **Documents**    | PDF upload (Supabase Storage), list, delete                                     |
| **Signatures**   | Save personal signature images, place signatures (x, y, page), real‑time status |
| **Public Links** | Send secure email link, external signer signs without account                   |
| **Audit Trail**  | Immutable log with IP/timestamp per action                                      |
| **Tech**         | Express 18 · Vite/React · Supabase (Postgres + Storage) · Tailwind CSS          |

---

## 🛠 Tech Stack

* **Frontend** : Vite + React 18, Axios, Tailwind CSS
* **Backend** : Express Router, Multer, Nodemailer, `@supabase/supabase-js`
* **Database** : Supabase (PostgreSQL) with Row‑Level Security
* **Storage** : Supabase Storage bucket `documents`

---

## 🚀 Local Setup

### Prerequisites

| Tool                    | Version |
| ----------------------- | ------- |
| Node                    | ≥ 18.x  |
| npm                     | ≥ 9.x   |
| Supabase CLI (optional) | ≥ 1.x   |

### 1. Clone & Install

```bash
# clone repo
$ git clone https://github.com/yourname/docsign.git
$ cd docsign

# install backend deps
$ cd server && npm install

# install frontend deps
$ cd ../client && npm install
```

### 2. Create Supabase Project

1. [Sign in](https://supabase.com) → **New project** → set DB password
2. In SQL Editor run:

```sql
create extension if not exists "uuid-ossp";

-- users table
create table users (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text unique not null,
  password text not null,
  created_at timestamptz default now()
);
-- otps, documents, signatures, saved_signatures, public_signature_requests, audit_logs
-- (full schema in /server/docs/schema.sql)
```

3. Create **Storage** bucket `documents` (public).

### 3. Environment Variables

Create `server/.env`:

```env
PORT=5000
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=<service_role_key>
JWT_SECRET=super_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=xxxxxxxxxxxxxxxx   # Gmail App Password
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Run Locally

```bash
# start backend
$ cd server && npm run dev

# start frontend (dev server on :5173)
$ cd ../client && npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)**.

---

## 📜 Supabase Schema (SQL)

A condensed version is below; see `server/docs/schema.sql` for full.

```sql
-- documents
create table documents (
  id uuid primary key default uuid_generate_v4(),
  filename text,
  filepath text,
  uploaded_by uuid references users(id) on delete cascade,
  uploaded_at timestamptz default now()
);
-- signatures
create table signatures (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid references documents(id) on delete cascade,
  user_id uuid references users(id),
  x numeric,
  y numeric,
  page int,
  sign_status text default 'pending',
  created_at timestamptz default now()
);
```

---

## 📦 Scripts

| Location  | Command         | Purpose                       |
| --------- | --------------- | ----------------------------- |
| `/server` | `npm run dev`   | Nodemon backend with autosave |
| `/client` | `npm run dev`   | Vite dev server               |
| `/client` | `npm run build` | Prod build assets             |

---

## 🏗️ Deployment

1. Deploy backend to **Render** (Node service) → set env vars.
2. Add CORS origin of Vercel site.
3. Deploy frontend to **Vercel** → set `VITE_API_BASE_URL` to Render URL.

---

## 📝 License

MIT © 2025 Kiran Kumar Behera
