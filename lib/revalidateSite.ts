import { revalidatePath } from 'next/cache';

/**
 * Public pages are cached for up to an hour (`export const revalidate = 3600`)
 * so the host isn't rebuilding them every few seconds. When an admin changes
 * content, this clears that cache straight away so the edit shows up instantly.
 *
 * Admin edits are rare, so clearing every page (via the root layout) is cheap
 * and avoids having to track which pages show which content.
 */
export function revalidatePublicSite(): void {
  try {
    revalidatePath('/', 'layout');
  } catch (error) {
    // Outside a request (e.g. a script) there is no cache to clear
    console.warn('Could not revalidate public pages:', error);
  }
}

// Admin actions that never change what public visitors see
const PRIVATE_ACTION = /(^USER_LOGIN$|^EXPORT_BACKUP$|MESSAGE|_USER|_USERS$|SUBSCRIBER|^SUBMIT_)/;
const CONTENT_ACTION = /^(CREATE|UPDATE|DELETE|BULK_DELETE)_/;

/** True when an audit-logged admin action changed public content. */
export function changesPublicContent(action: string): boolean {
  return CONTENT_ACTION.test(action) && !PRIVATE_ACTION.test(action);
}
