'use client';

import { useState } from 'react';
import { 
  Mail, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  X, 
  User, 
  Phone, 
  Building2, 
  Calendar, 
  MessageSquare, 
  Send, 
  Archive, 
  MailOpen,
  ArrowUpRight,
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';

interface ContactMessageItem {
  id: number;
  full_name?: string;
  name?: string;
  email: string;
  phone?: string;
  institution?: string;
  subject: string;
  message: string;
  status: string;
  created_at?: string;
}

export default function MessagesManagementClient({
  initialMessages = []
}: {
  initialMessages?: ContactMessageItem[];
}) {
  const [messagesList, setMessagesList] = useState<ContactMessageItem[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modal States
  const [readingMessage, setReadingMessage] = useState<ContactMessageItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const unreadCount = messagesList.filter((m) => (m.status || 'unread').toLowerCase() === 'unread').length;

  const filteredMessages = messagesList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const nameStr = (item.full_name || item.name || '').toLowerCase();
    const matchesSearch =
      nameStr.includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      item.message.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'ALL' || item.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  // Selection handlers
  const isAllSelected = filteredMessages.length > 0 && filteredMessages.every((it) => selectedIds.includes(it.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMessages.map((it) => it.id));
    }
  };

  const handleToggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleUpdateStatus = async (item: ContactMessageItem, newStatus: string) => {
    try {
      await fetch(`/api/admin/messages/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setMessagesList((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, status: newStatus } : m))
      );
      if (readingMessage && readingMessage.id === item.id) {
        setReadingMessage({ ...readingMessage, status: newStatus });
      }
    } catch {
      alert('Failed to update message status');
    }
  };

  const handleOpenReadingModal = (item: ContactMessageItem) => {
    setReadingMessage(item);
    if ((item.status || 'unread').toLowerCase() === 'unread') {
      handleUpdateStatus(item, 'read');
    }
  };

  const handleDeleteMessage = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessagesList((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((it) => it !== id));
        setIsDeletingId(null);
        if (readingMessage && readingMessage.id === id) {
          setReadingMessage(null);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete message');
      }
    } catch {
      alert('Failed to delete message');
    }
  };

  const handleBulkDeleteMessages = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (res.ok) {
        setMessagesList((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        if (readingMessage && selectedIds.includes(readingMessage.id)) {
          setReadingMessage(null);
        }
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
      } else {
        alert('Failed to bulk delete selected messages');
      }
    } catch {
      alert('Network error during bulk delete');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-['Montserrat',sans-serif] pb-20">
      
      {/* 1. Header with Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#014900] tracking-tight">
            Secretariat Inquiries & Messages
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">
            Student feedback, institutional partnership requests, and press inquiries ({messagesList.length} total)
          </p>
        </div>
      </div>

      {/* 2. Search & Status Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {filteredMessages.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 cursor-pointer transition-colors shrink-0"
              title={isAllSelected ? 'Deselect all messages' : 'Select all messages for bulk actions'}
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-[#014900]" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span className="hidden sm:inline">Select All</span>
            </button>
          )}

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sender, email, subject..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar scrollbar-none pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Inquiries' },
            { id: 'UNREAD', label: `Unread ${unreadCount > 0 ? `(${unreadCount})` : ''}` },
            { id: 'READ', label: 'Read' },
            { id: 'REPLIED', label: 'Replied' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#014900] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Messages List */}
      <div className="space-y-3">
        {filteredMessages.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isUnread = (item.status || 'unread').toLowerCase() === 'unread';
          const isReplied = (item.status || '').toLowerCase() === 'replied';
          const isArchived = (item.status || '').toLowerCase() === 'archived';
          const senderName = item.full_name || item.name || 'Technical Student';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border shadow-xs hover:shadow-md transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isSelected
                  ? 'border-[#014900] ring-2 ring-[#014900]/20 bg-emerald-50/10'
                  : isUnread
                  ? 'border-l-4 border-l-amber-500 bg-amber-50/20 border-gray-200'
                  : 'border-gray-200'
              }`}
            >
              {/* Left Column: Avatar + Sender Info + Message Snippet */}
              <div className="flex items-start gap-4 flex-grow min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleSelectOne(item.id)}
                  className="p-1 text-gray-400 hover:text-[#014900] cursor-pointer mt-1 shrink-0"
                  title={isSelected ? 'Deselect message' : 'Select message for deletion'}
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#014900]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  isUnread ? 'bg-amber-500 text-white' : 'bg-emerald-50 text-[#014900]'
                }`}>
                  {senderName.charAt(0).toUpperCase()}
                </div>

                <div className="space-y-1 min-w-0 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-xs text-gray-900 truncate">
                      {senderName}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate">
                      &lt;{item.email}&gt;
                    </span>

                    {/* Status Tag */}
                    <span
                      className={`ml-auto sm:ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isUnread
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : isReplied
                          ? 'bg-blue-100 text-blue-800'
                          : isArchived
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-[#014900]">
                      {item.subject}
                    </h5>
                    <p className="text-xs text-gray-600 font-medium line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-gray-500 font-semibold pt-1">
                    {item.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#D9A000]" />
                        <span>{item.phone}</span>
                      </span>
                    )}
                    {item.created_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{String(item.created_at).substring(0, 16)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                {/* View / Open Button */}
                <button
                  type="button"
                  onClick={() => handleOpenReadingModal(item)}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-[#014900] text-[#014900] hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <MailOpen className="w-3.5 h-3.5" />
                  <span>Read</span>
                </button>

                {/* Direct Email Reply */}
                <a
                  href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject)}&body=Dear ${encodeURIComponent(senderName)},%0D%0A%0D%0AThank you for contacting the Ghana National Union of Technical Students (GNUTS).%0D%0A%0D%0A`}
                  onClick={() => handleUpdateStatus(item, 'replied')}
                  className="p-2 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-700 rounded-xl transition-colors"
                  title="Reply via Email"
                >
                  <Send className="w-4 h-4" />
                </a>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => setIsDeletingId(item.id)}
                  className="p-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                  title="Delete Inquiry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredMessages.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-200">
          <Mail className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="font-bold">No messages found</p>
          <p className="text-xs mt-1">Inbox is all clear or no inquiries match your search.</p>
        </div>
      )}

      {/* 4. FLOATING BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-40 bg-gray-950/95 text-white backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-white/20 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#D9A000] text-[#014900] text-xs font-black">
              {selectedIds.length}
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-gray-200">
              {selectedIds.length === 1 ? '1 message selected' : `${selectedIds.length} messages selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              Clear Selection
            </button>
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. READING / DETAILS MODAL */}
      {readingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-6 animate-fadeIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#014900] flex items-center justify-center font-black text-sm">
                  {(readingMessage.full_name || readingMessage.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#014900]">
                    {readingMessage.full_name || readingMessage.name || 'Technical Student'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">{readingMessage.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReadingMessage(null)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-[#D9A000] text-gray-600 hover:text-[#014900] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Meta Bar: Phone, Received Date, Status */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Phone / WhatsApp</p>
                <p className="font-bold text-gray-900">{readingMessage.phone || 'Not provided'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Institution / Chapter</p>
                <p className="font-bold text-gray-900">{readingMessage.institution || 'Technical Student'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Received At</p>
                <p className="font-bold text-gray-900">{readingMessage.created_at ? String(readingMessage.created_at).substring(0, 16) : 'Recently'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Current Status</p>
                <div className="flex items-center gap-1.5">
                  <select
                    value={readingMessage.status}
                    onChange={(e) => handleUpdateStatus(readingMessage, e.target.value)}
                    className="px-2.5 py-1 bg-white rounded-xl border border-gray-200 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Subject & Full Message Body */}
            <div className="space-y-2">
              <h4 className="text-base font-black text-gray-900 leading-snug">
                {readingMessage.subject}
              </h4>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                {readingMessage.message}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsDeletingId(readingMessage.id)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Delete Inquiry
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setReadingMessage(null)}
                  className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={`mailto:${readingMessage.email}?subject=Re: ${encodeURIComponent(readingMessage.subject)}&body=Dear ${encodeURIComponent(readingMessage.full_name || readingMessage.name || 'Technical Student')},%0D%0A%0D%0AThank you for contacting the Ghana National Union of Technical Students (GNUTS).%0D%0A%0D%0A`}
                  onClick={() => handleUpdateStatus(readingMessage, 'replied')}
                  className="px-6 py-2.5 rounded-2xl bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] font-black text-xs uppercase tracking-wider shadow-md hover:shadow-xl transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. INDIVIDUAL DELETE CONFIRMATION MODAL */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 text-center space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-gray-900">Delete this Inquiry?</h4>
            <p className="text-xs text-gray-600 font-medium">
              This message will be permanently removed from the secretariat inbox.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMessage(isDeletingId)}
                className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. BULK DELETE CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-gray-900 uppercase">
                  Bulk Delete Inquiries
                </h4>
                <span className="text-xs font-bold text-rose-600">
                  {selectedIds.length} message(s) selected
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-gray-900">{selectedIds.length} selected messages</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteMessages}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Deleting...' : `Delete ${selectedIds.length} Messages`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
