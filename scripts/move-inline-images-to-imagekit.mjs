#!/usr/bin/env node
/**
 * Moves files that were saved inside the database as base64 "data:" URLs onto ImageKit,
 * and replaces each one with its short ImageKit link.
 *
 * Why: when ImageKit isn't configured on the host, admin uploads fall back to storing the
 * whole file as text in the database. Those files then get built into every page that
 * shows them, making pages several MB and using up the host's bandwidth limits.
 *
 * SAFE BY DEFAULT: without --apply it only lists what it found and changes nothing.
 * Works with PostgreSQL / Supabase. Scans every text and JSON column of every table.
 *
 * Usage (PowerShell), from the project folder:
 *   $env:DATABASE_URL = "postgresql://...pooler.supabase.com:6543/postgres"
 *   $env:IMAGEKIT_PRIVATE_KEY = "private_..."
 *   $env:IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/your_id"
 *   node scripts/move-inline-images-to-imagekit.mjs            # preview only
 *   node scripts/move-inline-images-to-imagekit.mjs --apply    # upload and update for real
 */
import crypto from 'node:crypto';
import pg from 'pg';

const apply = process.argv.includes('--apply');

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const url = process.env.DATABASE_URL || '';
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || '';
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || '';

if (!/^postgres(ql)?:\/\//i.test(url)) {
  fail('Set DATABASE_URL to your Supabase/PostgreSQL connection string first (it must start with postgresql://).');
}
if (apply && (!privateKey || !urlEndpoint)) {
  fail('Set IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT before running with --apply.');
}

const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
const client = new pg.Client({ connectionString: url, ssl: isLocal ? undefined : { rejectUnauthorized: false } });

const DATA_URL = /data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)/gi;
const EXTENSIONS = {
  'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
  'application/pdf': '.pdf', 'text/plain': '.txt',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
};

const ident = (name) => `"${String(name).replace(/"/g, '""')}"`;
const kb = (bytes) => `${Math.round(bytes / 1024).toLocaleString()} KB`;

// The same file is often stored in several rows: upload it once.
const uploaded = new Map(); // sha1 of data URL -> ImageKit URL

async function upload(mime, base64) {
  const key = crypto.createHash('sha1').update(base64).digest('hex');
  if (uploaded.has(key)) return uploaded.get(key);

  const isDocument = !mime.startsWith('image/');
  const form = new FormData();
  form.append('file', base64);
  form.append('fileName', `migrated-${key.slice(0, 12)}${EXTENSIONS[mime] || ''}`);
  form.append('folder', isDocument ? '/gnuts_documents' : '/gnuts_uploads');
  form.append('useUniqueFileName', 'true');

  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(privateKey + ':').toString('base64') },
    body: form,
  });
  if (!res.ok) throw new Error(`ImageKit upload failed (${res.status}): ${await res.text()}`);
  const { url: link } = await res.json();
  if (!link) throw new Error('ImageKit did not return a URL');
  uploaded.set(key, link);
  return link;
}

async function main() {
  await client.connect();

  const { rows: columns } = await client.query(`
    SELECT c.table_name, c.column_name, c.data_type
    FROM information_schema.columns c
    JOIN information_schema.tables t ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
      AND c.data_type IN ('text', 'character varying', 'json', 'jsonb')
    ORDER BY c.table_name, c.ordinal_position`);

  const { rows: keys } = await client.query(`
    SELECT kcu.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public' AND tc.constraint_type = 'PRIMARY KEY'`);
  const primaryKey = new Map();
  for (const k of keys) {
    // Only single-column primary keys are supported
    primaryKey.set(k.table_name, primaryKey.has(k.table_name) ? null : k.column_name);
  }

  let found = 0;
  let totalBytes = 0;
  let updatedCells = 0;

  for (const { table_name: table, column_name: column, data_type: type } of columns) {
    const pk = primaryKey.get(table);
    const asText = type === 'json' || type === 'jsonb' ? `${ident(column)}::text` : ident(column);
    const { rows } = await client.query(
      `SELECT ${pk ? ident(pk) : 'ctid::text'} AS row_key, ${asText} AS value
       FROM ${ident(table)} WHERE ${asText} LIKE '%data:%;base64,%'`
    );

    for (const row of rows) {
      const matches = [...String(row.value).matchAll(DATA_URL)];
      if (matches.length === 0) continue;

      const bytes = matches.reduce((sum, m) => sum + Math.floor(m[2].length * 0.75), 0);
      found += matches.length;
      totalBytes += bytes;
      console.log(`  ${table}.${column} (${pk || 'row'} ${row.row_key}): ${matches.length} file(s), ${kb(bytes)}`);

      if (!apply) continue;
      if (!pk) {
        console.warn(`    ↳ skipped: table "${table}" has no single-column primary key`);
        continue;
      }

      let value = String(row.value);
      for (const m of matches) {
        const link = await upload(m[1].toLowerCase(), m[2]);
        value = value.split(m[0]).join(link);
      }
      const cast = type === 'jsonb' ? '::jsonb' : type === 'json' ? '::json' : '';
      await client.query(
        `UPDATE ${ident(table)} SET ${ident(column)} = $1${cast} WHERE ${ident(pk)}::text = $2`,
        [value, String(row.row_key)]
      );
      updatedCells++;
      console.log('    ↳ moved to ImageKit');
    }
  }

  console.log('');
  if (found === 0) {
    console.log('✔ No inline (base64) files found. Nothing to do.');
  } else if (apply) {
    console.log(`✔ Moved ${uploaded.size} unique file(s) (${kb(totalBytes)}) to ImageKit and updated ${updatedCells} database value(s).`);
    console.log('  Redeploy the site (or save anything in the admin panel) so cached pages pick up the new links.');
  } else {
    console.log(`Found ${found} inline file(s), ${kb(totalBytes)} in total.`);
    console.log('Preview only: nothing was changed. Run again with --apply to move them to ImageKit.');
  }
}

main()
  .catch((error) => {
    console.error(`\n✖ ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => client.end().catch(() => {}));
