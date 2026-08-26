'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  UserCheck, 
  Key, 
  X, 
  AlertCircle,
  Mail,
  Calendar,
  Lock,
  Sparkles,
  ShieldAlert,
  CheckSquare,
  Square
} from 'lucide-react';

interface AdminUserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  created_at?: string;
}

const UNION_LOGO_AVATAR = 'https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png';

const DEFAULT_USERS_SEED: AdminUserItem[] = [
  {
    id: 1,
    name: 'GNUTS Secretariat',
    email: 'admin@gnuts.org.gh',
    role: 'Super Admin',
    avatar: UNION_LOGO_AVATAR,
    created_at: '2026-01-01',
  },
  {
    id: 2,
    name: 'PRO',
    email: 'joevardy2004@gmail.com',
    role: 'Super Admin',
    avatar: UNION_LOGO_AVATAR,
    created_at: '2026-01-01',
  },
];

const ROLES_LIST = [
  {
    id: 'Super Admin',
    label: 'Super Admin',
    desc: 'Unrestricted full system access to all modules, users, security & database settings',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'Press & Media',
    label: 'Press & Media Officer',
    desc: 'Authorized to draft, publish, and manage Union press releases and news',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'Innovation Director',
    label: 'Innovation Director',
    desc: 'Authorized to review, approve, and showcase TVET student technology projects',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 'Financial Secretary',
    label: 'Financial Secretary',
    desc: 'Authorized to manage scholarships, student bursary funds, and financial statements',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
];

export default function UsersManagementClient({
  initialUsers = []
}: {
  initialUsers?: AdminUserItem[];
}) {
  const [usersList, setUsersList] = useState<AdminUserItem[]>(
    initialUsers.length > 0 ? initialUsers : DEFAULT_USERS_SEED
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Real-time synchronization with Railway MySQL / Database
  useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      setUsersList(initialUsers);
    }
  }, [initialUsers]);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.users) && data.users.length > 0) {
          setUsersList(data.users);
        }
      })
      .catch(() => {});

    fetch('/api/admin/db-status')
      .then((res) => res.json())
      .then((data) => setDbStatus(data))
      .catch(() => {});
  }, []);

  // Multi-Selection State (Excludes Root ID 1)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminUserItem | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Press & Media',
    avatar: '',
  });

  const filteredUsers = usersList.filter((item: any) => {
    const q = (searchQuery || '').toLowerCase();
    const nameStr = (item.name || item.full_name || '').toLowerCase();
    const emailStr = (item.email || '').toLowerCase();
    const roleStr = (item.role || '').toLowerCase();
    const matchesSearch =
      nameStr.includes(q) ||
      emailStr.includes(q) ||
      roleStr.includes(q);
    const matchesRole =
      roleFilter === 'ALL' || roleStr === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  // Eligible deletable users (cannot delete Root ID 1)
  const deletableUsers = filteredUsers.filter((u) => u.id !== 1);
  const isAllSelected = deletableUsers.length > 0 && deletableUsers.every((u) => selectedIds.includes(u.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(deletableUsers.map((u) => u.id));
    }
  };

  const handleToggleSelectOne = (id: number) => {
    if (id === 1) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Press & Media',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    });
    setFeedbackMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: AdminUserItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      email: item.email,
      password: '', // Leave blank if keeping existing
      role: item.role || 'Press & Media',
      avatar: item.avatar || '',
    });
    setFeedbackMsg('');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg('');

    try {
      if (editingItem) {
        // Edit Mode
        const res = await fetch(`/api/admin/users/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok) {
          setUsersList((prev) =>
            prev.map((item) =>
              item.id === editingItem.id ? { ...item, ...formData } : item
            )
          );
          setIsModalOpen(false);
        } else {
          setFeedbackMsg(data.error || 'Failed to update user');
        }
      } else {
        // Create Mode
        if (!formData.password) {
          setFeedbackMsg('Password is required for new officer accounts');
          setIsSaving(false);
          return;
        }

        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        if (res.ok && data.user) {
          setUsersList([data.user, ...usersList]);
          setIsModalOpen(false);
        } else {
          setFeedbackMsg(data.error || 'Failed to create user');
        }
      }
    } catch {
      setFeedbackMsg('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (id === 1) {
      alert('The root system super administrator account (ID 1) cannot be deleted.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setUsersList((prev) => prev.filter((item) => item.id !== id));
        setSelectedIds((prev) => prev.filter((it) => it !== id));
        setIsDeletingId(null);
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch {
      alert('Network error while deleting user');
    }
  };

  const handleBulkDeleteUsers = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await res.json();
      if (res.ok) {
        setUsersList((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
        setSelectedIds([]);
        setIsBulkDeleteModalOpen(false);
      } else {
        alert(data.error || 'Failed to bulk delete selected users');
      }
    } catch {
      alert('Network error during bulk delete');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-['Montserrat',sans-serif] pb-20">
      
      {/* 1. Header with Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#014900] tracking-tight">
            Admin Users & RBAC Matrix
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-0.5">
            Manage executive officer accounts, assign role permissions, and govern portal access ({usersList.length} total)
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Officer / Admin</span>
        </button>
      </div>

      {/* Live Database Connection Status Banner */}
      {dbStatus && (
        dbStatus.connected_to_mysql ? (
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Live Railway Database Connected • {dbStatus.configured_host}</span>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 font-black text-amber-900 uppercase tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
              <span>Storage Notice: Local Fallback Mode Active</span>
            </div>
            <p className="text-[11px] text-amber-800 font-medium">
              The site is currently reading from the local file snapshot instead of your live Railway MySQL database. 
              {dbStatus.error ? ` Connection Error: ${dbStatus.error}` : ' Please ensure DATABASE_URL in Vercel is set to the Railway Public TCP URL and redeployed.'}
            </p>
          </div>
        )
      )}

      {/* 2. Search & Role Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          {deletableUsers.length > 0 && (
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl text-xs font-bold text-gray-700 cursor-pointer transition-colors shrink-0"
              title={isAllSelected ? 'Deselect all officers' : 'Select all officers for bulk actions'}
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
              placeholder="Search officer name, email, role..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
            />
          </div>
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x sm:flex-wrap w-full md:w-auto pb-1 sm:pb-0 no-scrollbar scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
          {['ALL', 'Super Admin', 'Press & Media', 'Innovation Director', 'Financial Secretary'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                roleFilter === r
                  ? 'bg-[#014900] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 3. User Accounts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredUsers.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isRoot = item.id === 1;
          const roleObj = ROLES_LIST.find((r) => r.id === item.role) || {
            label: item.role,
            desc: 'Authorized Officer',
            color: 'bg-gray-100 text-gray-800 border-gray-200',
          };

          const avatarSrc = item.avatar
            ? (item.avatar.startsWith('http') || item.avatar.startsWith('/') ? item.avatar : `/${item.avatar}`)
            : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-[#014900] relative group ${
                isSelected ? 'border-[#014900] ring-2 ring-[#014900]/20 bg-emerald-50/10' : 'border-gray-200/90'
              }`}
            >
              {/* User Profile Top */}
              <div className="flex items-start justify-between gap-2 sm:gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {!isRoot && (
                    <button
                      type="button"
                      onClick={() => handleToggleSelectOne(item.id)}
                      className="p-1 text-gray-400 hover:text-[#014900] cursor-pointer shrink-0"
                      title={isSelected ? 'Deselect officer' : 'Select officer for deletion'}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#014900]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1.5 sm:p-2 border-2 border-[#D9A000]/60 shadow-xs flex items-center justify-center shrink-0">
                    <img
                      src={UNION_LOGO_AVATAR}
                      alt="GNUTS Union Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h3 className="text-sm sm:text-base font-black text-[#014900] group-hover:text-[#D9A000] transition-colors leading-snug break-words">
                      {item.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-semibold text-gray-500 flex items-center gap-1 min-w-0">
                      <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="break-all">{item.email}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 bg-gray-100 hover:bg-amber-50 text-gray-600 hover:text-amber-700 rounded-xl transition-colors cursor-pointer"
                    title="Edit User Profile"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {!isRoot && (
                    <button
                      type="button"
                      onClick={() => setIsDeletingId(item.id)}
                      className="p-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                      title="Remove User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Role Badge & Permissions Scope */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${roleObj.color}`}>
                    {roleObj.label}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    Account #{item.id}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                  {roleObj.desc}
                </p>
              </div>

              {/* Account Date Footer */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Enrolled: {item.created_at ? String(item.created_at).substring(0, 10) : '2026'}</span>
                </span>
                <span className="text-[#014900] font-black uppercase tracking-wider text-[10px]">
                  Active Officer
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* 4. FLOATING BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-40 bg-gray-950/95 text-white backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-white/20 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#D9A000] text-[#014900] text-xs font-black">
              {selectedIds.length}
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-gray-200">
              {selectedIds.length === 1 ? '1 officer selected' : `${selectedIds.length} officers selected`}
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

      {/* 5. CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-6 animate-fadeIn">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#014900] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#014900] uppercase tracking-tight">
                    {editingItem ? 'Edit Officer Account' : 'Add New Officer'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Access Control & Role Permissions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackMsg && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              
              {/* Officer Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  Officer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Comrade Kweku Baah"
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900] focus:bg-white"
                />
              </div>

              {/* Email & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="officer@gnuts.org.gh"
                    className="w-full px-3.5 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Assigned Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-bold outline-none focus:border-[#014900]"
                  >
                    {ROLES_LIST.map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-wider text-gray-700">
                  {editingItem ? 'New Password (Leave blank to keep current)' : 'Account Password *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingItem ? '••••••••' : 'Enter strong password'}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-medium outline-none focus:border-[#014900] focus:bg-white"
                />
              </div>

              {/* Account Avatar Badge */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white p-1.5 border border-[#D9A000]/60 shadow-xs flex items-center justify-center shrink-0">
                  <img
                    src={UNION_LOGO_AVATAR}
                    alt="GNUTS Union Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-black text-[#014900] uppercase tracking-wide">Official Union Emblem</p>
                  <p className="text-[11px] text-gray-500 font-medium">Standardized as the official account avatar for all executive officers.</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-[#014900] hover:bg-[#003300] text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-xl transition-all cursor-pointer disabled:opacity-70"
                >
                  {isSaving ? 'Saving...' : (editingItem ? 'Update Officer' : 'Create Officer')}
                </button>
              </div>

            </form>
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
            <h4 className="text-base font-black text-gray-900">Remove Officer Account?</h4>
            <p className="text-xs text-gray-600 font-medium">
              This officer will immediately lose access to the administrative portal.
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
                onClick={() => handleDeleteUser(isDeletingId)}
                className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. BULK DELETE USERS CONFIRMATION MODAL */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Montserrat',sans-serif]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-gray-900 uppercase">
                  Bulk Remove Officers
                </h4>
                <span className="text-xs font-bold text-rose-600">
                  {selectedIds.length} officer account(s) selected
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              Are you sure you want to permanently revoke access and delete <strong className="text-gray-900">{selectedIds.length} selected officer accounts</strong>? This action cannot be undone.
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
                onClick={handleBulkDeleteUsers}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Revoking...' : `Delete ${selectedIds.length} Officers`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
