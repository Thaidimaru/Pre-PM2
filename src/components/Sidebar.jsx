import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ClipboardList, LogOut, Radio, Activity, Sun, Moon, X, ShieldCheck } from 'lucide-react';
import { APP_VERSION } from '@/version';
import { cn } from '@/lib/utils';

export function Sidebar({ currentPage, onNavigate, onLogout, theme, toggleTheme, isMobileOpen, onCloseMobile }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      sublabel: 'ศูนย์ควบคุมภาพรวม',
      icon: LayoutDashboard
    },
    {
      id: 'field',
      label: 'Field Visit',
      sublabel: 'แบบบันทึกตรวจเยี่ยม',
      icon: ClipboardList
    }
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Mobile Header Inside Drawer */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base">เมนูนำทาง</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <div className="px-3 pb-2 text-xs font-bold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">
            Control Center Menu
          </div>
          <nav className="space-y-1.5" aria-label="แถบเมนูหลัก">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer',
                    isActive
                      ? 'bg-blue-600 text-white dark:bg-gradient-to-r dark:from-blue-600/30 dark:to-cyan-500/15 dark:text-white border border-blue-600/30 dark:border-blue-500/40 shadow-sm dark:shadow-[0_0_20px_rgba(8,127,255,0.2)]'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg transition-colors flex-shrink-0',
                      isActive
                        ? 'bg-white/20 text-white dark:bg-blue-500/30 dark:text-cyan-300'
                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-base font-bold">{item.label}</span>
                    <span className={cn('text-xs font-medium', isActive ? 'text-blue-100 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400')}>{item.sublabel}</span>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute right-0 h-6 w-1 rounded-l-full bg-white dark:bg-cyan-400 shadow-[0_0_8px_#24b8ff]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Action buttons */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          {toggleTheme && (
            <button
              type="button"
              onClick={toggleTheme}
              className="group flex w-full items-center gap-3 rounded-xl border border-blue-500/20 px-3.5 py-2.5 text-left text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-500/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex-shrink-0">
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              <span className="text-base font-semibold">
                {theme === 'light' ? 'โหมดกลางคืน' : 'โหมดกลางวัน'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="group flex w-full items-center gap-3 rounded-xl border border-rose-500/20 px-3.5 py-2.5 text-left text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-500/40 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex-shrink-0">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold">ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Footer Version Tag */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 text-center">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">NBTC Microwave Pre-PM</div>
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Control Room v{APP_VERSION}</div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent Fixed Left Panel) */}
      <aside 
        className="hidden lg:flex fixed left-0 top-[88px] z-30 h-[calc(100vh-88px)] w-64 flex-col border-r shadow-sm backdrop-blur-xl transition-all duration-300"
        style={{
          background: 'var(--theme-sidebar-bg)',
          borderColor: 'var(--theme-sidebar-border)'
        }}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl overflow-y-auto"
              style={{
                background: 'var(--theme-sidebar-bg)',
                borderColor: 'var(--theme-sidebar-border)'
              }}
            >
              {navContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
