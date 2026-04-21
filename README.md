# SIBA Academic Repository

A production-ready, centrally-managed academic resource repository built with Next.js 14 (App Router), Prisma ORM, PostgreSQL, and Tailwind CSS.

---

## Architecture Overview

```
Program → Semester → Course → Resources
```

- **Programs**: BBA (8 semesters), THP (4 semesters)
- **Resources**: Notes, Slides, Books, Past Papers, Assignments, Miscellaneous
- **File storage**: Archive.org (external links only — no file uploads to server)
- **Admin-only content management** — public users browse & download only

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + CSS Variables |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | NextAuth.js (credentials) |
| Deployment | Vercel |
| File Storage | Archive.org |

---

## Project Structure

```
siba-repo/
├── prisma/
│   ├── schema.prisma          # Full normalized DB schema
│   └── seed.ts                # Initial data (programs, semesters, admin)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Public homepage
│   │   ├── layout.tsx         # Root layout (fonts, providers)
│   │   ├── globals.css        # CSS custom properties + Tailwind
│   │   ├── not-found.tsx
│   │   ├── programs/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx   # Program → semester list
│   │   │       └── semesters/[number]/
│   │   │           ├── page.tsx  # Semester → course list
│   │   │           └── courses/[courseId]/page.tsx  # Course resources
│   │   ├── search/
│   │   │   └── page.tsx       # Full-text search + filters
│   │   ├── admin/
│   │   │   ├── layout.tsx     # Auth guard + sidebar layout
│   │   │   ├── login/page.tsx
│   │   │   ├── dashboard/page.tsx  # Analytics
│   │   │   ├── programs/page.tsx
│   │   │   ├── semesters/page.tsx
│   │   │   ├── courses/page.tsx
│   │   │   └── resources/
│   │   │       ├── page.tsx          # List + filters
│   │   │       ├── new/page.tsx      # Create form
│   │   │       ├── bulk-upload/page.tsx  # CSV import
│   │   │       └── [id]/edit/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── programs/route.ts
│   │       ├── semesters/route.ts
│   │       ├── courses/route.ts
│   │       ├── courses/all/route.ts
│   │       ├── resource-types/route.ts
│   │       ├── resources/route.ts       # GET list, POST create
│   │       ├── resources/[id]/route.ts  # GET, PATCH, DELETE
│   │       ├── resources/bulk/route.ts  # POST bulk import
│   │       └── admin/stats/route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Providers.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── ui/
│   │   │   ├── Breadcrumb.tsx
│   │   │   └── ResourceTypeBadge.tsx
│   │   ├── public/
│   │   │   └── SearchBar.tsx
│   │   └── admin/
│   │       ├── AdminSidebar.tsx
│   │       ├── AdminTopbar.tsx
│   │       ├── ResourceForm.tsx
│   │       └── AdminResourceDeleteButton.tsx
│   ├── lib/
│   │   ├── prisma.ts      # Prisma singleton
│   │   ├── auth.ts        # NextAuth config
│   │   └── adminGuard.ts  # API route auth helper
│   └── types/index.ts
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Local Development Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd siba-repo
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/siba_repo"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_SEED_PASSWORD="YourSecurePassword123"
```

### 3. PostgreSQL Setup

**Option A — Local PostgreSQL:**
```bash
# macOS
brew install postgresql@16 && brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql && sudo service postgresql start

# Create database
psql -U postgres -c "CREATE DATABASE siba_repo;"
```

**Option B — Docker:**
```bash
docker run --name siba-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=siba_repo \
  -p 5432:5432 \
  -d postgres:16
```

### 4. Database Migration & Seed

```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed initial data
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Admin panel:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)  
**Default credentials:** `admin@siba.edu.pk` / (your `ADMIN_SEED_PASSWORD`)

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "initial commit"
git remote add origin https://github.com/yourusername/siba-repo.git
git push -u origin main
```

### 2. Create PostgreSQL Database

Use [Neon](https://neon.tech) (recommended for Vercel), [Supabase](https://supabase.com), or [Railway](https://railway.app):

```bash
# Neon (easiest for Vercel)
# 1. Create account at neon.tech
# 2. Create new project → copy connection string
# Format: postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### 3. Deploy to Vercel

```bash
npx vercel --prod
```

Or connect GitHub repo via [vercel.com/new](https://vercel.com/new).

**Environment Variables to set in Vercel dashboard:**

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random 32+ char string |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` |

### 4. Run Migrations on Production

```bash
# Set DATABASE_URL to production URL temporarily
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npx prisma db seed
```

Or use Vercel CLI:
```bash
vercel env pull .env.production.local
npx prisma db push
npx prisma db seed
```

---

## API Reference

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/programs` | List all programs |
| GET | `/api/semesters?program={slug}` | List semesters |
| GET | `/api/courses?semesterId={id}` | List courses |
| GET | `/api/resources?q=&program=&semester=&type=&courseId=&page=` | Search resources |
| GET | `/api/resources/{id}` | Get single resource |
| GET | `/api/resource-types` | List resource types |

### Admin Endpoints (require authentication)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/resources` | Create resource |
| PATCH | `/api/resources/{id}` | Update resource |
| DELETE | `/api/resources/{id}` | Delete resource |
| POST | `/api/resources/bulk` | Bulk import (up to 100) |
| GET | `/api/admin/stats` | Dashboard analytics |

---

## Adding Resources via Archive.org

1. Upload your file to [archive.org/upload](https://archive.org/upload)
2. After upload, go to the item page and copy the **download URL**
   - Format: `https://archive.org/download/{identifier}/{filename}`
3. In the admin panel → Resources → Add Resource, paste this URL in the **File URL** field

---

## Bulk Upload CSV Format

```csv
title,description,fileUrl,fileSize,year,typeSlug,courseCode,semesterNumber,programSlug,tags
"MGT Notes Ch1-5","Lecture notes","https://archive.org/download/.../notes.pdf","2MB",,"notes","MGT-101","1","bba","management"
```

**typeSlug values:** `notes`, `slides`, `books`, `past-papers`, `assignments`, `miscellaneous`

---

## Extending the Repository

### Adding a New Program

1. Admin Panel → Programs → Add Program
2. Admin Panel → Semesters → Add Semester (repeat per semester)
3. Admin Panel → Courses → Add Course (repeat per course)

### Adding New Resource Types

Update `prisma/seed.ts` → `resourceTypes` array, then re-run seed.

---

## Notes on Design

- **Dark/light mode** — saved to `localStorage`, respects system preference on first load
- **Fonts** — Syne (UI), DM Serif Display (headings), JetBrains Mono (code/metadata)
- **Color system** — CSS custom properties allow full theme switching without class duplication
- **No file uploads** — all files are Archive.org links; no storage infrastructure needed

---

> This repository is currently in a pilot phase focused on **BBA** and **THP**. It will be expanded into a comprehensive academic repository covering all programs and departments.
