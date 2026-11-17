#!/usr/bin/env node
/**
 * Copies the content of the local data file (data/gnuts_db.json) into a PostgreSQL /
 * Supabase database: news, scholarships, resources, About page, history, banners,
 * site settings and the audit log.
 *
 * SAFE BY DEFAULT: without --apply it only shows what it would do and changes nothing.
 *
 * Before running: create the tables once with POST /api/admin/init-db (see SUPABASE_SETUP.md).
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL = "postgresql://...pooler.supabase.com:6543/postgres"
 *   node scripts/copy-local-data-to-database.mjs            # preview only
 *   node scripts/copy-local-data-to-database.mjs --apply    # copy for real
 *
 * Options:
 *   --file <path>   data file to read (default: data/gnuts_db.json)
 *   --apply         write to the database (otherwise preview only)
 *
 * Not copied:
 *   users     the old local accounts use plain-text default passwords; the first admin
 *             comes from ADMIN_EMAIL / ADMIN_PASSWORD instead (created by init-db)
 *   settings  legacy table, replaced by site_settings
 */
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const fileArg = args.indexOf('--file');
const dataFile = path.resolve(fileArg >= 0 ? args[fileArg + 1] : 'data/gnuts_db.json');

// Tables copied, in this order. Everything else in the file is skipped.
const TABLES = [
  'site_settings',
  'about_page',
  'history_milestones',
  'hero_banners',
  'news',
  'scholarships',
  'opportunities',
  'innovations',
  'resources',
  'executives',
  'gallery',
  'contact_messages',
  'audit_logs',
];
const SKIPPED = { users: 'old local accounts (plain-text default passwords)', settings: 'legacy table, replaced by site_settings' };

// Site settings saved before these fields existed: fill in the values the union chose.
const SITE_SETTINGS_FILL = {
  mobile_phone: '+233 24 316 3135',
  postal_address: 'P.O. Box GP 2329, Accra - Ghana',
};

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const url = process.env.DATABASE_URL || '';
if (!/^postgres(ql)?:\/\//i.test(url)) {
  fail('Set DATABASE_URL to your Supabase/PostgreSQL connection string first (it must start with postgresql://).');
}
if (!fs.existsSync(dataFile)) fail(`Data file not found: ${dataFile}`);

const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
const client = new pg.Client({ connectionString: url, ssl: isLocal ? undefined : { rejectUnauthorized: false } });

/** Converts a JSON value to what the column accepts. Returns undefined to use the column default. */
function convert(value, column) {
  if (value === undefined) return undefined;
  if (value === null) return column.nullable ? null : undefined;
  const type = column.type;
  if (['date', 'timestamp with time zone', 'timestamp without time zone'].includes(type)) {
    if (value === '' || Number.isNaN(new Date(value).getTime())) return column.nullable ? null : undefined;
    return value;
  }
  if (['integer', 'smallint', 'bigint', 'numeric'].includes(type)) {
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (value === '' || Number.isNaN(Number(value))) return column.nullable ? null : undefined;
    return Number(value);
  }
  if (type === 'jsonb' || type === 'json') {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

async function main() {
  await client.connect();
  console.log(`\n${apply ? 'COPYING' : 'PREVIEW (nothing will be changed; add --apply to copy)'}`);
  console.log(`From: ${dataFile}`);
  console.log(`To:   ${url.replace(/:[^:@/]+@/, ':****@')}\n`);

  // Columns of every table in the database
  const colRows = await client.query(
    `SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public'`
  );
  const schema = {};
  for (const r of colRows.rows) {
    (schema[r.table_name] ??= {})[r.column_name] = { type: r.data_type, nullable: r.is_nullable === 'YES' };
  }
  const missing = TABLES.filter((t) => !schema[t] && Array.isArray(data[t]) && data[t].length);
  if (missing.length) {
    fail(`These tables don't exist yet: ${missing.join(', ')}.\n  Run the init-db step first (POST /api/admin/init-db), then run this script again.`);
  }

  for (const [table, reason] of Object.entries(SKIPPED)) {
    if (Array.isArray(data[table]) && data[table].length) console.log(`  skip  ${table.padEnd(19)} ${data[table].length} row(s): ${reason}`);
  }

  let totalNew = 0;
  let totalReplaced = 0;
  if (apply) await client.query('BEGIN');

  try {
    for (const table of TABLES) {
      const rows = Array.isArray(data[table]) ? data[table] : [];
      if (!rows.length) continue;
      const columns = schema[table];

      const existing = await client.query(`SELECT id FROM ${table}`);
      const existingIds = new Set(existing.rows.map((r) => Number(r.id)));
      const replacing = rows.filter((r) => existingIds.has(Number(r.id))).length;
      const adding = rows.length - replacing;
      totalNew += adding;
      totalReplaced += replacing;

      const ignoredCols = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter((c) => !columns[c]);
      console.log(
        `  ${apply ? 'copy' : 'plan'}  ${table.padEnd(19)} ${rows.length} row(s): ${adding} new, ${replacing} replacing existing` +
          (ignoredCols.length ? `  (ignoring unknown fields: ${ignoredCols.join(', ')})` : '')
      );
      if (!apply) continue;

      for (const raw of rows) {
        const row = table === 'site_settings' ? { ...SITE_SETTINGS_FILL, ...raw } : raw;
        const names = [];
        const values = [];
        for (const [name, value] of Object.entries(row)) {
          if (!columns[name]) continue;
          const converted = convert(value, columns[name]);
          if (converted === undefined) continue;
          names.push(name);
          values.push(converted);
        }
        if (!names.includes('id')) continue;
        const placeholders = names.map((_, i) => `$${i + 1}`);
        const updates = names.filter((n) => n !== 'id').map((n) => `${n} = EXCLUDED.${n}`);
        await client.query(
          `INSERT INTO ${table} (${names.join(', ')}) VALUES (${placeholders.join(', ')})
           ON CONFLICT (id) DO ${updates.length ? `UPDATE SET ${updates.join(', ')}` : 'NOTHING'}`,
          values
        );
      }

      // Move the id counter past the copied rows so new records don't collide
      const seq = await client.query(`SELECT pg_get_serial_sequence($1, 'id') AS seq`, [table]);
      if (seq.rows[0]?.seq) {
        await client.query(`SELECT setval($1, GREATEST((SELECT COALESCE(MAX(id), 0) FROM ${table}), 1))`, [seq.rows[0].seq]);
      }
    }

    if (apply) await client.query('COMMIT');
  } catch (error) {
    if (apply) await client.query('ROLLBACK');
    throw error;
  }

  console.log(
    `\n${apply ? '✔ Done' : 'Preview complete'}: ${totalNew} new row(s), ${totalReplaced} replacing existing row(s).` +
      (apply ? ' All changes were made in one transaction.' : '\n  Run again with --apply to copy.')
  );
  if (totalReplaced && !apply) {
    console.log('  "Replacing existing" rows have the same id in both places; the copy from your data file will win.');
  }
}

main()
  .catch((error) => {
    console.error(`\n✖ ${error.message}\n  Nothing was changed.`);
    process.exitCode = 1;
  })
  .finally(() => client.end().catch(() => {}));
