import React from 'react';
import { Activity, Radio, CheckCircle2, XCircle, ArrowRight, List } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedCounter } from '@/components/ui/animated-counter';

export function KpiCards({ stats = {} }) {
  const safeStats = stats || {};
  const total = safeStats.surveys || 0;
  const stations = safeStats.stations || 0;
  const allowed = safeStats.allowed || 0;
  const denied = safeStats.denied || 0;

  const cards = [
    {
      label: 'ผลสำรวจทั้งหมด',
      value: total,
      unit: 'รายการ',
      icon: Activity,
      accentClass: 'kpi-card-blue',
      iconBgClass: 'kpi-icon-blue',
      valColorClass: 'text-blue-600 dark:text-blue-400',
      linkText: `ดูข้อมูล ${total.toLocaleString()} รายการ`,
    },
    {
      label: 'สถานีในระบบทั้งหมด',
      value: stations,
      unit: 'สถานี',
      icon: Radio,
      accentClass: 'kpi-card-purple',
      iconBgClass: 'kpi-icon-purple',
      valColorClass: 'text-purple-600 dark:text-purple-400',
      linkText: `ดูข้อมูล ${stations.toLocaleString()} สถานี`,
    },
    {
      label: 'อนุญาตเข้าพื้นที่สำรวจ',
      value: allowed,
      unit: 'สถานี',
      icon: CheckCircle2,
      accentClass: 'kpi-card-emerald',
      iconBgClass: 'kpi-icon-emerald',
      valColorClass: 'text-emerald-600 dark:text-emerald-400',
      linkText: `ดูข้อมูล ${allowed.toLocaleString()} สถานี`,
    },
    {
      label: 'ไม่อนุญาตเข้าพื้นที่สำรวจ',
      value: denied,
      unit: 'สถานี',
      icon: XCircle,
      accentClass: 'kpi-card-rose',
      iconBgClass: 'kpi-icon-rose',
      valColorClass: 'text-rose-600 dark:text-rose-400',
      linkText: `ดูข้อมูล ${denied.toLocaleString()} สถานี`,
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <GlassCard
            key={idx}
            className={`flex flex-col justify-between p-5 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-md ${card.accentClass}`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm xl:text-base font-bold text-slate-800 dark:text-slate-200 leading-snug truncate" title={card.label}>
                  {card.label}
                </span>
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 ${card.iconBgClass}`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none ${card.valColorClass}`}>
                  <AnimatedCounter value={card.value} />
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.unit}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold cursor-pointer group">
              <span className="text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors flex items-center gap-1 truncate">
                <List className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-300" />
                <span>{card.linkText}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-300 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
