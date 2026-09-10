import React from 'react';
import { PieChart } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

export function SurveyDonut({ stats = {} }) {
  const total = stats.surveys || 0;
  const allowed = stats.allowed || 0;
  const denied = stats.denied || 0;
  const pending = Math.max(total - allowed - denied, 0);

  const allowedPct = total > 0 ? (allowed / total) * 100 : 0;
  const deniedPct = total > 0 ? (denied / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;

  const donutGradient =
    total > 0
      ? `conic-gradient(#00d49a 0% ${allowedPct}%, #ff4f67 ${allowedPct}% ${allowedPct + deniedPct}%, #8b5cf6 ${allowedPct + deniedPct}% 100%)`
      : 'conic-gradient(#00d49a 0% 0%, #1e293b 0% 100%)';

  return (
    <GlassCard className="flex flex-col" hoverEffect={false}>
      {/* Panel Title */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 flex-shrink-0">
          <PieChart className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-normal leading-normal whitespace-nowrap">
          สัดส่วนผลการสำรวจ
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-5">
        {/* Donut graphic */}
        <div
          className="relative flex h-40 w-40 items-center justify-center rounded-full p-3 shadow-md dark:shadow-[0_0_20px_rgba(0,0,0,0.4)] flex-shrink-0"
          style={{ background: donutGradient }}
        >
          <div className="survey-donut-center flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white dark:bg-[#051326] shadow-xs dark:shadow-inner border border-slate-100 dark:border-slate-800">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
              {allowedPct.toFixed(1)}%
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-300 whitespace-nowrap">อนุญาต</span>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="flex w-full flex-col gap-3 sm:max-w-[210px]">
          {/* Allowed */}
          <div className="flex items-center justify-between rounded-xl border border-emerald-200/90 dark:border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/20 px-3.5 py-2.5 whitespace-nowrap shadow-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#00d49a] flex-shrink-0" />
              <span className="text-sm font-bold text-emerald-900 dark:text-slate-200 whitespace-nowrap">อนุญาต</span>
            </div>
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">{allowed.toLocaleString()}</span>
              <span className="text-xs text-emerald-700/80 dark:text-slate-400 font-semibold">({allowedPct.toFixed(0)}%)</span>
            </div>
          </div>

          {/* Denied */}
          <div className="flex items-center justify-between rounded-xl border border-rose-200/90 dark:border-rose-500/20 bg-rose-50/70 dark:bg-rose-950/20 px-3.5 py-2.5 whitespace-nowrap shadow-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#ff4f67] flex-shrink-0" />
              <span className="text-sm font-bold text-rose-900 dark:text-slate-200 whitespace-nowrap">ไม่อนุญาต</span>
            </div>
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-base font-mono font-bold text-rose-600 dark:text-rose-400">{denied.toLocaleString()}</span>
              <span className="text-xs text-rose-700/80 dark:text-slate-400 font-semibold">({deniedPct.toFixed(0)}%)</span>
            </div>
          </div>

          {/* Pending */}
          <div className="flex items-center justify-between rounded-xl border border-purple-200/90 dark:border-purple-500/20 bg-purple-50/70 dark:bg-purple-950/20 px-3.5 py-2.5 whitespace-nowrap shadow-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-[0_0_6px_#8b5cf6] flex-shrink-0" />
              <span className="text-sm font-bold text-purple-900 dark:text-slate-200 whitespace-nowrap">รอพิจารณา</span>
            </div>
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-base font-mono font-bold text-purple-600 dark:text-purple-400">{pending.toLocaleString()}</span>
              <span className="text-xs text-purple-700/80 dark:text-slate-400 font-semibold">({pendingPct.toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
