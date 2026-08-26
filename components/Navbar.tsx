'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, ChevronRight, ExternalLink, Sparkles, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopDrawerOpen, setDesktopDrawerOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 30);

      // Check if viewing blog detail page
      if (pathname.startsWith('/blog/') && pathname !== '/blog') {
        const mainImgElem = document.getElementById('article-main-image');
        const triggerPoint = mainImgElem ? (mainImgElem.getBoundingClientRect().top + scrollY - 140) : 320;
        
        setShowProgressBar(scrollY >= triggerPoint);

        const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
        if (totalScrollable > 0) {
          setReadingProgress(Math.min(100, Math.max(0, (scrollY / totalScrollable) * 100)));
        }
      } else {
        setShowProgressBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Scholarships & Opportunities', href: '/scholarships' },
    { name: 'Innovations', href: '/innovations' },
    { name: 'News & Events', href: '/blog' },
    { name: 'Contact Us', href: '/contact' },
  ];

  const drawerLinks = [
    { name: 'Our Leadership', href: '/#executives-section' },
    { name: 'Our History', href: '/about#history' },
    { name: 'Legacy & Leadership Gallery', href: '/gallery' },
    { name: 'Check your CTVET result', href: 'https://ctvet.gov.gh/results/', external: true },
    { name: 'Resources / Constitution', href: '/resources' },
  ];

  const handleDrawerLinkClick = (e: React.MouseEvent, href: string) => {
    setDesktopDrawerOpen(false);
    setMobileMenuOpen(false);

    // If it's a leadership link or hash on current page
    if (href === '/#executives-section' || href.startsWith('#')) {
      const targetId = href.replace('/#', '').replace('#', '');
      const elem = document.getElementById(targetId) || document.getElementById('executives-section') || document.getElementById('leadership');
      if (elem) {
        e.preventDefault();
        elem.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${targetId}`);
      }
    }
  };

  return (
    <>
      {/* 1. White Top Bar Before Navbar */}
      <div className="bg-white text-[#014900] text-xs py-2 px-4 border-b border-gray-200 font-medium font-['Montserrat',sans-serif]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          {/* Left Side: P.O. Box, Phone, Email */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5 text-gray-700">
              <MapPin className="w-3.5 h-3.5 text-[#014900] shrink-0" />
              <span>P.O. Box GP 2329, Accra - Ghana</span>
            </div>
            <a
              href="tel:+233302987654"
              className="flex items-center gap-1.5 hover:text-[#D9A000] transition-colors text-gray-700 font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-[#014900] shrink-0" />
              <span>+233 (0) 302 987 654</span>
            </a>
            <a
              href="mailto:info@gnuts.org.gh"
              className="flex items-center gap-1.5 hover:text-[#D9A000] transition-colors text-gray-700 font-semibold"
            >
              <Mail className="w-3.5 h-3.5 text-[#014900] shrink-0" />
              <span>info@gnuts.org.gh</span>
            </a>
          </div>

          {/* Right Side: Social Media Handles */}
          <div className="flex items-center gap-3.5 text-gray-600">
            <span className="text-[11px] sm:text-xs font-bold text-[#014900] hidden lg:inline">
              Connect With Us:
            </span>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#014900] hover:text-[#D9A000] transition-colors" aria-label="Facebook">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#014900] hover:text-[#D9A000] transition-colors" aria-label="Twitter">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#014900] hover:text-[#D9A000] transition-colors" aria-label="Instagram">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-[#014900] hover:text-[#D9A000] transition-colors" aria-label="TikTok">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.33 1.52-1.34 2.52-.04.99.4 1.97 1.17 2.57.8.63 1.9.82 2.87.53 1.05-.3 1.88-1.15 2.11-2.21.1-.47.11-.96.11-1.44.02-4.14.01-8.28.02-12.42z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Sticky Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 relative font-['Montserrat',sans-serif] ${
          isScrolled
            ? 'bg-[#014900] shadow-xl py-3 border-b-2 border-[#D9A000]/40'
            : 'bg-[#014900] py-3.5 border-b border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Branding */}
          <Link href="/" className="flex items-center gap-3.5 group py-1">
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
              <img
                src="https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png"
                alt="GNUTS Emblem"
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <span className="font-['Montserrat'] font-black text-white text-2xl sm:text-3xl tracking-wider">
              GNUTS
            </span>
          </Link>

          {/* Desktop Navigation Links — Montserrat Bold when Selected, Montserrat Regular when Unselected */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide transition-all relative py-1.5 group ${
                    isActive
                      ? 'font-bold text-white'
                      : 'font-normal text-white/85 hover:text-white'
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute bottom-0 left-0 h-[2.5px] bg-[#D9A000] transition-all duration-300 ease-out ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDesktopDrawerOpen(!desktopDrawerOpen)}
              className="hidden lg:flex flex-col justify-center gap-1.5 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle Quick Resources"
              title="Quick Resources"
            >
              <span className="w-5 h-0.5 bg-[#D9A000] rounded-full" />
              <span className="w-5 h-0.5 bg-white rounded-full" />
              <span className="w-5 h-0.5 bg-[#D9A000] rounded-full" />
            </button>
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-[#D9A000] focus:outline-none cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className="w-full h-0.5 bg-current transition-all" />
                <span className="w-full h-0.5 bg-current transition-all" />
                <span className="w-full h-0.5 bg-current transition-all" />
              </div>
            </button>
          </div>

        </div>

        {/* Reading Progress Bar for Article Detail Pages */}
        {showProgressBar && (
          <div className="w-full bg-[#013300] h-1.5 relative overflow-hidden">
            <div 
              className="bg-[#D9A000] h-full transition-all duration-150 ease-out"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        )}
      </header>

      {/* Desktop & Tablet Slide-Out Quick Resources Drawer Panel */}
      {desktopDrawerOpen && (
        <div className="fixed inset-0 z-50 hidden lg:block animate-fadeIn font-['Montserrat',sans-serif]">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setDesktopDrawerOpen(false)}
          />
          
          <div className="fixed inset-y-0 right-0 w-96 bg-[#014900] text-white p-7 shadow-2xl border-l border-emerald-800/60 z-50 flex flex-col justify-between animate-slideInRight">
            
            <div className="space-y-6">
              <div className="flex items-center justify-end pb-4 border-b border-white/15">
                <button
                  onClick={() => setDesktopDrawerOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-[#D9A000] text-white hover:text-[#014900] flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer"
                  aria-label="Close Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Links Container */}
              <div className="space-y-2.5">
                {drawerLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target={link.external ? '_blank' : '_self'}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    onClick={(e) => handleDrawerLinkClick(e, link.href)}
                    className="group flex items-center justify-between p-3.5 bg-emerald-950/60 hover:bg-[#D9A000] border border-emerald-800/60 hover:border-[#D9A000] rounded-2xl text-xs sm:text-sm font-semibold text-white hover:text-[#014900] transition-all duration-300 shadow-sm hover:translate-x-1 cursor-pointer"
                  >
                    <span className="group-hover:text-[#014900] transition-colors">{link.name}</span>
                    {link.external ? (
                      <ExternalLink className="w-4 h-4 text-[#D9A000] group-hover:text-[#014900] group-hover:scale-110 transition-transform" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#D9A000] group-hover:text-[#014900] group-hover:translate-x-1 transition-transform" />
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Bottom Footer Stamp */}
            <div className="pt-6 border-t border-white/15 space-y-2 text-xs text-gray-200">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png"
                  alt="GNUTS"
                  className="w-6 h-6 object-contain"
                />
                <div>
                  <p className="text-white font-bold uppercase tracking-wide">GNUTS Secretariat</p>
                  <p className="text-[11px] text-gray-300 font-medium">Ghana National Union of Technical Students</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-400 ease-in-out font-['Montserrat',sans-serif] ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="fixed inset-0 bg-black/60 transition-opacity duration-400"
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          className={`fixed inset-y-0 right-0 w-4/5 max-w-sm bg-[#014900] text-white p-6 flex flex-col justify-between shadow-2xl transition-transform duration-400 ease-in-out border-l border-emerald-800/60 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="space-y-6 overflow-y-auto flex-1 pr-1">
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://res.cloudinary.com/dslngzls6/image/upload/v1786982867/gnuts_fav_htclbt.png"
                    alt="GNUTS"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-bold text-lg text-white">GNUTS</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 text-white hover:bg-[#D9A000] hover:text-[#014900] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Links — Montserrat Bold when Selected, Montserrat Regular when Unselected */}
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-2xl text-xs uppercase tracking-wider transition-all ${
                      isActive
                        ? 'font-bold text-white bg-white/15 border-l-4 border-[#D9A000]'
                        : 'font-normal text-gray-100 hover:bg-white/10'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#D9A000]" />
                  </Link>
                );
              })}
            </div>

            {/* Quick Resources Drawer Section */}
            <div className="pt-4 border-t border-white/15">
              <div className="space-y-1.5">
                {drawerLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target={link.external ? '_blank' : '_self'}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    onClick={(e) => handleDrawerLinkClick(e, link.href)}
                    className="group flex items-center justify-between p-3 bg-emerald-950/60 hover:bg-[#D9A000] border border-emerald-800/60 rounded-2xl text-xs font-semibold text-white hover:text-[#014900] transition-all cursor-pointer"
                  >
                    <span className="group-hover:text-[#014900] transition-colors">{link.name}</span>
                    {link.external ? (
                      <ExternalLink className="w-3.5 h-3.5 text-[#D9A000] group-hover:text-[#014900]" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-[#D9A000] group-hover:text-[#014900]" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/15 text-[11px] text-gray-300 space-y-0.5">
            <p className="text-white font-bold uppercase">GNUTS Secretariat</p>
            <p>Ghana National Union of Technical Students</p>
          </div>
        </div>
      </div>
    </>
  );
}
