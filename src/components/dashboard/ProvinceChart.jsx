import React from 'react';
import { MapPin } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

export function ProvinceChart({ provinces = [] }) {
  const safeProvinces = Array.isArray(provinces) ? provinces : [];
  const maxProvinceCount = Math.max(...safeProvinces.map((p) => Number(p?.count || 0)), 1);

  return (
    <GlassCard className="flex flex-col h-full" hoverEffect={false}>
      {/* Panel Title */}
      <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-300 flex-shrink-0">
          <MapPin className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-normal leading-normal whitespace-nowrap">
          สรุปผลการสำรวจรายจังหวัด
        </h2>
      </div>

      {/* Map & Province Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 flex-1">
        {/* Thailand Map & Radar Pulses */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[300px] rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 p-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 dark:from-blue-900/20 to-transparent pointer-events-none" />
          <img
            src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Thailand_provinces_th.svg"
            alt="แผนที่ประเทศไทยแบ่งจังหวัด"
            loading="lazy"
            className="h-full max-h-[340px] w-auto object-contain filter contrast-105 opacity-85 dark:grayscale dark:invert dark:contrast-125 dark:brightness-110 dark:mix-blend-screen drop-shadow-sm dark:drop-shadow-md"
          />

          {/* Pulsing Radar Markers */}
          {/* North */}
          <div className="absolute top-[22%] left-[42%]" title="ภาคเหนือ">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_8px_#24b8ff]" />
            </span>
          </div>
          {/* Central / East */}
          <div className="absolute top-[48%] left-[48%]" title="ภาคกลาง / ตะวันออก">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 shadow-[0_0_8px_#087fff]" />
            </span>
          </div>
          {/* South */}
          <div className="absolute top-[75%] left-[44%]" title="ภาคใต้">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_#00d49a]" />
            </span>
          </div>
          {/* Northeast */}
          <div className="absolute top-[35%] left-[62%]" title="ภาคอีสาน">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500 shadow-[0_0_8px_#8b5cf6]" />
            </span>
          </div>
        </div>

        {/* Province List Ranking */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/30 shadow-xs">
            <div className="grid grid-cols-12 gap-2 bg-slate-50/90 dark:bg-slate-900/60 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800/80">
              <span className="col-span-1">#</span>
              <span className="col-span-4">จังหวัด</span>
              <span className="col-span-5">สัดส่วน</span>
              <span className="col-span-2 text-right">รวม</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
              {safeProvinces.length > 0 ? (
                safeProvinces.map((prov, i) => {
                  const pct = Math.max(10, Math.min(100, (prov.count / maxProvinceCount) * 100));
                  return (
                    <div
                      key={prov.name}
                      className="grid grid-cols-12 gap-2 items-center px-4 py-2.5 text-base hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <span className="col-span-1 text-slate-400 text-sm font-mono">{i + 1}.</span>
                      <span className="col-span-4 font-medium text-slate-800 dark:text-slate-100 truncate" title={prov.name}>
                        {prov.name}
                      </span>
                      <div className="col-span-5 flex items-center pr-2">
                        <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="col-span-2 text-right font-mono font-bold text-blue-600 dark:text-cyan-300 text-base">
                        {(prov.count || 0).toLocaleString()}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-base text-slate-400">
                  ยังไม่มีข้อมูลจังหวัด
                </div>
              )}
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#00d49a] flex-shrink-0" />
              <span className="whitespace-nowrap font-medium">อนุญาต</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#ff4f67] flex-shrink-0" />
              <span className="whitespace-nowrap font-medium">ไม่อนุญาต</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-[0_0_6px_#8b5cf6] flex-shrink-0" />
              <span className="whitespace-nowrap font-medium">รอพิจารณา</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
