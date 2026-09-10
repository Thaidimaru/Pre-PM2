import React from 'react';
import { APP_VERSION } from '@/version';
import { NBTC_LOGO_BASE64 } from '@/assets/logoBase64';

export const ReportPDF = React.forwardRef(({ surveys = [] }, ref) => {
  const safeSurveys = Array.isArray(surveys) ? surveys : [];
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = currentDate.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate high-level KPI summary
  const totalCount = safeSurveys.length;
  const allowedCount = safeSurveys.filter((s) => (s?.fields?.permit || s?.permit) === 'อนุญาต').length;
  const deniedCount = safeSurveys.filter((s) => (s?.fields?.permit || s?.permit) === 'ไม่อนุญาต').length;
  const pendingCount = totalCount - allowedCount - deniedCount;

  const allowedPct = totalCount > 0 ? Math.round((allowedCount / totalCount) * 100) : 0;
  const deniedPct = totalCount > 0 ? Math.round((deniedCount / totalCount) * 100) : 0;
  const pendingPct = totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;

  return (
    <div
      ref={ref}
      data-theme="light"
      className="bg-white font-sans text-slate-800"
      style={{
        width: '198mm',
        minHeight: '280mm',
        padding: '10mm 12mm 12mm 14mm',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#1e293b',
        fontSize: '11px',
        lineHeight: 1.4,
        margin: '0 auto',
      }}
    >
      {/* Document Top Accent Bar */}
      <div style={{ height: '4px', backgroundColor: '#0284c7', borderRadius: '2px', marginBottom: '12px' }} />

      {/* Official Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0284c7', paddingBottom: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={NBTC_LOGO_BASE64}
            alt="NBTC Logo"
            style={{ width: '44px', height: '56px', objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#0369a1', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              สำนักงานคณะกรรมการกิจการกระจายเสียง กิจการโทรทัศน์ และกิจการโทรคมนาคมแห่งชาติ (กสทช.)
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '2px 0 2px 0', lineHeight: 1.2 }}>
              รายงานผลการตรวจเยี่ยมสถานีวิทยุคมนาคม NBTC Microwave
            </h1>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>
              โครงการบำรุงรักษาเชิงป้องกันล่วงหน้า (Pre-PM) · ศูนย์ควบคุมภาพรวม (Survey Control Room)
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', minWidth: '120px' }}>
          <div style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>วันที่พิมพ์รายงาน</div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{dateStr}</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>เวลา {timeStr} น.</div>
          <div style={{ display: 'inline-block', marginTop: '3px', padding: '2px 6px', backgroundColor: '#e0f2fe', borderRadius: '4px', fontSize: '9.5px', fontWeight: '700', color: '#0369a1' }}>
            Version {APP_VERSION}
          </div>
        </div>
      </div>

      {/* KPI Stats Strip (4 Equal Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
        {/* Total */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: '#475569' }}>สถานีสำรวจทั้งหมด</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#0284c7', lineHeight: '1.2' }}>
            {totalCount} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>สถานี</span>
          </div>
        </div>

        {/* Permitted */}
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: '#166534' }}>อนุญาตเข้าพื้นที่</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a', lineHeight: '1.2' }}>
            {allowedCount} <span style={{ fontSize: '11px', fontWeight: '600', color: '#15803d' }}>({allowedPct}%)</span>
          </div>
        </div>

        {/* Denied */}
        <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '6px', padding: '8px 10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: '#9f1239' }}>ไม่อนุญาต</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#e11d48', lineHeight: '1.2' }}>
            {deniedCount} <span style={{ fontSize: '11px', fontWeight: '600', color: '#be123c' }}>({deniedPct}%)</span>
          </div>
        </div>

        {/* Pending */}
        <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '6px', padding: '8px 10px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', color: '#6b21a8' }}>รอพิจารณา</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#9333ea', lineHeight: '1.2' }}>
            {pendingCount} <span style={{ fontSize: '11px', fontWeight: '600', color: '#7e22ce' }}>({pendingPct}%)</span>
          </div>
        </div>
      </div>

      {/* Table Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>
          ตารางรายการผลการสำรวจและบันทึกสภาพสถานี (Survey Records)
        </div>
        <div style={{ fontSize: '10px', color: '#64748b' }}>
          จำนวนทั้งหมด {safeSurveys.length} รายการ
        </div>
      </div>

      {/* Survey Records Table (Fits perfectly in printable area) */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', textAlign: 'left', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ backgroundColor: '#e2e8f0', borderBottom: '1.5px solid #94a3b8', color: '#0f172a' }}>
              <th style={{ padding: '6px 4px', fontWeight: '700', width: '4%', textAlign: 'center' }}>#</th>
              <th style={{ padding: '6px 6px', fontWeight: '700', width: '17%' }}>รหัส / เวลาบันทึก</th>
              <th style={{ padding: '6px 6px', fontWeight: '700', width: '22%' }}>สถานี / จังหวัด</th>
              <th style={{ padding: '6px 4px', fontWeight: '700', width: '12%', textAlign: 'center' }}>ผลอนุญาต</th>
              <th style={{ padding: '6px 6px', fontWeight: '700', width: '16%' }}>สภาพอุปกรณ์</th>
              <th style={{ padding: '6px 6px', fontWeight: '700', width: '15%' }}>ผู้ให้ข้อมูล / ช่าง</th>
              <th style={{ padding: '6px 6px', fontWeight: '700', width: '14%' }}>สรุปสิ่งที่แจ้ง</th>
            </tr>
          </thead>
          <tbody>
            {safeSurveys.length > 0 ? (
              safeSurveys.map((survey, index) => {
                const f = survey.fields || survey || {};
                const recordId = survey.recordId || f.recordId || '';
                const date = survey.savedAt
                  ? (() => {
                      try {
                        return new Date(survey.savedAt).toLocaleString('th-TH', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      } catch (e) {
                        return String(survey.savedAt);
                      }
                    })()
                  : f.visitDate || '-';
                
                const permit = f.permit || survey.permit || 'รอพิจารณา';
                const station = f.station || f.stationSelect || survey.station || '-';
                const province = f.province || survey.province || '-';

                // Status Badge Styling
                let badgeBg = '#faf5ff';
                let badgeBorder = '#e9d5ff';
                let badgeColor = '#9333ea';
                if (permit === 'อนุญาต') {
                  badgeBg = '#f0fdf4';
                  badgeBorder = '#bbf7d0';
                  badgeColor = '#16a34a';
                } else if (permit === 'ไม่อนุญาต') {
                  badgeBg = '#fff1f2';
                  badgeBorder = '#fecdd3';
                  badgeColor = '#e11d48';
                }

                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={recordId || index}
                    style={{
                      backgroundColor: isEven ? '#ffffff' : '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                    }}
                  >
                    {/* Index */}
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: '#64748b', fontWeight: '600', verticalAlign: 'top' }}>
                      {index + 1}
                    </td>

                    {/* Record ID & Date */}
                    <td style={{ padding: '6px 6px', verticalAlign: 'top', wordBreak: 'break-word' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0284c7', fontSize: '9.5px' }}>
                        {recordId}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '9px', marginTop: '2px' }}>
                        {date}
                      </div>
                    </td>

                    {/* Station & Province */}
                    <td style={{ padding: '6px 6px', verticalAlign: 'top', wordBreak: 'break-word' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '10px' }}>
                        {station}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '9.5px', marginTop: '1px' }}>
                        จ.{province}
                      </div>
                    </td>

                    {/* Permit Badge */}
                    <td style={{ padding: '6px 4px', textAlign: 'center', verticalAlign: 'top' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '9px',
                          fontWeight: '700',
                          backgroundColor: badgeBg,
                          border: `1px solid ${badgeBorder}`,
                          color: badgeColor,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {permit}
                      </span>
                    </td>

                    {/* Equipment Conditions */}
                    <td style={{ padding: '6px 6px', verticalAlign: 'top', fontSize: '9.5px' }}>
                      <div><span style={{ color: '#64748b' }}>วิทยุ:</span> <b style={{ color: '#334155' }}>{f.radioStatus || 'ปกติ'}</b></div>
                      <div style={{ marginTop: '1px' }}><span style={{ color: '#64748b' }}>ไฟฟ้า:</span> <b style={{ color: '#334155' }}>{f.powerStatus || 'ปกติ'}</b></div>
                      {f.batteryStatus && (
                        <div style={{ marginTop: '1px' }}><span style={{ color: '#64748b' }}>แบต:</span> <b style={{ color: '#334155' }}>{f.batteryStatus}</b></div>
                      )}
                    </td>

                    {/* Contact & Operator */}
                    <td style={{ padding: '6px 6px', verticalAlign: 'top', fontSize: '9.5px', wordBreak: 'break-word' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        {f.contactName || '-'}
                      </div>
                      {f.contactPosition && (
                        <div style={{ color: '#64748b', fontSize: '8.5px', marginTop: '1px' }}>
                          ({f.contactPosition})
                        </div>
                      )}
                      {f.operatorName && (
                        <div style={{ color: '#0284c7', fontSize: '9px', marginTop: '2px' }}>
                          ช่าง: {f.operatorName}
                        </div>
                      )}
                    </td>

                    {/* Summary / Notes */}
                    <td style={{ padding: '6px 6px', verticalAlign: 'top', fontSize: '9px', color: '#334155', wordBreak: 'break-word' }}>
                      {f.summary || f.siteCondition || f.userProblem || '-'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                  ไม่มีข้อมูลสำหรับออกรายงาน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sign-off & Signature Footer (Always stays together, no split) */}
      <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginTop: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px', padding: '14px 16px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10.5px', color: '#475569', marginBottom: '32px' }}>
              ลงชื่อ ............................................................................ ผู้จัดทำรายงาน
            </div>
            <div style={{ fontSize: '10.5px', fontWeight: '600', color: '#1e293b' }}>
              ( ............................................................................ )
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '2px' }}>
              เจ้าหน้าที่ผู้ปฏิบัติงานตรวจเยี่ยมภาคสนาม
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '10.5px', color: '#475569', marginBottom: '32px' }}>
              ลงชื่อ ............................................................................ ผู้รับรองรายงาน
            </div>
            <div style={{ fontSize: '10.5px', fontWeight: '600', color: '#1e293b' }}>
              ( ............................................................................ )
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '2px' }}>
              หัวหน้างาน / วิศวกรควบคุมโครงการ
            </div>
          </div>
        </div>

        {/* System Footer Note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '6px', fontSize: '8.5px', color: '#64748b' }}>
          <div>
            สำนักงาน กสทช. · NBTC Microwave Survey Control Room · เอกสารนี้จัดทำโดยระบบอัตโนมัติ
          </div>
          <div>
            เอกสารควบคุมสำหรับโครงการ Pre-PM · หน้า 1
          </div>
        </div>
      </div>
    </div>
  );
});

ReportPDF.displayName = 'ReportPDF';
