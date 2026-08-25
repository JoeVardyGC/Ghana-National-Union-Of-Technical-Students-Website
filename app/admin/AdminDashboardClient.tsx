'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Newspaper, 
  GraduationCap, 
  Lightbulb, 
  Users, 
  FileText, 
  Inbox, 
  ArrowUpRight, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  ShieldCheck, 
  Briefcase, 
  UserCheck, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface DashboardStats {
  news: number;
  activeScholarships: number;
  totalScholarships: number;
  approvedInnovations: number;
  pendingInnovations: number;
  executives: number;
  unreadMessages: number;
  totalMessages: number;
  resources: number;
  opportunities: number;
  users: number;
}

interface AdminDashboardClientProps {
  initialStats: DashboardStats;
  initialRecentNews: any[];
  initialPendingInnovations: any[];
  initialRecentMessages: any[];
  initialAuditLogs: any[];
  userName?: string;
  userRole?: string;
}

export default function AdminDashboardClient({
  initialStats,
  initialRecentNews,
  initialPendingInnovations,
  initialRecentMessages,
  initialAuditLogs,
  userName = 'Executive Officer',
  userRole = 'Super Admin',
}: AdminDashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [recentNews, setRecentNews] = useState<any[]>(initialRecentNews);
  const [pendingInnovations, setPendingInnovations] = useState<any[]>(initialPendingInnovations);
  const [recentMessages, setRecentMessages] = useState<any[]>(initialRecentMessages);
  const [auditLogs, setAuditLogs] = useState<any[]>(initialAuditLogs);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  const fetchLiveMetrics = useCallback(async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setRecentNews(data.recentNews || []);
          setPendingInnovations(data.pendingInnovations || []);
          setRecentMessages(data.recentMessages || []);
          setAuditLogs(data.auditLogs || []);
          setLastUpdated(new Date());
          setSecondsAgo(0);
        }
      }
    } catch (err) {
      console.error('Failed to sync dashboard metrics:', err);
    } finally {
      if (showLoading) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, []);

  // Background auto-polling interval every 10 seconds permanently enabled
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveMetrics(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchLiveMetrics]);

  // Second counter for "Updated Xs ago"
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const statCards = [
    { 
      title: 'News & Press', 
      count: stats.news, 
      label: 'Published Articles', 
      icon: Newspaper, 
      link: '/admin/news',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/80',
    },
    { 
      title: 'Scholarships', 
      count: stats.activeScholarships, 
      subCount: `${stats.totalScholarships} Total`,
      label: 'Active Grants & Aid', 
      icon: GraduationCap, 
      link: '/admin/scholarships',
      color: 'text-[#D9A000]',
      bg: 'bg-amber-50',
      border: 'border-amber-200/80',
    },
    { 
      title: 'TVET Projects', 
      count: stats.approvedInnovations, 
      pendingCount: stats.pendingInnovations,
      label: 'Approved Student Innovations', 
      icon: Lightbulb, 
      link: '/admin/innovations',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200/80',
    },
    { 
      title: 'Executive Council', 
      count: stats.executives, 
      label: 'Active National Officers', 
      icon: Users, 
      link: '/admin/executives',
      color: 'text-emerald-800',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/80',
    },
    { 
      title: 'Inquiries & Inbox', 
      count: stats.unreadMessages, 
      subCount: `${stats.totalMessages} Total`,
      label: 'Unread Public Inquiries', 
      icon: Inbox, 
      link: '/admin/messages',
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200/80',
      unreadAlert: stats.unreadMessages > 0,
    },
    { 
      title: 'Constitution & Docs', 
      count: stats.resources, 
      label: 'Official PDF Documents', 
      icon: FileText, 
      link: '/admin/resources',
      color: 'text-slate-700',
      bg: 'bg-slate-50',
      border: 'border-slate-200/80',
    },
    { 
      title: 'Opportunities', 
      count: stats.opportunities, 
      label: 'Internships & Camps', 
      icon: Briefcase, 
      link: '/admin/opportunities',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200/80',
    },
    { 
      title: 'Portal Admins', 
      count: stats.users, 
      label: 'Authorized Users', 
      icon: UserCheck, 
      link: '/admin/users',
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200/80',
    },
  ];

  return (
    <div className="space-y-8 font-['Montserrat',sans-serif]">
      
      {/* 1. Real-time Status Control Bar & Welcome Banner */}
      <div className="bg-gradient-to-r from-[#014900] via-[#013800] to-[#012200] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D9A000]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Real-time Heartbeat Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-emerald-500/30 text-[10px] font-extrabold text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Real-Time Sync Active</span>
              <span className="text-gray-400 font-medium">({secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`})</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              National Secretariat <span className="text-[#D9A000]">Live Dashboard</span>
            </h1>
            <p className="text-gray-200 text-xs sm:text-sm font-medium leading-relaxed">
              Active terminal for <strong className="text-white font-bold">{userName}</strong> ({userRole}). Real-time data from MariaDB is continuously synchronized.
            </p>
          </div>

          {/* Real-time Quick Actions & Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Sync Now Button */}
            <button
              onClick={() => fetchLiveMetrics(true)}
              disabled={isRefreshing}
              className={`px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-black text-xs uppercase tracking-wider rounded-2xl border border-white/25 transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                isRefreshing ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
              }`}
              title="Force sync live database records"
            >
              <RefreshCw className={`w-4 h-4 text-[#D9A000] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            <Link
              href="/admin/news"
              className="px-4 py-2.5 bg-[#D9A000] hover:bg-white text-[#014900] font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center gap-2 hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Release</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Metric Stat Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.link}
              className={`bg-white rounded-3xl p-5 border ${card.border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden`}
            >
              {card.unreadAlert && (
                <div className="absolute top-3 right-3 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center font-bold shadow-xs group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                {card.pendingCount !== undefined && card.pendingCount > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    {card.pendingCount} Pending
                  </span>
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#014900] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900 leading-none group-hover:text-[#014900] transition-colors">
                    {card.count}
                  </span>
                  {card.subCount && (
                    <span className="text-[10px] font-bold text-gray-400">
                      ({card.subCount})
                    </span>
                  )}
                </div>
                <p className="text-xs font-black text-gray-800 uppercase tracking-wider mt-1.5 truncate">{card.title}</p>
                <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">{card.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Real-Time Action Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Live Publications Table & Inbound Inquiries Feed */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Latest News & Press Releases Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#014900] uppercase tracking-tight">
                  Latest Publications & Press Center
                </h3>
                <p className="text-xs text-gray-500 font-medium">Real-time live news entries directly from the database</p>
              </div>
              <Link
                href="/admin/news"
                className="text-xs font-black uppercase tracking-wider text-[#014900] hover:text-[#D9A000] transition-colors inline-flex items-center gap-1"
              >
                <span>Manage News ({stats.news})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentNews.length === 0 ? (
              <div className="text-center py-10 px-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500 text-xs font-medium">No published press releases yet.</p>
                <Link
                  href="/admin/news"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#014900] text-white text-xs font-bold rounded-xl hover:bg-[#D9A000] hover:text-[#014900] transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Publish First Article</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 font-extrabold">Title & Subject</th>
                      <th className="pb-3 font-extrabold hidden sm:table-cell">Author</th>
                      <th className="pb-3 font-extrabold">Date</th>
                      <th className="pb-3 font-extrabold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentNews.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="py-3.5 pr-4 font-bold text-gray-900 group-hover:text-[#014900] transition-colors max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="py-3.5 font-medium text-gray-500 hidden sm:table-cell">
                          {item.author || 'Secretariat'}
                        </td>
                        <td className="py-3.5 text-gray-500 font-medium whitespace-nowrap">
                          {item.published_at ? String(item.published_at).substring(0, 10) : 'Recent'}
                        </td>
                        <td className="py-3.5 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{item.status || 'Active'}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Inbound Contact Messages Live Feed */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#014900] uppercase tracking-tight">
                  Recent Inbound Contact Inquiries
                </h3>
                <p className="text-xs text-gray-500 font-medium">Messages sent from the public website contact form</p>
              </div>
              <Link
                href="/admin/messages"
                className="text-xs font-black uppercase tracking-wider text-[#014900] hover:text-[#D9A000] transition-colors inline-flex items-center gap-1"
              >
                <span>View All Inquiries ({stats.totalMessages})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentMessages.length === 0 ? (
              <div className="text-center py-8 px-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500 text-xs font-medium">No contact messages received yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg: any) => {
                  const isUnread = (msg.status || 'unread').toLowerCase() === 'unread';
                  return (
                    <div 
                      key={msg.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isUnread 
                          ? 'bg-rose-50/40 border-rose-200/80 hover:bg-rose-50/70' 
                          : 'bg-gray-50/80 border-gray-200/60 hover:bg-gray-100/80'
                      }`}
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-gray-900 truncate">{msg.name}</span>
                          {isUnread && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-600 text-white">
                              New
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 font-medium">• {msg.created_at ? String(msg.created_at).substring(0, 16) : 'Recent'}</span>
                        </div>
                        <p className="text-xs font-bold text-[#014900] truncate">{msg.subject || 'No Subject'}</p>
                        <p className="text-[11px] text-gray-600 font-medium line-clamp-1">{msg.message}</p>
                      </div>

                      <Link
                        href="/admin/messages"
                        className="px-3 py-1.5 bg-white border border-gray-200 hover:border-[#014900] text-[#014900] text-[10px] font-black uppercase tracking-wider rounded-xl shrink-0 transition-colors shadow-xs text-center"
                      >
                        Open Message
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Pending TVET Project Submissions & Audit Activity Trail */}
        <div className="space-y-8">
          
          {/* Pending TVET Project Approvals Widget */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#D9A000]" />
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                  Pending TVET Projects
                </h4>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                stats.pendingInnovations > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {stats.pendingInnovations} Pending
              </span>
            </div>

            {pendingInnovations.length === 0 ? (
              <div className="text-center py-6 px-3 bg-gray-50 rounded-2xl border border-gray-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <p className="text-gray-700 text-xs font-black">All Caught Up!</p>
                <p className="text-gray-500 text-[11px] font-medium mt-0.5">No student projects pending review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingInnovations.map((proj: any) => (
                  <div key={proj.id} className="p-3.5 bg-amber-50/50 hover:bg-amber-50 rounded-2xl border border-amber-200/70 transition-colors flex items-center justify-between gap-3">
                    <div className="overflow-hidden space-y-0.5">
                      <p className="text-xs font-black text-gray-900 truncate">{proj.title}</p>
                      <p className="text-[10px] text-gray-600 font-medium truncate">
                        {proj.student_name} • {proj.institution}
                      </p>
                      {proj.category && (
                        <span className="inline-block text-[9px] font-black uppercase tracking-wider text-[#014900] bg-white px-2 py-0.5 rounded border border-gray-200">
                          {proj.category}
                        </span>
                      )}
                    </div>
                    <Link
                      href="/admin/innovations"
                      className="px-3 py-1.5 bg-[#014900] text-white hover:bg-[#D9A000] hover:text-[#014900] text-[10px] font-black uppercase tracking-wider rounded-xl shrink-0 transition-colors shadow-xs"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/admin/innovations"
              className="w-full py-2.5 bg-gray-100 hover:bg-[#014900] text-gray-700 hover:text-white rounded-xl text-xs font-black text-center block transition-colors uppercase tracking-wider"
            >
              Open Project Queue ({stats.approvedInnovations + stats.pendingInnovations}) →
            </Link>
          </div>

          {/* Institutional Audit Logs Widget */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#014900]" />
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                  Audit Activity Trail
                </h4>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Live Log</span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="text-center py-6 px-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-gray-500 text-xs font-medium">No recorded administrative actions yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1 divide-y divide-gray-100">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="text-xs pl-2 pt-2 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-gray-900 text-[11px] truncate">{log.user_name}</span>
                      <span className="text-[9px] text-gray-400 font-semibold">{log.timestamp ? String(log.timestamp).substring(11, 16) : ''}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 font-medium leading-tight">{log.details || log.action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
