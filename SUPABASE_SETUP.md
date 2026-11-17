# Hosting the GNUTS database on Supabase

The site works with Supabase (PostgreSQL). It picks the database type from `DATABASE_URL`
automatically, so there is nothing else to switch.

## 1. Create the Supabase project
1. Sign in at [supabase.com](https://supabase.com) and click **New project**.
2. Name it (e.g. `gnuts`), choose a **strong database password** and save it somewhere safe.
3. Pick the region closest to your visitors (Europe, e.g. Frankfurt or London, is closest to Ghana).

## 2. Copy the connection string
1. In the project, click **Connect** (top bar), or go to **Project Settings → Database**.
2. Under **Connection string**, choose **Transaction pooler** (port **6543**).
   This is the right one for Vercel/Netlify, where many short-lived servers connect.
3. Copy it and replace `[YOUR-PASSWORD]` with your database password. It looks like:

   ```
   postgresql://postgres.abcdefghijk:YOUR_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

   If your password contains special characters such as `@`, `#` or `/`, URL-encode them
   (for example `@` becomes `%40`).

## 3. Add it to your host (Vercel)
In **Vercel → your project → Settings → Environment Variables** set:

| Name | Value |
|---|---|
| `DATABASE_URL` | the Transaction pooler connection string from step 2 |
| `SESSION_SECRET` | a random string of 32+ characters |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | the first Super Admin account (password 8+ characters) |

Then go to **Deployments → ⋯ → Redeploy**.

## 4. Load your content (browser only, no terminal)
1. In the project folder, open **`supabase-import.sql`** in any text editor (Notepad works) and
   copy everything (Ctrl+A, Ctrl+C). It holds all the tables plus your current content: news,
   scholarships, resources, About page, history, page banners and site settings.
2. In Supabase, open **SQL Editor** (left sidebar) → **New query**.
3. Paste (Ctrl+V) and click **Run**. You should see **Success. No rows returned**.

Running it again is safe: it updates rows instead of duplicating them. If Supabase warns that
the query contains destructive operations (the file drops and recreates its own small
`updated_at` triggers), confirm and run.

## 5. Sign in (creates your admin account)
Open `https://YOUR-SITE/admin/login` and sign in with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
On a brand-new database the first sign-in automatically creates any missing tables and your
Super Admin account, then logs you in. Create other accounts later under **Users**.

Check it worked: open **Users**; the banner should say **Live PostgreSQL (Supabase) connected**,
and your news posts should be on the home page (pages refresh within about 15 seconds).

> Skipped step 4? The site still works: the first sign-in creates empty tables and starter
> content, and you can run the SQL file later to add your saved content.

## Alternative: terminal commands
If you prefer the terminal instead of steps 4 and 5:

- **Create tables:** set `INIT_DB_TOKEN` in Vercel, redeploy, then (PowerShell):
  ```powershell
  Invoke-RestMethod -Method Post -Uri "https://YOUR-SITE/api/admin/init-db" -Headers @{ "x-init-token" = "YOUR_INIT_DB_TOKEN" }
  ```
- **Copy content** (preview first, then `--apply`):
  ```powershell
  $env:DATABASE_URL = "postgresql://postgres.abcdefghijk:YOUR_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
  npm run db:copy-local
  npm run db:copy-local -- --apply
  ```
- **Recreate the SQL file** after your local content changes: `npm run db:export-sql`

Either way: old local user accounts are not copied (they have plain-text default passwords),
and uploaded images in `public/uploads` are already on GitHub, so they keep working.

## Good to know
- **Security:** every table has Row Level Security switched on with no policies, so Supabase's
  automatic public REST API cannot read or change anything. The website connects as the
  database owner and is not affected. Do not add policies or publish your Supabase API keys
  unless you deliberately want public API access.
- **Free plan pausing:** free Supabase projects pause after about a week without any database
  activity. A live site with visitors keeps it active; if it ever pauses, restore it from the
  Supabase dashboard.
- **Backups:** Supabase dashboard → Database → Backups. The admin panel's backup export also
  still works.
- **Images and files** are not stored in Supabase; they go to ImageKit (`IMAGEKIT_*` variables).
