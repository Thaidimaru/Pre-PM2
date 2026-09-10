import React, { useState } from 'react';
import { Clock, ArrowRight, CheckCircle2, XCircle, AlertCircle, Eye, Camera, ZoomIn, Loader2, MapPin, User, Calendar, Radio, Download, FileSpreadsheet } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchSurveyDetail, fetchSurveys } from '@/lib/api';

export function RecentSurveys({ recent = [], onNavigate }) {
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [surveyDetail, setSurveyDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [activeZoomPhoto, setActiveZoomPhoto] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportCSV = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      // Fetch all surveys with full detail from the API
      const data = await fetchSurveys(token);
      const surveys = data.surveys || [];

      if (surveys.length === 0) {
        alert('ไม่มีข้อมูลสำรวจสำหรับ Export');
        return;
      }

      // CSV Header
      const headers = [
        'รหัสรายการ',
        'วันที่บันทึก',
        'สถานี',
        'สถานที่ติดตั้ง',
        'สถานที่วางเครื่อง',
        'จังหวัด',
        'อำเภอ',
        'ตำบล',
        'ผลการอนุญาต',
        'ข้อจำกัดในการเข้าพื้นที่',
        'ภาพรวมเครื่องวิทยุ',
        'การรับสัญญาณ',
        'ทดสอบการสนทนา',
        'การทำงานของระบบไฟฟ้า',
        'การทำงานของระบบสำรองไฟ',
        'ปัญหาเพิ่มเติม',
        'ชื่อผู้ให้ข้อมูล',
        'ตำแหน่ง',
        'หน่วยงาน/หมู่บ้าน',
        'เบอร์โทรศัพท์',
        'ผู้ปฏิบัติงาน',
        'สรุปสิ่งที่ได้รับแจ้ง',
        'จำนวนรูปถ่าย'
      ];

      const escapeCsv = (val) => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = surveys.map((s) => {
        const f = s.fields || {};
        return [
          s.recordId || '',
          s.savedAt ? new Date(s.savedAt).toLocaleString('th-TH') : '',
          f.station || f.stationSelect || '',
          f.installationPlace || '',
          f.equipmentPlace || '',
          f.province || '',
          f.district || '',
          f.subdistrict || '',
          f.permit || '',
          f.accessLimit || '',
          f.radioStatus || '',
          f.receiveStatus || '',
          f.transmitStatus || '',
          f.powerStatus || '',
          f.batteryStatus || '',
          f.userProblem || '',
          f.contactName || '',
          f.contactPosition || '',
          f.contactVillage || '',
          f.contactPhone || '',
          f.operatorName || '',
          f.summary || '',
          Array.isArray(s.photos) ? s.photos.length : 0
        ].map(escapeCsv).join(',');
      });

      // BOM + CSV content for Thai encoding
      const bom = '\uFEFF';
      const csvContent = bom + headers.map(escapeCsv).join(',') + '\n' + rows.join('\n');

      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.href = url;
      link.download = `NBTC_PrePM_Survey_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('ไม่สามารถ Export ข้อมูลได้: ' + (err.message || 'เกิดข้อผิดพลาด'));
    } finally {
      setIsExporting(false);
    }
  };

  const getBadge = (permit) => {
    if (permit === 'อนุญาต') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          {permit}
        </span>
      );
    }
    if (permit === 'ไม่อนุญาต') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
          <XCircle className="h-3 w-3" />
          {permit}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-xs font-semibold text-purple-400">
        <AlertCircle className="h-3 w-3" />
        {permit || 'รอพิจารณา'}
      </span>
    );
  };

  return (
    <>
      <GlassCard className="flex flex-col" hoverEffect={false}>
        {/* Panel Title & Action */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-normal leading-normal whitespace-nowrap">
              การสำรวจล่าสุด
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="group inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-600/20 px-3.5 py-1.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-600/30 hover:border-emerald-500/50 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              <span>{isExporting ? 'กำลัง Export...' : 'Export'}</span>
            </button>

            {/* Navigate to New Record Button */}
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('field')}
                className="group inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-600/20 px-3.5 py-1.5 text-sm font-semibold text-blue-300 hover:bg-blue-600/30 hover:border-blue-500/50 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0"
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
              <tr className="border-b border-slate-800 text-sm font-semibold text-slate-300">
                <th className="pb-2.5 pr-3 whitespace-nowrap">รหัสรายการ</th>
                <th className="pb-2.5 px-3 whitespace-nowrap">สถานี</th>
                <th className="pb-2.5 px-3 whitespace-nowrap">จังหวัด</th>
                <th className="pb-2.5 px-3 text-center whitespace-nowrap">ผล</th>
                <th className="pb-2.5 px-3 text-center whitespace-nowrap">รูปถ่าย</th>
                <th className="pb-2.5 pl-3 text-right whitespace-nowrap">เวลาบันทึก</th>
                <th className="pb-2.5 pl-2 text-center whitespace-nowrap">ดู</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {recent.length > 0 ? (
                recent.map((item) => (
                  <tr
                    key={item.recordId}
                    onClick={() => handleOpenDetail(item)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 pr-3 font-mono text-sm text-cyan-400 group-hover:underline whitespace-nowrap">
                      {item.recordId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-100 whitespace-nowrap">
                      {item.station}
                    </td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {item.province}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {getBadge(item.permit)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {item.hasPhotos || (item.photoCount && item.photoCount > 0) ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-cyan-300 border border-blue-500/30 whitespace-nowrap">
                          <Camera className="h-3.5 w-3.5" />
                          <span>{item.photoCount || 'มีภาพ'}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 whitespace-nowrap">-</span>
                      )}
                    </td>
                    <td className="py-3 pl-3 text-right text-xs font-medium text-slate-300 whitespace-nowrap">
                      {new Date(item.savedAt).toLocaleString('th-TH', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="py-3 pl-2 text-center whitespace-nowrap">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
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
        <DialogContent className="max-w-2xl bg-slate-950/95 border-blue-500/40 p-6 text-slate-100 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3 text-xl font-bold text-white border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-cyan-400" />
                <span>รายละเอียดผลสำรวจสถานี</span>
              </div>
              <span className="font-mono text-xs font-semibold text-cyan-300 bg-blue-950/80 border border-blue-500/30 px-2.5 py-1 rounded-md">
                {activeSurvey?.recordId}
              </span>
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              <div className="text-base text-slate-400">กำลังโหลดข้อมูลและรูปภาพ...</div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Station Info Banner */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-950/30 p-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-cyan-400" />
                    <span>{activeSurvey?.station}</span>
                  </div>
                  <div>{getBadge(activeSurvey?.permit)}</div>
                </div>
                <div className="text-sm text-slate-300 flex items-center gap-4 flex-wrap">
                  <span>จังหวัด: <b className="text-white font-semibold">{activeSurvey?.province}</b></span>
                  <span>บันทึกเมื่อ: <b className="text-white font-semibold">{activeSurvey ? new Date(activeSurvey.savedAt).toLocaleString('th-TH') : ''}</b></span>
                </div>
              </div>

              {/* Form Fields Details (if loaded) */}
              {surveyDetail?.fields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm bg-slate-900/60 rounded-xl p-4 border border-slate-800">
                  <div>
                    <span className="text-slate-400 font-medium">สถานที่ติดตั้ง:</span>{' '}
                    <span className="text-slate-200">{surveyDetail.fields.installationPlace || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">สถานที่วางเครื่อง:</span>{' '}
                    <span className="text-slate-200">{surveyDetail.fields.equipmentPlace || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">ผู้ให้ข้อมูล:</span>{' '}
                    <span className="text-slate-200">{surveyDetail.fields.contactName || '-'} ({surveyDetail.fields.contactPosition || 'ไม่ระบุตำแหน่ง'})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">ผู้ปฏิบัติงาน:</span>{' '}
                    <span className="text-slate-200">{surveyDetail.fields.operatorName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">สภาพวิทยุ / การสนทนา:</span>{' '}
                    <span className="text-slate-200">
                      ภาพรวม: {surveyDetail.fields.radioStatus || 'ปกติ'}, รับสัญญาณ: {surveyDetail.fields.receiveStatus || 'ปกติ'}, สนทนา: {surveyDetail.fields.transmitStatus || 'ปกติ'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">ระบบไฟฟ้า / สำรองไฟ:</span>{' '}
                    <span className="text-slate-200">
                      ระบบไฟฟ้า: {surveyDetail.fields.powerStatus || 'ปกติ'}, ระบบสำรองไฟ: {surveyDetail.fields.batteryStatus || 'ปกติ'}
                    </span>
                  </div>
                  {surveyDetail.fields.summary && (
                    <div className="col-span-1 md:col-span-2 pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400 block mb-1 font-medium">สรุปสิ่งที่ได้รับแจ้ง:</span>
                      <p className="text-slate-100 bg-slate-950/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
                        {surveyDetail.fields.summary}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Photos Gallery */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2 text-base font-bold text-cyan-300">
                    <Camera className="h-4.5 w-4.5" />
                    <span>ภาพถ่ายก่อนดำเนินงาน ({surveyDetail?.photos?.length || 0} ภาพ)</span>
                  </div>
                  {surveyDetail?.photos && surveyDetail.photos.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        (surveyDetail.photos || []).forEach((p, idx) => {
                          const photoUrl = p.data
                            ? (p.data.startsWith('data:') ? p.data : `data:${p.type || 'image/jpeg'};base64,${p.data}`)
                            : `/api/photos?id=${encodeURIComponent(activeSurvey.recordId)}&index=${idx}`;
                          const link = document.createElement('a');
                          link.href = photoUrl;
                          link.download = p.name || `photo_${idx + 1}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30 hover:border-emerald-500/50 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap flex-shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>ดาวน์โหลดทั้งหมด</span>
                    </button>
                  )}
                </div>

                {surveyDetail?.photos && surveyDetail.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {surveyDetail.photos.map((p, idx) => {
                      const photoUrl = p.data
                        ? (p.data.startsWith('data:') ? p.data : `data:${p.type || 'image/jpeg'};base64,${p.data}`)
                        : `/api/photos?id=${encodeURIComponent(activeSurvey.recordId)}&index=${idx}`;
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
    </>
  );
}
