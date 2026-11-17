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
| `INIT_DB_TOKEN` | another random string (16+ characters) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | the first Super Admin account |

Then click **Redeploy**.

## 4. Create the tables (once)
```bash
curl -X POST https://YOUR-SITE/api/admin/init-db -H "x-init-token: YOUR_INIT_DB_TOKEN"
```
In Windows PowerShell:
```powershell
Invoke-RestMethod -Method Post -Uri "https://YOUR-SITE/api/admin/init-db" -Headers @{ "x-init-token" = "YOUR_INIT_DB_TOKEN" }
```
This creates all tables, the first admin account and starter content. It is safe to run again.

Check it worked: sign in at `/admin/login`, then open **Users**; the banner should say
**Live PostgreSQL (Supabase) connected**.

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
