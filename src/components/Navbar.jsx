import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ShieldCheck, Radio, Menu, X, Sun, Moon } from 'lucide-react';
import { APP_VERSION } from '@/version';
import nbtcLogo from '@/assets/images/nbtc-logo-dashboard.png';

export function Navbar({ isMobileMenuOpen, onToggleMobileMenu, theme, toggleTheme }) {
  const [timeStr, setTimeStr] = useState(() =>
    new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(
        new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = new Date().toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header 
      className="sticky top-0 z-40 h-16 lg:h-[88px] w-full border-b shadow-sm backdrop-blur-xl transition-all duration-300"
      style={{
        background: 'var(--theme-navbar-bg)',
        borderColor: 'var(--theme-navbar-border)'
      }}
    >
      <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3.5 flex-shrink-0">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 lg:hidden hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="เปิดเมนูการใช้งาน"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <img
            src={nbtcLogo}
            alt="NBTC Logo"
            onError={(e) => {
              if (e.currentTarget.src !== '/assets/images/nbtc-logo-dashboard.png') {
                e.currentTarget.src = '/assets/images/nbtc-logo-dashboard.png';
              }
            }}
            className="h-8 sm:h-10 lg:h-12 w-auto object-contain flex-shrink-0"
          />
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black tracking-wide text-slate-900 dark:text-white drop-shadow-sm whitespace-nowrap">
              NBTC MICROWAVE
            </span>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-bold tracking-[0.18em] text-blue-600 dark:text-cyan-400 whitespace-nowrap">
                CONTROL ROOM
              </span>
              <span className="rounded-md bg-blue-100 dark:bg-blue-500/20 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 whitespace-nowrap">
                v{APP_VERSION}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Live System Strip */}
        <div className="hidden lg:flex items-center gap-3 lg:gap-4 text-base text-slate-700 dark:text-slate-300 flex-shrink-0">
          {/* Online status indicator */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1 text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-semibold whitespace-nowrap">ระบบพร้อมใช้งาน</span>
          </div>

          <div className="hidden xl:flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-50 dark:bg-cyan-950/40 px-3.5 py-1 text-blue-700 dark:text-cyan-300 text-sm font-medium whitespace-nowrap">
            <Radio className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
            <span className="whitespace-nowrap"> Cloud Storage Active</span>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 hidden xl:block" />

          {/* Date & Time */}
          <div className="flex items-center gap-3 text-sm font-medium whitespace-nowrap">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
              <span className="whitespace-nowrap">{dateStr}</span>
            </div>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-900 dark:text-white">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="whitespace-nowrap">{timeStr} น.</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

          {/* User profile */}
          <div className="flex items-center gap-2.5 whitespace-nowrap">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-sm flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-left leading-tight whitespace-nowrap">
              <div className="text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">ผู้ดูแลระบบ</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Administrator</div>
            </div>
          </div>
        </div>

        {/* Mobile Quick Controls (Theme Toggle) */}
        <div className="flex lg:hidden items-center gap-2">
          {toggleTheme && (
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 cursor-pointer"
              title="สลับธีม"
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5 text-indigo-600" /> : <Sun className="h-4.5 w-4.5 text-amber-400" />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
