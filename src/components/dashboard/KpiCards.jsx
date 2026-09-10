import React from 'react';
import { Activity, Radio, CheckCircle2, XCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedCounter } from '@/components/ui/animated-counter';

export function KpiCards({ stats = {} }) {
  const total = stats.surveys || 0;
  const stations = stats.stations || 0;
  const allowed = stats.allowed || 0;
  const denied = stats.denied || 0;

  const cards = [
    {
      label: 'ผลสำรวจทั้งหมด',
      value: total,
      icon: Activity,
      iconColor: 'text-blue-400',
      bgColor: 'from-blue-500/10 to-transparent',
      borderColor: 'hover:border-blue-500/40',
      valColor: 'text-blue-400'
    },
    {
      label: 'สถานีในระบบ',
      value: stations,
      icon: Radio,
      iconColor: 'text-cyan-400',
      bgColor: 'from-cyan-500/10 to-transparent',
      borderColor: 'hover:border-cyan-500/40',
      valColor: 'text-cyan-400'
    },
    {
      label: 'อนุญาตเข้าพื้นที่',
      value: allowed,
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      bgColor: 'from-emerald-500/10 to-transparent',
      borderColor: 'hover:border-emerald-500/40',
      valColor: 'text-emerald-400'
    },
    {
      label: 'ไม่อนุญาตเข้าพื้นที่',
      value: denied,
      icon: XCircle,
      iconColor: 'text-rose-400',
      bgColor: 'from-rose-500/10 to-transparent',
      borderColor: 'hover:border-rose-500/40',
      valColor: 'text-rose-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <GlassCard
            key={idx}
            className={`flex flex-col justify-between bg-gradient-to-b ${card.bgColor} ${card.borderColor}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm xl:text-base font-semibold text-slate-200 leading-normal whitespace-nowrap truncate" title={card.label}>
                {card.label}
              </span>
              <div className="kpi-icon-box flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900/60 border border-slate-700/50 shadow-inner">
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <div className={`mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight leading-none lg:text-5xl ${card.valColor} whitespace-nowrap`}>
              <AnimatedCounter value={card.value} />
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
