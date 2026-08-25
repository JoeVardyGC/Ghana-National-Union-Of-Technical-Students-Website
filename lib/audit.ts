import { query } from './db';

export interface AuditLogEntry {
  id: number;
  user_name: string;
  user_role: string;
  action: string;
  target: string;
  details?: string;
  ip_address?: string;
  timestamp: string;
}

// In-memory fallback if database table is initializing
let inMemoryLogs: AuditLogEntry[] = [];

export async function logAuditAction(
  userName: string,
  userRole: string,
  action: string,
  target: string,
  details?: string
): Promise<void> {
  const newLog: AuditLogEntry = {
    id: Date.now(),
    user_name: userName,
    user_role: userRole,
    action,
    target,
    details: details || '',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };

  inMemoryLogs.unshift(newLog);
  if (inMemoryLogs.length > 50) {
    inMemoryLogs = inMemoryLogs.slice(0, 50);
  }

  try {
    await query(
      'INSERT INTO audit_logs (user_name, user_role, action, target, details) VALUES (?, ?, ?, ?, ?)',
      [userName, userRole, action, target, details || '']
    );
  } catch (e) {
    // Database table might not exist yet, fallback in memory
  }
}

export async function getAuditLogs(limit: number = 25): Promise<AuditLogEntry[]> {
  try {
    const dbLogs = await query(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT ${Math.max(1, Math.min(100, Number(limit) || 25))}`);
    if (dbLogs && Array.isArray(dbLogs) && dbLogs.length > 0) {
      return dbLogs as AuditLogEntry[];
    }
  } catch (e) {
    // DB fallback
  }

  return inMemoryLogs.slice(0, limit);
}
