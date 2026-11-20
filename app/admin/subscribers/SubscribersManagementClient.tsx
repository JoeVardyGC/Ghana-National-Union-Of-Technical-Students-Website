'use client';

import { useMemo, useState } from 'react';
import { Bell, Download, Mail, Phone, Search, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { exportToCsv } from '@/lib/exportCsv';
import type { Subscriber } from '@/lib/subscribers';

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function SubscribersManagementClient({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'email' | 'phone'>('all');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const visible = useMemo(
    () =>
      subscribers.filter(
        (s) =>
          (filter === 'all' || s.contact_type === filter) &&
          s.contact.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [subscribers, search, filter]
  );

  const emailCount = subscribers.filter((s) => s.contact_type === 'email').length;
  const phoneCount = subscribers.length - emailCount;

  // Paste straight into the BCC field of an email (keeps subscribers' addresses private)
  const copyEmails = async () => {
    const emails = visible.filter((s) => s.contact_type === 'email').map((s) => s.contact);
    if (emails.length === 0) return;
    try {
      await navigator.clipboard.writeText(emails.join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setError('Could not copy. Use "Export CSV" instead.');
    }
  };

  const remove = async (s: Subscriber) => {
    if (!window.confirm(`Remove ${s.contact} from the alerts list?`)) return;
    setError('');
    const res = await fetch(`/api/admin/subscribers/${s.id}`, { method: 'DELETE' }).catch(() => null);
    if (res && res.ok) {
      setSubscribers((list) => list.filter((x) => x.id !== s.id));
    } else {
      setError('Could not remove the subscriber. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black uppercase text-[#014900] tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#D9A000]" /> Alert Subscribers
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1 max-w-2xl">
              Students who signed up on the Scholarships page for scholarship and opportunity alerts. When a new
              scholarship opens, copy the emails into the BCC field of an email from the Secretariat, or export the
              list for Mailchimp or a WhatsApp broadcast list.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyEmails}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-[#014900] cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Emails copied' : 'Copy emails'}
            </button>
            <button
              type="button"
              onClick={() =>
                exportToCsv(`gnuts-alert-subscribers-${new Date().toISOString().slice(0, 10)}.csv`, visible, [
                  { key: 'contact', header: 'Email or Phone' },
                  { key: 'contact_type', header: 'Type' },
                  { key: 'created_at', header: 'Signed Up' },
                ])
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] text-xs font-bold cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: 'Total', value: subscribers.length },
            { label: 'Emails', value: emailCount },
            { label: 'Phone numbers', value: phoneCount },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-2xl font-black text-[#014900]">{stat.value}</p>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search email or phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs outline-none focus:border-[#014900]"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'email', 'phone'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold cursor-pointer ${
                  filter === f ? 'bg-[#014900] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : f === 'email' ? 'Emails' : 'Phones'}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

        {visible.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-12">
            {subscribers.length === 0 ? 'No one has signed up for alerts yet.' : 'No subscribers match your search.'}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {visible.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#014900]/10 text-[#014900] flex items-center justify-center shrink-0">
                    {s.contact_type === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.contact}</p>
                    <p className="text-xs text-gray-500">Signed up {formatDate(s.created_at)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(s)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  title="Remove"
                  aria-label={`Remove ${s.contact}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
