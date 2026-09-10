import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Radio } from 'lucide-react';
import { ShinyText } from '@/components/ui/shiny-text';
import { KpiCards } from './KpiCards';
import { ProvinceChart } from './ProvinceChart';
import { SurveyDonut } from './SurveyDonut';
import { RecentSurveys } from './RecentSurveys';
import { fetchDashboardData } from '@/lib/api';

const initialStats = { surveys: 0, stations: 0, allowed: 0, denied: 0 };

export function DashboardView({ onNavigate }) {
  const [data, setData] = useState({
    stats: initialStats,
    provinces: [],
    recent: [],
    updatedAt: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const json = await fetchDashboardData();
      setData({
        stats: json?.stats || initialStats,
        provinces: Array.isArray(json?.provinces) ? json.provinces : [],
        recent: Array.isArray(json?.recent) ? json.recent : [],
        updatedAt: json?.updatedAt || new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8"
    >
      {/* Top Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-cyan-400 whitespace-nowrap">
            <Radio className="h-4 w-4" />
            <span>Operational Telemetry & Control</span>
          </div>
          <h1 className="mt-1 text-xl sm:text-3xl lg:text-4xl font-black tracking-normal leading-normal text-white sm:whitespace-nowrap">
            <ShinyText>ศูนย์ควบคุมผลสำรวจสถานี (Pre-PM)</ShinyText>
          </h1>
          <p className="mt-1 text-base text-slate-300 leading-relaxed">
            ติดตามความคืบหน้าการลงพื้นที่ตรวจเยี่ยมเจ้าของพื้นที่สถานีวิทยุคมนาคม NBTC Microwave แบบเรียลไทม์
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>อัปเดตข้อมูล</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <KpiCards stats={data.stats} />

      {/* Main Grid: Province Breakdown on Left, Donut & Recents on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map and Provincial breakdown */}
        <div className="lg:col-span-7">
          <ProvinceChart provinces={data.provinces} />
        </div>

        {/* Right: Donut Chart and Recent Activities */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <SurveyDonut stats={data.stats} />
          <RecentSurveys recent={data.recent} onNavigate={onNavigate} />
        </div>
      </div>
    </motion.main>
  );
}
