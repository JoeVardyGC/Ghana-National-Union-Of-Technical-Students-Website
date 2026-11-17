import { Pool, types, type QueryResult } from 'pg';

/**
 * PostgreSQL (Supabase) support for lib/db.ts.
 *
 * The app's queries are written in MySQL style ("?" placeholders, "text" in double
 * quotes, LIMIT offset, count). translateMysqlToPostgres() converts them so every
 * existing query() call keeps working unchanged, and runPostgres() returns results
 * in the same shape mysql2 did (rows for SELECT, insertId / affectedRows for writes).
 */

// ---------------------------------------------------------------------------
// Result types: match what the rest of the app (and the JSON fallback) expects
// ---------------------------------------------------------------------------
// DATE -> 'YYYY-MM-DD' (not a JS Date shifted by time zone)
types.setTypeParser(1082, (value: string) => value);
// TIMESTAMP (no zone) is stored as UTC -> ISO string
types.setTypeParser(1114, (value: string) => new Date(`${value.replace(' ', 'T')}Z`).toISOString());
// TIMESTAMPTZ -> ISO string
types.setTypeParser(1184, (value: string) => new Date(value).toISOString());
// BIGINT (COUNT(*) results) and NUMERIC -> numbers
types.setTypeParser(20, (value: string) => Number.parseInt(value, 10));
types.setTypeParser(1700, (value: string) => Number.parseFloat(value));

/**
 * Tidies a connection string copied into a host's settings: trims spaces and line
 * breaks, removes wrapping quotes, and drops an accidental "DATABASE_URL=" prefix.
 */
export function cleanDatabaseUrl(raw: string | undefined | null): string {
  let url = (raw || '').trim();
  url = url.replace(/^DATABASE_URL\s*=\s*/i, '').trim();
  url = url.replace(/^['"`]+|['"`]+$/g, '').trim();
  return url;
}

export function isPostgresUrl(url: string | undefined | null): boolean {
  return /^postgres(ql)?:\/\//i.test(cleanDatabaseUrl(url));
}

export function getPostgresUrl(): string | null {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.SUPABASE_DB_URL,
    process.env.DATABASE_PUBLIC_URL,
  ];
  const found = candidates.find((url) => isPostgresUrl(url));
  return found ? cleanDatabaseUrl(found) : null;
}

/**
 * Plain-English problem with DATABASE_URL, or null if it looks usable (or isn't set).
 * Shown in the admin panel and returned as the error when saving fails.
 */
export function getDatabaseUrlProblem(): string | null {
  const url = cleanDatabaseUrl(process.env.DATABASE_URL);
  if (!url) return null;

  if (/^https?:\/\/[a-z0-9]+\.supabase\.co/i.test(url)) {
    return 'DATABASE_URL is set to your Supabase project URL (https://…supabase.co). That is the wrong value: in Supabase click Connect > Direct > Method "Transaction pooler", copy the postgresql://… connection string, put in your database password, save it in Vercel and redeploy.';
  }
  if (/\[YOUR-PASSWORD\]|YOUR_PASSWORD|YOUR-PASSWORD/i.test(url)) {
    return 'DATABASE_URL still contains the [YOUR-PASSWORD] placeholder. Replace it with your Supabase database password, save it in Vercel and redeploy.';
  }
  if (!/^(postgres(ql)?|mysql):\/\//i.test(url)) {
    return 'DATABASE_URL is not a database connection string. It must start with postgresql:// (Supabase: Connect > Direct > Transaction pooler). Fix it in Vercel and redeploy.';
  }
  return null;
}

/** Non-blocking advice about DATABASE_URL (shown in the admin panel), or null. */
export function getDatabaseUrlWarning(): string | null {
  const url = cleanDatabaseUrl(process.env.DATABASE_URL);
  if (/^postgres/i.test(url) && /\.supabase\.co:5432/i.test(url)) {
    return 'DATABASE_URL uses Supabase\'s direct connection (db.….supabase.co:5432), which often fails on Vercel. Use the "Transaction pooler" connection string (…pooler.supabase.com:6543) instead.';
  }
  return null;
}

let pool: Pool | null = null;

export function getPostgresPool(): Pool | null {
  if (pool) return pool;
  const connectionString = getPostgresUrl();
  if (!connectionString) return null;

  const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);
  pool = new Pool({
    connectionString,
    // Supabase requires TLS; its certificate chain isn't in Node's default store
    ssl: isLocal || process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false },
    // Small pool: each serverless instance keeps its own. Use Supabase's pooler URL (port 6543).
    max: Number(process.env.PG_POOL_MAX) || 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  });
  pool.on('error', (err) => console.error('[DB Engine] PostgreSQL pool error:', err.message));
  return pool;
}

