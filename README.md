# NWSmartInvitation

A digital event card & guest check-in system: create an event, pick a card template, add guests, and let every guest carry a signed, single-use QR code that verifies them at the door.

Branding, favicon, and card watermark use the NWSmartInvitation logo (`public/logo.png`).

## What's built so far

- **Auth** — register, login, forgot/reset password, JWT (access + refresh) in httpOnly cookies, bcrypt hashing, CSRF (double-submit cookie), per-route rate limiting, audit log.
- **Events** — create / edit / delete, cover image upload, plan-based event limits.
- **Templates** — 9 seeded templates (Wedding, Birthday, Conference, Church, VIP, Corporate, Graduation, Modern Minimal, Luxury Gold), stored as data so the card auto-renders from the layout, not hardcoded HTML.
- **Guests** — add manually or import a CSV, with validation, de-duplication, and a per-row error report.
- **QR system** — each guest gets an HMAC-signed, single-use token. Check-in is an atomic DB update, so two scanners hitting the same code at the same instant can't both succeed.
- **Scanner** — camera-based page at `/scanner` with live ✅ Allow Entry / ❌ Already Checked In / ❌ Invalid QR Code states.
- **Guest card page** — public link per guest (`/invite/[qrToken]`) with Download PDF / Download PNG.
- **Dashboard** — totals for events, guests, checked-in, pending.
- **Billing** — Free / Basic / Premium plans + 50-guest top-ups in TZS, mobile money reference submission, admin confirmation queue.
- **Admin panel** — confirm/reject pending payments.

Payout mobile number, payout name, and pricing are **not hardcoded** — they live in the `Setting` table (seeded from `.env` defaults) so you can change them from the database at any time without touching code.

---

## 1. Prerequisites

- Node.js 18.18+ (20 LTS recommended)
- PostgreSQL installed and running locally (you said this is already done ✅)
- npm

## 2. Install dependencies

```bash
cd nwsmartinvitation
npm install
```

This also runs `prisma generate` automatically (via the `postinstall` script).

## 3. Create the PostgreSQL database

Open `psql` (or any Postgres GUI like pgAdmin/TablePlus) and run:

```sql
CREATE DATABASE nwsmartinvitation;
CREATE USER nwsi_user WITH ENCRYPTED PASSWORD 'choose-a-strong-password';
GRANT ALL PRIVILEGES ON DATABASE nwsmartinvitation TO nwsi_user;
```

(If you'd rather use your existing postgres superuser locally, you can skip creating a new user and just use that account below.)

## 4. Configure your `.env` file

Copy the example file:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
DATABASE_URL="postgresql://nwsi_user:choose-a-strong-password@localhost:5432/nwsmartinvitation?schema=public"

JWT_ACCESS_SECRET="generate-a-long-random-string"
JWT_REFRESH_SECRET="generate-a-different-long-random-string"
QR_SIGNING_SECRET="generate-another-long-random-string"
CSRF_SECRET="and-one-more"

NEXT_PUBLIC_APP_NAME="NWSmartInvitation"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

DEFAULT_PAYOUT_MOBILE_NUMBER="0768940971"
DEFAULT_PAYOUT_NAME="Amon Maganya"
DEFAULT_PRICE_PER_50_GUESTS_TZS="25000"
```

To generate a strong random secret on any machine with Node installed:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run that four times for the four secrets above — never reuse the same value twice, and never commit `.env` to git (it's already in `.gitignore`).

## 5. Run migrations

This creates all the tables (`User`, `Event`, `Template`, `Guest`, `CheckinLog`, `Payment`, `AuditLog`, `Setting`) from `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name init
```

## 6. Seed sample data

```bash
npm run prisma:seed
```

This seeds:
- The 9 card templates
- Default settings (payout number/name, pricing, plan limits) from your `.env`
- Two demo accounts:
  - **Admin:** `admin@nwsmartinvitation.com` / `Admin@12345`
  - **Demo organizer:** `owner@example.com` / `Owner@12345`

> ⚠️ These are demo credentials for local development only. Change or remove them before deploying anywhere public.

## 7. Start the application

```bash
npm run dev
```

Visit `http://localhost:3000`.

- Log in as the demo organizer, create an event, pick a template, add a guest (or import a CSV), then open that guest's `/invite/[token]` link to see the card and QR code.
- Open `/scanner` in another tab (or on your phone, once deployed with HTTPS — most mobile browsers require a secure origin for camera access) and scan the QR to see the live check-in states.
- Log in as the admin account and go to **Admin** in the sidebar to confirm a submitted mobile money payment.

## Useful commands

```bash
npm run db:studio        # visual DB browser (Prisma Studio)
npm run prisma:migrate   # create/apply a new migration after editing schema.prisma
npm run build && npm start   # production build
```

## Notes for production

- **File storage:** cover images currently save to `public/uploads` on local disk. Swap `src/app/api/uploads/cover/route.ts` for an S3-compatible upload before deploying to a platform with an ephemeral filesystem (e.g. Vercel).
- **Rate limiting:** currently in-memory (fine for one server instance). If you run multiple instances, swap `src/lib/rateLimit.ts` for a Redis-backed limiter with the same function signature.
- **Payments:** the mobile money flow is manual-confirmation (organizer pays, submits a reference, admin confirms). When you're ready to automate reconciliation, integrate Selcom / ClickPesa / Beem Africa's API in `src/app/api/admin/payments/[id]/route.ts` and auto-trigger confirmation from their webhook.
- **Password reset delivery:** `src/app/api/auth/forgot-password/route.ts` generates a real, secure reset token but currently only logs the link to the server console. Wire up an email (Resend/Postmark) or SMS provider there before going live.
