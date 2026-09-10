import React from 'react';
import { Clock, MapPin, User, Camera, Radio } from 'lucide-react';
import nbtcLogo from '@/assets/images/nbtc-logo-dashboard.png';

export const ReportPDF = React.forwardRef(({ surveys = [] }, ref) => {
  const dateStr = new Date().toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      ref={ref}
      className="absolute -left-[9999px] top-0 bg-white text-slate-900 font-sans"
      style={{ width: '210mm', padding: '15mm', boxSizing: 'border-box' }}
    >
      {/* Report Header */}
      <div className="flex items-center justify-between border-b-2 border-cyan-600 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <img src={nbtcLogo} alt="NBTC Logo" className="h-16 w-auto object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              รายงานสรุปการตรวจเยี่ยม (Pre-PM)
            </h1>
            <p className="text-sm font-semibold text-cyan-700 mt-1">
              ศูนย์ควบคุมและบันทึกข้อมูล สถานีวิทยุคมนาคม NBTC Microwave
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500 font-medium">วันที่ออกรายงาน</div>
          <div className="text-base font-bold text-slate-800">{dateStr}</div>
          <div className="text-sm text-slate-500 mt-1">จำนวนข้อมูล: {surveys.length} รายการ</div>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-bold w-12 text-center">#</th>
              <th className="px-4 py-3 font-bold">วันที่บันทึก</th>
              <th className="px-4 py-3 font-bold">สถานี / จังหวัด</th>
              <th className="px-4 py-3 font-bold">ผลการอนุญาต</th>
              <th className="px-4 py-3 font-bold">สภาพอุปกรณ์ (วิทยุ/ไฟฟ้า)</th>
              <th className="px-4 py-3 font-bold">ผู้ให้ข้อมูล / ผู้ปฏิบัติงาน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {surveys.map((survey, index) => {
              const f = survey.fields || {};
              const date = survey.savedAt ? new Date(survey.savedAt).toLocaleString('th-TH') : '-';
              
              // Permit badge color
              let permitColor = 'text-slate-600';
              if (f.permit === 'อนุญาต') permitColor = 'text-emerald-600 font-bold';
              else if (f.permit === 'ไม่อนุญาต') permitColor = 'text-rose-600 font-bold';

              return (
                <tr key={survey.recordId || index} className="bg-white">
                  <td className="px-4 py-3 text-center font-medium text-slate-500">{index + 1}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{date}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-blue-800">{f.station || f.stationSelect || '-'}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {f.province || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={permitColor}>{f.permit || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs space-y-1">
                      <div><span className="text-slate-500">วิทยุ:</span> <span className="font-semibold text-slate-700">{f.radioStatus || 'ปกติ'}</span></div>
                      <div><span className="text-slate-500">ไฟฟ้า:</span> <span className="font-semibold text-slate-700">{f.powerStatus || 'ปกติ'}</span></div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-700">{f.contactName || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Radio className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-700">{f.operatorName || '-'}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
        เอกสารสร้างโดยอัตโนมัติจากระบบ NBTC Microwave Survey Control Room
      </div>
    </div>
  );
});

ReportPDF.displayName = 'ReportPDF';
