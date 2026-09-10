import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ShieldCheck, Radio } from 'lucide-react';
import { APP_VERSION } from '@/version';
import nbtcLogo from '@/assets/images/nbtc-logo-dashboard.png';

export function Navbar() {
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
      className="sticky top-0 z-40 h-[88px] w-full border-b shadow-[0_8px_30px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-all duration-300"
      style={{
        background: 'var(--theme-navbar-bg)',
        borderColor: 'var(--theme-navbar-border)'
      }}
    >
      <div className="mx-auto flex h-full items-center justify-between px-6 lg:px-10">
        {/* Brand */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          <img
            src={nbtcLogo}
            alt="NBTC Logo"
            onError={(e) => {
              if (e.currentTarget.src !== '/assets/images/nbtc-logo-dashboard.png') {
                e.currentTarget.src = '/assets/images/nbtc-logo-dashboard.png';
              }
            }}
            className="h-13 w-auto object-contain drop-shadow-[0_0_12px_rgba(8,127,255,0.3)] flex-shrink-0"
          />
          <div className="flex items-baseline gap-2.5">
            <span className="text-xl lg:text-2xl font-black tracking-wide text-white drop-shadow-sm whitespace-nowrap">
              NBTC MICROWAVE
            </span>
            <div className="h-4 w-px bg-slate-700/80 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold tracking-[0.2em] text-cyan-400 whitespace-nowrap">
                SURVEY CONTROL ROOM
              </span>
              <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300 border border-blue-500/30 whitespace-nowrap">
                v{APP_VERSION}
              </span>
            </div>
          </div>
        </div>

        {/* Live System Strip */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4 text-base text-slate-300 flex-shrink-0">
          {/* Online & Storage status indicator */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-emerald-300 whitespace-nowrap">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-semibold whitespace-nowrap">ระบบพร้อมใช้งาน</span>
          </div>

          <div className="hidden xl:flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-cyan-300 text-sm font-medium whitespace-nowrap">
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            <span className="whitespace-nowrap">จุดเก็บข้อมูล: Cloud Blob</span>
          </div>

          <div className="h-6 w-px bg-slate-700/60 hidden xl:block" />

          {/* Date & Time */}
          <div className="flex items-center gap-3 text-sm font-medium whitespace-nowrap">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="h-4 w-4 text-cyan-400" />
              <span className="whitespace-nowrap">{dateStr}</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-white">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="whitespace-nowrap">{timeStr} น.</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700/60" />

          {/* User profile */}
          <div className="flex items-center gap-2.5 whitespace-nowrap">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(8,127,255,0.4)] flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-left leading-tight whitespace-nowrap">
              <div className="text-sm font-bold text-white whitespace-nowrap">ผู้ดูแลระบบ</div>
              <div className="text-xs text-slate-400 whitespace-nowrap">Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
