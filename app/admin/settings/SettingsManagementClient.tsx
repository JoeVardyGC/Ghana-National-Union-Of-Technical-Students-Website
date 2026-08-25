'use client';

import { useState } from 'react';
import { 
  Settings, 
  Database, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Newspaper, 
  GraduationCap, 
  Lightbulb, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Activity,
  Lock,
  Sparkles,
  Server
} from 'lucide-react';

interface SettingsManagementClientProps {
  initialCounts: {
    users: number;
    executives: number;
    news: number;
    scholarships: number;
    innovations: number;
    opportunities: number;
    resources: number;
    messages: number;
    audit_logs: number;
  };
  initialLogs: any[];
}

export default function SettingsManagementClient({
  initialCounts,
  initialLogs = []
}: SettingsManagementClientProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'database' | 'audit'>('general');
  const [counts, setCounts] = useState(initialCounts);
  const [logs, setLogs] = useState(initialLogs);

  // Form State
  const [formData, setFormData] = useState({
    portalName: 'Ghana National Union of Technical Students (GNUTS)',
    secretariatEmail: 'info@gnuts.org.gh',
    hotlinePhone: '+233 24 000 0000',
    headquartersAddress: 'National TVET Secretariat, Accra, Ghana',
    facebookUrl: 'https://facebook.com/gnutsghana',
    twitterUrl: 'https://twitter.com/gnutsghana',
    instagramUrl: 'https://instagram.com/gnutsghana',
    linkedinUrl: 'https://linkedin.com/company/gnutsghana',
    youtubeUrl: 'https://youtube.com/@gnutsghana',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFeedbackMsg({ type: 'success', text: 'Portal settings saved successfully!' });
      } else {
        setFeedbackMsg({ type: 'error', text: 'Failed to save settings' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/admin/init-db');
      const data = await res.json();

      if (res.ok && data.success) {
        setFeedbackMsg({ type: 'success', text: 'Database schema verified & auto-synchronized across all 9 tables!' });
      } else {
        setFeedbackMsg({ type: 'error', text: data.message || 'Database sync completed with warnings' });
      }
    } catch {
      setFeedbackMsg({ type: 'error', text: 'Failed to trigger database sync' });
    } finally {
      setIsSyncing(false);
    }
  };

  const TABLES_STATS = [
    { name: 'Admin Users', table: 'users', count: counts.users, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { name: 'Executive Council', table: 'executives', count: counts.executives, icon: ShieldCheck, color: 'text-[#014900] bg-emerald-50' },
    { name: 'News & Press', table: 'news', count: counts.news, icon: Newspaper, color: 'text-emerald-700 bg-emerald-50' },
    { name: 'Scholarships', table: 'scholarships', count: counts.scholarships, icon: GraduationCap, color: 'text-amber-600 bg-amber-50' },
    { name: 'Student Innovations', table: 'innovations', count: counts.innovations, icon: Lightbulb, color: 'text-yellow-600 bg-yellow-50' },
    { name: 'Opportunities & Jobs', table: 'opportunities', count: counts.opportunities, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
    { name: 'Union Documents', table: 'resources', count: counts.resources, icon: FileText, color: 'text-emerald-800 bg-emerald-100/50' },
    { name: 'Contact Inquiries', table: 'contact_messages', count: counts.messages, icon: MessageSquare, color: 'text-rose-600 bg-rose-50' },
    { name: 'Security Audit Logs', table: 'audit_logs', count: counts.audit_logs, icon: Activity, color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <div className="space-y-6 font-['Montserrat',sans-serif]">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#014900] tracking-tight">
            Portal Settings & Database Health
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">
            Configure secretariat metadata, monitor MySQL schema health, and inspect audit activity
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'bg-[#014900] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Secretariat Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'bg-[#014900] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Database Health
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[#014900] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-600" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 2. TAB 1: General Secretariat Configuration */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-black uppercase text-[#014900] tracking-tight">
              Secretariat Metadata & Public Contacts
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              These details appear across the public site header, footer, contact page, and official communiqués.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Union Portal Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.portalName}
                  onChange={(e) => setFormData({ ...formData, portalName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#014900] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Secretariat Official Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.secretariatEmail}
                  onChange={(e) => setFormData({ ...formData, secretariatEmail: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#014900] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Secretariat Hotline Phone *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hotlinePhone}
                  onChange={(e) => setFormData({ ...formData, hotlinePhone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#014900] focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Headquarters Physical Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.headquartersAddress}
                  onChange={(e) => setFormData({ ...formData, headquartersAddress: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-semibold outline-none focus:border-[#014900] focus:bg-white"
                />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
                Official Union Social Handles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="url"
                  placeholder="Facebook URL"
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
                />
                <input
                  type="url"
                  placeholder="Twitter / X URL"
                  value={formData.twitterUrl}
                  onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
                />
                <input
                  type="url"
                  placeholder="Instagram URL"
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-2xl bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] font-black text-xs uppercase tracking-wider shadow-md hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Settings...' : 'Save Portal Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. TAB 2: Database Health & Live Table Statistics */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-[#014900]" />
                <h2 className="text-lg font-black uppercase text-[#014900] tracking-tight">
                  MySQL Relational Database Engine
                </h2>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                All 9 system tables are synchronized with automated fallbacks and live query pooling.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSyncDatabase}
              disabled={isSyncing}
              className="px-5 py-2.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-xl flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-70"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Re-Sync Database Schema'}</span>
            </button>
          </div>

          {/* 9 Tables Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {TABLES_STATS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.table}
                  className="bg-white rounded-2xl p-4.5 border border-gray-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
                      {item.name}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-gray-900 tracking-tight">
                        {item.count}
                      </span>
                      <span className="text-xs font-semibold text-gray-400 font-mono">
                        ({item.table})
                      </span>
                    </div>
                  </div>

                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB 3: Security Audit Log Stream */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase text-[#014900] tracking-tight">
                Executive Audit Trail & Activity Stream
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Cryptographically tracked record of all create, update, and delete actions across the portal
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-[#014900] font-black text-[10px] uppercase rounded-full border border-emerald-200">
              Live Auditing Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-black tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Timestamp</th>
                  <th className="py-3 px-4">Officer</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target / Record</th>
                  <th className="py-3 px-4 rounded-r-xl">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {logs.map((log: any, idx: number) => (
                  <tr key={log.id || idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {String(log.timestamp || log.created_at || '').substring(0, 19)}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {log.user_name || 'System'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px] font-black uppercase">
                        {log.user_role || 'Admin'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black uppercase text-[10px] text-[#014900] whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap truncate max-w-xs">
                      {log.target}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-[11px] truncate max-w-sm">
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="py-8 text-center text-gray-400">
              <Activity className="w-8 h-8 mx-auto mb-1 text-gray-300" />
              <p className="text-xs font-bold">No audit entries recorded yet</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
