import { query } from '@/lib/db';
import MessagesManagementClient from './MessagesManagementClient';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const messageRows = await query('SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC').catch(() => []);
  
  return (
    <MessagesManagementClient initialMessages={messageRows} />
  );
}