// ---------------------------------------------------------------------------
// MySQL -> PostgreSQL SQL translation
// ---------------------------------------------------------------------------

/**
 * Walks the SQL once, outside of string literals:
 *  - `identifier`  -> "identifier"
 *  - "text"        -> 'text'   (MySQL allows double-quoted strings; PostgreSQL doesn't)
 *  - ?             -> $1, $2, ...
 * Then rewrites a few MySQL-only forms.
 */
export function translateMysqlToPostgres(sql: string): string {
  let out = '';
  let paramIndex = 0;
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    if (ch === "'") {
      // Copy a single-quoted literal as-is (handles '' escapes)
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") { j += 2; continue; }
        if (sql[j] === "'") break;
        j++;
      }
      out += sql.slice(i, j + 1);
      i = j + 1;
      continue;
    }

    if (ch === '"') {
      const end = sql.indexOf('"', i + 1);
      const text = end === -1 ? sql.slice(i + 1) : sql.slice(i + 1, end);
      out += `'${text.replace(/'/g, "''")}'`;
      i = end === -1 ? sql.length : end + 1;
      continue;
    }

    if (ch === '`') {
      const end = sql.indexOf('`', i + 1);
      const name = end === -1 ? sql.slice(i + 1) : sql.slice(i + 1, end);
      out += `"${name}"`;
      i = end === -1 ? sql.length : end + 1;
      continue;
    }

    if (ch === '?') {
      paramIndex += 1;
      out += `$${paramIndex}`;
      i++;
      continue;
    }

    out += ch;
    i++;
  }

  return out
    .replace(/\bRAND\(\)/gi, 'RANDOM()')
    .replace(/\bIFNULL\(/gi, 'COALESCE(')
    .replace(/\bLIKE\b/g, 'ILIKE') // MySQL LIKE is case-insensitive by default
    // LIMIT offset, count  ->  LIMIT count OFFSET offset
    .replace(/\bLIMIT\s+(\$\d+|\d+)\s*,\s*(\$\d+|\d+)/gi, 'LIMIT $2 OFFSET $1');
}

/** Errors that mean "can't reach the database" (as opposed to a bad query). */
export function isConnectionError(err: unknown): boolean {
  const e = err as { code?: string; message?: string };
  const code = e?.code || '';
  return (
    ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', '57P01', '57P03', '08000', '08001', '08003', '08006'].includes(code) ||
    /timeout|terminated|Connection terminated/i.test(e?.message || '')
  );
}

type WriteResult = { affectedRows: number; changedRows: number; insertId?: number };

/**
 * Runs a MySQL-style query on PostgreSQL and returns mysql2-compatible results:
 *  - SELECT / SHOW-like:  rows array
 *  - INSERT:              rows array (RETURNING *) with .insertId and .affectedRows
 *  - UPDATE / DELETE:     { affectedRows, changedRows }
 *  - DDL:                 { affectedRows: 0 }
 */
export async function runPostgres(sql: string, params: unknown[] = []): Promise<unknown> {
  const db = getPostgresPool();
  if (!db) throw new Error('PostgreSQL is not configured');

  let text = translateMysqlToPostgres(sql.trim().replace(/;\s*$/, ''));
  const verb = text.trimStart().slice(0, 12).toUpperCase();
  const isInsert = verb.startsWith('INSERT');

  if (isInsert && !/\bRETURNING\b/i.test(text)) text += ' RETURNING *';

  let result: QueryResult;
  try {
    result = await db.query(text, params as unknown[]);
  } catch (error) {
    // Connection poolers (e.g. Supabase's) close idle connections; a pooled
    // connection can be stale. Retry once on a fresh connection.
    if (!isConnectionError(error)) throw error;
    result = await db.query(text, params as unknown[]);
  }

  if (isInsert) {
    const rows = result.rows as Array<Record<string, unknown>> & WriteResult;
    rows.affectedRows = result.rowCount ?? rows.length;
    rows.changedRows = rows.affectedRows;
    const firstId = rows[0]?.id;
    if (firstId !== undefined && firstId !== null) rows.insertId = Number(firstId);
    return rows;
  }

  if (verb.startsWith('UPDATE') || verb.startsWith('DELETE')) {
    const count = result.rowCount ?? 0;
    return { affectedRows: count, changedRows: count } satisfies WriteResult;
  }

  if (result.command === 'SELECT' || Array.isArray(result.rows) && result.fields?.length) {
    return result.rows;
  }

  return { affectedRows: result.rowCount ?? 0, changedRows: 0 } satisfies WriteResult;
}
