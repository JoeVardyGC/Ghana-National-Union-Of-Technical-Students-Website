'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Newspaper, 
  Users, 
  GraduationCap, 
  Lightbulb, 
  Briefcase, 
  FileText, 
  Inbox, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles,
  UserCheck,
  Building2,
  Images,
  Sliders
} from 'lucide-react';
import { AdminSessionUser, hasModulePermission } from '@/lib/authTypes';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  sessionUser: AdminSessionUser | null;
}

const NAV_ITEMS = [
  { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'News & Press Releases', href: '/admin/news', icon: Newspaper },
  { name: 'Scholarships & Aid', href: '/admin/scholarships', icon: GraduationCap },
  { name: 'Opportunities & Jobs', href: '/admin/opportunities', icon: Briefcase },
  { name: 'Student Innovations', href: '/admin/innovations', icon: Lightbulb },
  { name: 'Executive Leadership', href: '/admin/executives', icon: Users },
  { name: 'Constitution & Resources', href: '/admin/resources', icon: FileText },
  { name: 'About & Union History', href: '/admin/about', icon: Building2 },
  { name: 'Hero Banners & Media', href: '/admin/banners', icon: Sliders },
  { name: 'Legacy & Gallery', href: '/admin/gallery', icon: Images },
  { name: 'Inquiries & Messages', href: '/admin/messages', icon: Inbox },
  { name: 'Admin Users & Access', href: '/admin/users', icon: ShieldCheck },
  { name: 'System Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayoutClient({ children, sessionUser }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // If on login page, render clean standalone layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If unauthenticated on any other admin route, redirect to login
  useEffect(() => {
    if (!sessionUser && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [sessionUser, pathname, router]);

  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-[#014900] flex items-center justify-center font-['Montserrat',sans-serif]">
        <div className="text-center space-y-3 text-white">
          <div className="w-10 h-10 border-3 border-[#D9A000] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#D9A000] font-bold">Redirecting to Login...</p>
        </div>
      </div>
    );
  }

  const currentUser = sessionUser;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-['Montserrat',sans-serif] text-gray-900">
      
      {/* 1. Desktop Executive Sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#014900] text-white flex-col justify-between shrink-0 shadow-2xl border-r border-emerald-800/60 sticky top-0 h-screen z-30">
        
        {/* Top Header / Branding */}
        <div className="p-6 border-b border-white/10 space-y-4">
          <Link href="/admin" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img
                src="https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png"
                alt="GNUTS"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-black text-xl text-white tracking-wider leading-none block">
                GNUTS
              </span>
              <span className="text-[10px] font-black text-[#D9A000] uppercase tracking-widest block mt-0.5">
                Executive Portal
              </span>
            </div>
          </Link>

          {/* Current Admin User Badge */}
          <div className="p-3 bg-emerald-950/70 border border-emerald-800/60 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-white p-1 border border-[#D9A000]/60 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src="https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png"
                  alt="GNUTS Emblem"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate leading-tight">{currentUser.name}</p>
                <p className="text-[10px] font-bold text-[#D9A000] uppercase tracking-wider truncate mt-0.5">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5 overflow-y-auto flex-grow custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const hasAccess = hasModulePermission(currentUser.role, item.href);

            if (!hasAccess) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all group ${
                  isActive
                    ? 'bg-white text-[#014900] shadow-lg font-black scale-[1.02]'
                    : 'text-emerald-100/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#014900]' : 'text-[#D9A000]'}`} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#014900]" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-emerald-950/40">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-[#D9A000] hover:text-[#014900] text-white text-xs font-bold transition-colors group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#D9A000] group-hover:text-[#014900]" />
              <span>Live Website</span>
            </span>
            <span className="text-[10px] font-black uppercase text-[#D9A000] group-hover:text-[#014900]">Visit ↗</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-red-950/60 hover:bg-red-600 border border-red-800/40 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? 'Logging Out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-[#014900] hover:text-white text-gray-700 transition-colors cursor-pointer"
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Executive Management</span>
              <h2 className="text-sm sm:text-base font-black text-[#014900] capitalize">
                {pathname === '/admin' ? 'Dashboard Overview' : pathname.replace('/admin/', '').replace('-', ' ')}
              </h2>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 text-[#014900] font-bold text-xs border border-gray-200 hover:border-emerald-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D9A000]" />
              <span>Preview Public Site</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>

      {/* 3. Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden font-['Montserrat',sans-serif]">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-[#014900] text-white p-6 flex flex-col justify-between shadow-2xl z-50">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center">
                    <img
                      src="https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png"
                      alt="GNUTS"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="font-black text-lg text-white">GNUTS</span>
                    <span className="text-[10px] font-bold text-[#D9A000] block uppercase tracking-wider">Admin Suite</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-[#D9A000] text-white hover:text-[#014900] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-1.5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  const hasAccess = hasModulePermission(currentUser.role, item.href);

                  if (!hasAccess) return null;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-white text-[#014900] font-black'
                          : 'text-gray-100 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#014900]' : 'text-[#D9A000]'}`} />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
