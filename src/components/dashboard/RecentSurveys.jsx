import React, { useState, useRef } from 'react';
import { Clock, ArrowRight, CheckCircle2, XCircle, AlertCircle, Eye, Camera, ZoomIn, Loader2, MapPin, User, Calendar, Radio, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchSurveyDetail, fetchSurveys } from '@/lib/api';
import { ReportPDF } from './ReportPDF';

const formatDateSafe = (dateVal) => {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return String(dateVal);
  }
};

const getPhotoUrl = (p, recordId, idx) => {
  if (!p) return `/api/photos?id=${encodeURIComponent(recordId || '')}&index=${idx}`;
  if (typeof p === 'string') {
    return (p.startsWith('data:') || p.startsWith('http') || p.startsWith('/'))
      ? p
      : `data:image/jpeg;base64,${p}`;
  }
  if (p && typeof p.data === 'string' && p.data) {
    return p.data.startsWith('data:')
      ? p.data
      : `data:${p.type || 'image/jpeg'};base64,${p.data}`;
  }
  return `/api/photos?id=${encodeURIComponent(recordId || '')}&index=${idx}`;
};

export function RecentSurveys({ recent = [], onNavigate }) {
  const safeRecent = Array.isArray(recent) ? recent : [];
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [surveyDetail, setSurveyDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [activeZoomPhoto, setActiveZoomPhoto] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [fullSurveys, setFullSurveys] = useState([]);
  const reportRef = useRef(null);

  const token = typeof window !== 'undefined' ? sessionStorage.getItem('surveyToken') || '' : '';

  const handleOpenDetail = async (item) => {
    setActiveSurvey(item);
    setSurveyDetail(null);
    setIsLoadingDetail(true);

    try {
      if (token) {
        const data = await fetchSurveyDetail(token, item.recordId);
        setSurveyDetail(data.survey || null);
      }
    } catch (err) {
      console.error('Failed to load survey details:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const getExportableSurveys = async () => {
    let surveys = [];
    try {
      if (token) {
        const data = await fetchSurveys(token);
        surveys = data.surveys || [];
      }
    } catch (e) {
      console.warn('fetchSurveys failed, falling back to recent surveys:', e);
    }

    if (surveys.length === 0 && safeRecent.length > 0) {
      surveys = safeRecent;
    }
    return surveys;
  };

  const handleExportExcel = async () => {
    if (isExportingExcel) return;
    setIsExportingExcel(true);
    try {
      const surveys = await getExportableSurveys();
      if (surveys.length === 0) {
        alert('ไม่มีข้อมูลสำรวจสำหรับ Export');
        return;
      }

      const rows = surveys.map((s, idx) => {
        const f = s.fields || s || {};
        return {
          'ลำดับ': idx + 1,
          'รหัสรายการ': s.recordId || f.recordId || '',
          'วันที่บันทึก': formatDateSafe(s.savedAt || f.visitDate),
          'ชื่อสถานี': f.station || f.stationSelect || s.station || '',
          'จังหวัด': f.province || s.province || '',
          'ผลการอนุญาต': f.permit || s.permit || '',
          'สถานที่ติดตั้ง': f.installationPlace || '',
          'สถานที่วางเครื่อง': f.equipmentPlace || '',
          'ผู้ให้ข้อมูล': f.contactName || '',
          'ตำแหน่ง': f.contactPosition || '',
          'ผู้ปฏิบัติงาน': f.operatorName || '',
          'สภาพวิทยุ': f.radioStatus || '',
          'ระบบไฟฟ้า': f.powerStatus || '',
          'ระบบสำรองไฟ': f.batteryStatus || '',
          'สรุปสิ่งที่ได้รับแจ้ง': f.summary || f.siteCondition || f.userProblem || '',
        };
      });

      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'ผลการสำรวจ Pre-PM');
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      XLSX.writeFile(wb, `NBTC_PrePM_Surveys_${dateStr}.xlsx`);
    } catch (err) {
      console.error('Excel export error:', err);
      alert('ไม่สามารถ Export Excel ได้: ' + (err.message || 'เกิดข้อผิดพลาด'));
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const surveys = await getExportableSurveys();

      if (surveys.length === 0) {
        alert('ไม่มีข้อมูลสำรวจสำหรับ Export');
        setIsExporting(false);
        return;
      }

      setFullSurveys(surveys);

      // Allow React to re-render the hidden ReportPDF component with data
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      if (!reportRef.current) {
        throw new Error('ไม่พบเทมเพลตสำหรับสร้างรายงาน PDF');
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `NBTC_PrePM_Report_${dateStr}.pdf`;

      try {
        const html2pdfMod = await import('html2pdf.js');
        const html2pdf = html2pdfMod.default || html2pdfMod;

        const opt = {
          margin: [6, 6, 6, 6],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
            scrollY: 0,
            scrollX: 0,
            windowWidth: 794,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        };

        await html2pdf().set(opt).from(reportRef.current).save();
      } catch (pdfErr) {
        console.warn('html2pdf generation error, opening printable window as fallback:', pdfErr);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${filename}</title>
                <style>
                  @page { size: A4; margin: 10mm; }
                  body { font-family: 'TH Sarabun New', sans-serif; margin: 0; padding: 0; background: #fff; }
                </style>
              </head>
              <body>
                ${reportRef.current.innerHTML}
                <script>
                  window.onload = function() {
                    window.focus();
                    window.print();
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        } else {
          throw pdfErr;
        }
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('ไม่สามารถสร้าง PDF ได้: ' + (err.message || 'เกิดข้อผิดพลาด'));
    } finally {
      setIsExporting(false);
    }
  };

  const getBadge = (permit) => {
    if (permit === 'อนุญาต') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          {permit}
        </span>
      );
    }
    if (permit === 'ไม่อนุญาต') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-400">
          <XCircle className="h-3 w-3" />
          {permit}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-400">
        <AlertCircle className="h-3 w-3" />
        {permit || 'รอพิจารณา'}
      </span>
    );
  };

  return (
    <>
      <GlassCard className="flex flex-col" hoverEffect={false}>
        {/* Panel Title & Action */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-300">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-normal leading-normal whitespace-nowrap">
              การสำรวจล่าสุด
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Export PDF Button */}
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="group inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 hover:bg-rose-100 dark:bg-rose-600/20 dark:hover:bg-rose-600/30 px-3.5 py-1.5 text-sm font-semibold text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              title="ออกรายงานเอกสาร PDF"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span>{isExporting ? 'กำลังสร้าง PDF...' : 'Export PDF'}</span>
            </button>

            {/* Export Excel Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="group inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 px-3.5 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              title="ส่งออกไฟล์ตาราง Excel (.xlsx)"
            >
              {isExportingExcel ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              <span>{isExportingExcel ? 'กำลังสร้าง Excel...' : 'Export Excel'}</span>
            </button>

            {/* Navigate to New Record Button */}
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('field')}
                className="group inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 shadow-xs hover:shadow-md hover:shadow-blue-500/25"
              >
                <span>บันทึกใหม่</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>


        {/* Table Container */}
        <div className="overflow-x-auto pt-4">
          <table className="w-full text-left text-base">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-transparent">
                <th className="py-2.5 pr-3 pl-2 whitespace-nowrap">รหัสรายการ</th>
                <th className="py-2.5 px-3 whitespace-nowrap">สถานี</th>
                <th className="py-2.5 px-3 whitespace-nowrap">จังหวัด</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">ผล</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">รูปถ่าย</th>
                <th className="py-2.5 pl-3 text-right whitespace-nowrap">เวลาบันทึก</th>
                <th className="py-2.5 pl-2 pr-2 text-center whitespace-nowrap">ดู</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {safeRecent.length > 0 ? (
                safeRecent.map((item) => (
                  <tr
                    key={item.recordId}
                    onClick={() => handleOpenDetail(item)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 pr-3 pl-2 font-mono text-sm text-blue-600 dark:text-cyan-400 group-hover:underline whitespace-nowrap font-bold">
                      {item.recordId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                      {item.station}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {item.province}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {getBadge(item.permit)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {item.hasPhotos || (item.photoCount && item.photoCount > 0) ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-500/30 whitespace-nowrap">
                          <Camera className="h-3.5 w-3.5" />
                          <span>{item.photoCount || 'มีภาพ'}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">-</span>
                      )}
                    </td>
                    <td className="py-3 pl-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 whitespace-nowrap">
                      {formatDateSafe(item.savedAt)}
                    </td>
                    <td className="py-3 pl-2 pr-2 text-center whitespace-nowrap">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Eye className="h-4 w-4" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    ยังไม่มีผลสำรวจ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Survey Detail Dialog */}
      <Dialog open={Boolean(activeSurvey)} onOpenChange={(open) => !open && setActiveSurvey(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-950/95 border border-slate-200 dark:border-blue-500/40 p-6 text-slate-800 dark:text-slate-100 max-h-[85vh] overflow-y-auto shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                <span>รายละเอียดผลสำรวจสถานี</span>
              </div>
              <span className="font-mono text-xs font-semibold text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-500/30 px-2.5 py-1 rounded-md">
                {activeSurvey?.recordId}
              </span>
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-cyan-400" />
              <div className="text-base text-slate-500 dark:text-slate-400">กำลังโหลดข้อมูลและรูปภาพ...</div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Station Info Banner */}
              <div className="rounded-xl border border-blue-200/90 dark:border-blue-500/20 bg-blue-50/70 dark:bg-blue-950/30 p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-blue-600 dark:text-cyan-400" />
                    <span>{activeSurvey?.station}</span>
                  </div>
                  <div>{getBadge(activeSurvey?.permit)}</div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-4 flex-wrap">
                  <span>จังหวัด: <b className="text-slate-900 dark:text-white font-semibold">{activeSurvey?.province}</b></span>
                  <span>บันทึกเมื่อ: <b className="text-slate-900 dark:text-white font-semibold">{formatDateSafe(activeSurvey?.savedAt)}</b></span>
                </div>
              </div>

              {/* Form Fields Details (if loaded) */}
              {surveyDetail?.fields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">สถานที่ติดตั้ง:</span>{' '}
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{surveyDetail.fields.installationPlace || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">สถานที่วางเครื่อง:</span>{' '}
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{surveyDetail.fields.equipmentPlace || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">ผู้ให้ข้อมูล:</span>{' '}
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{surveyDetail.fields.contactName || '-'} ({surveyDetail.fields.contactPosition || 'ไม่ระบุตำแหน่ง'})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">ผู้ปฏิบัติงาน:</span>{' '}
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{surveyDetail.fields.operatorName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">สภาพวิทยุ / การสนทนา:</span>{' '}
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      ภาพรวม: {surveyDetail.fields.radioStatus || 'ปกติ'}, รับสัญญาณ: {surveyDetail.fields.receiveStatus || 'ปกติ'}, สนทนา: {surveyDetail.fields.transmitStatus || 'ปกติ'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">ระบบไฟฟ้า / สำรองไฟ:</span>{' '}
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      ระบบไฟฟ้า: {surveyDetail.fields.powerStatus || 'ปกติ'}, ระบบสำรองไฟ: {surveyDetail.fields.batteryStatus || 'ปกติ'}
                    </span>
                  </div>
                  {surveyDetail.fields.summary && (
                    <div className="col-span-1 md:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium">สรุปสิ่งที่ได้รับแจ้ง:</span>
                      <p className="text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
                        {surveyDetail.fields.summary}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Photos Gallery */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2 text-base font-bold text-blue-600 dark:text-cyan-300">
                    <Camera className="h-4.5 w-4.5" />
                    <span>ภาพถ่ายก่อนดำเนินงาน ({surveyDetail?.photos?.length || 0} ภาพ)</span>
                  </div>
                  {surveyDetail?.photos && surveyDetail.photos.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        (surveyDetail.photos || []).forEach((p, idx) => {
                          const photoUrl = getPhotoUrl(p, activeSurvey?.recordId, idx);
                          const link = document.createElement('a');
                          link.href = photoUrl;
                          link.download = p.name || `photo_${idx + 1}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0 shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>ดาวน์โหลดทั้งหมด</span>
                    </button>
                  )}
                </div>

                {surveyDetail?.photos && surveyDetail.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {surveyDetail.photos.map((p, idx) => {
                      const photoUrl = getPhotoUrl(p, activeSurvey?.recordId, idx);
                      return (
                        <div
                          key={idx}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-blue-500/30 bg-slate-900 shadow-md"
                        >
                          <img
                            src={photoUrl}
                            alt={p.name || `photo_${idx + 1}`}
                            onClick={() => setActiveZoomPhoto({ url: photoUrl, name: p.name || `photo_${idx + 1}.jpg` })}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105 cursor-pointer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <ZoomIn className="h-6 w-6 text-white" />
                          </div>
                          {/* Download button overlay */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement('a');
                              link.href = photoUrl;
                              link.download = p.name || `photo_${idx + 1}.jpg`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-emerald-600 transition-all duration-200 cursor-pointer z-10"
                            title="ดาวน์โหลดรูปภาพ"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-xs font-medium text-slate-200 truncate">
                            {p.name || `รูปที่ ${idx + 1}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-400">
                    ไม่มีรูปภาพประกอบสำหรับรายการนี้
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Zoom Modal */}
      <Dialog open={Boolean(activeZoomPhoto)} onOpenChange={(open) => !open && setActiveZoomPhoto(null)}>
        <DialogContent className="max-w-3xl bg-slate-950/95 border-blue-500/50 p-4">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3 text-sm font-medium text-slate-300">
              <span className="truncate">{activeZoomPhoto?.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!activeZoomPhoto) return;
                  const link = document.createElement('a');
                  link.href = activeZoomPhoto.url;
                  link.download = activeZoomPhoto.name || 'photo.jpg';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30 hover:border-emerald-500/50 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                <span>ดาวน์โหลด</span>
              </button>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-xl bg-black/80 max-h-[75vh] flex items-center justify-center">
            {activeZoomPhoto && (
              <img
                src={activeZoomPhoto.url}
                alt={activeZoomPhoto.name}
                className="max-h-[70vh] w-auto object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden PDF Report Template offscreen container */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '-99999px',
          zIndex: -99999,
          width: '210mm',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <ReportPDF ref={reportRef} surveys={fullSurveys.length > 0 ? fullSurveys : safeRecent} />
      </div>
    </>
  );
}

