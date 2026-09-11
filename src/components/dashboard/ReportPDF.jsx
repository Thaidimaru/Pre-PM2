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

  // Calculate KPI metrics
  const totalCount = safeSurveys.length;
  const allowedCount = safeSurveys.filter((s) => (s?.fields?.permit || s?.permit) === 'อนุญาต').length;
  const deniedCount = safeSurveys.filter((s) => (s?.fields?.permit || s?.permit) === 'ไม่อนุญาต').length;
  const pendingCount = totalCount - allowedCount - deniedCount;

  const allowedPct = totalCount > 0 ? Math.round((allowedCount / totalCount) * 100) : 0;
  const deniedPct = totalCount > 0 ? Math.round((deniedCount / totalCount) * 100) : 0;
  const pendingPct = totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;

  // Master helper to split any record ID format cleanly onto 2 balanced lines without line-wrapping bugs
  const formatRecordIdParts = (id) => {
    if (!id) return { p1: '-', p2: '' };
    const str = String(id).trim();

    // Strip leading "PM-" or "PM" case-insensitively
    const stripped = str.replace(/^PM-?/i, '');

    // Extract 8-digit YYYYMMDD date if present at the start of stripped
    const dateMatch = stripped.match(/^(\d{8})(.*)/);
    if (dateMatch) {
      const dateDigits = dateMatch[1]; // e.g. 20260911
      let rest = dateMatch[2].replace(/^-/, ''); // e.g. 0649074-9dee or 06490749dee

      // Format rest if it's raw digits + hash without hyphens
      if (rest && !rest.includes('-')) {
        if (rest.length >= 8) {
          rest = `${rest.slice(0, 6)}-${rest.slice(6)}`;
        }
      }
      return {
        p1: `PM-${dateDigits}`, // e.g. PM-20260911
        p2: rest,               // e.g. 0649074-9dee or 064907-9dee
      };
    }

    // Fallback for non-standard IDs: split by first hyphen or mid-point
    if (str.includes('-')) {
      const idx = str.indexOf('-');
      return {
        p1: str.slice(0, idx),
        p2: str.slice(idx + 1),
      };
    }

    if (str.length > 11) {
      return {
        p1: str.slice(0, 11),
        p2: str.slice(11),
      };
    }

    return { p1: str, p2: '' };
  };

  return (
    <div
      ref={ref}
      data-theme="light"
      className="bg-white text-slate-800"
      style={{
        fontFamily: '"Sarabun", "TH Sarabun New", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        width: '198mm',
        minHeight: '279mm',
        padding: '8mm 10mm 10mm 10mm',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#1e293b',
        fontSize: '10.5px',
        lineHeight: 1.4,
        margin: '0 auto',
      }}
    >
      {/* Document Top Decorative Accent Bar */}
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #0f172a 0%, #0284c7 50%, #00d49a 100%)', borderRadius: '2px', marginBottom: '10px' }} />

      {/* Official Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0284c7', paddingBottom: '10px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={NBTC_LOGO_BASE64}
            alt="NBTC Logo"
            style={{ width: '44px', height: '54px', objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: '9.5px', fontWeight: '700', color: '#0369a1', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              สำนักงานคณะกรรมการกิจการกระจายเสียง กิจการโทรทัศน์ และกิจการโทรคมนาคมแห่งชาติ (กสทช.)
            </div>
            <h1 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '2px 0 2px 0', lineHeight: 1.2 }}>
              รายงานผลการตรวจเยี่ยมสถานีวิทยุคมนาคม NBTC Microwave
            </h1>
            <div style={{ fontSize: '10.5px', fontWeight: '600', color: '#475569' }}>
              โครงการบำรุงรักษาเชิงป้องกันล่วงหน้า (Pre-PM) · ศูนย์ควบคุมภาพรวม (Survey Control Room)
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', minWidth: '130px' }}>
          <div style={{ fontSize: '8.5px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>วันที่พิมพ์รายงาน</div>
          <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0f172a' }}>{dateStr}</div>
          <div style={{ fontSize: '9.5px', fontWeight: '600', color: '#64748b' }}>เวลา {timeStr} น.</div>
          <div style={{ display: 'inline-block', marginTop: '3px', padding: '1.5px 7px', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '4px', fontSize: '9px', fontWeight: '700', color: '#0369a1' }}>
            Version {APP_VERSION}
          </div>
        </div>
      </div>

      {/* KPI Stats Cards (4 Equal Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
        {/* Card 1: Total */}
        <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '7px', padding: '8px 10px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#0369a1' }}>สถานีสำรวจทั้งหมด</span>
            <span style={{ fontSize: '8.5px', fontWeight: '700', padding: '1px 5px', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '4px' }}>Total</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#0284c7', lineHeight: '1' }}>
            {totalCount} <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#64748b' }}>สถานี</span>
          </div>
        </div>

        {/* Card 2: Permitted */}
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', padding: '8px 10px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#15803d' }}>อนุญาตเข้าพื้นที่</span>
            <span style={{ fontSize: '8.5px', fontWeight: '700', padding: '1px 5px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '4px' }}>{allowedPct}%</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a', lineHeight: '1' }}>
            {allowedCount} <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#15803d' }}>สถานี</span>
          </div>
        </div>

        {/* Card 3: Denied */}
        <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '7px', padding: '8px 10px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#be123c' }}>ไม่อนุญาต</span>
            <span style={{ fontSize: '8.5px', fontWeight: '700', padding: '1px 5px', backgroundColor: '#ffe4e6', color: '#e11d48', borderRadius: '4px' }}>{deniedPct}%</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#e11d48', lineHeight: '1' }}>
            {deniedCount} <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#be123c' }}>สถานี</span>
          </div>
        </div>

        {/* Card 4: Pending */}
        <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '7px', padding: '8px 10px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#7e22ce' }}>รอพิจารณา</span>
            <span style={{ fontSize: '8.5px', fontWeight: '700', padding: '1px 5px', backgroundColor: '#f3e8ff', color: '#9333ea', borderRadius: '4px' }}>{pendingPct}%</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#9333ea', lineHeight: '1' }}>
            {pendingCount} <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#7e22ce' }}>สถานี</span>
          </div>
        </div>
      </div>

      {/* Table Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0f172a' }}>
          ตารางรายการผลการสำรวจและบันทึกสภาพสถานี (Survey Records)
        </div>
        <div style={{ fontSize: '10px', fontWeight: '600', color: '#64748b' }}>
          จำนวนทั้งหมด {safeSurveys.length} รายการ
        </div>
      </div>

      {/* Survey Records Table */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '7px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px', textAlign: 'left', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', borderBottom: '2px solid #0284c7', color: '#ffffff' }}>
              <th style={{ padding: '7px 4px', fontWeight: '700', width: '4%', textAlign: 'center' }}>#</th>
              <th style={{ padding: '7px 8px', fontWeight: '700', width: '23%' }}>รหัส / เวลาบันทึก</th>
              <th style={{ padding: '7px 8px', fontWeight: '700', width: '23%' }}>สถานี / จังหวัด</th>
              <th style={{ padding: '7px 4px', fontWeight: '700', width: '10%', textAlign: 'center' }}>ผลอนุญาต</th>
              <th style={{ padding: '7px 6px', fontWeight: '700', width: '14%' }}>สภาพอุปกรณ์</th>
              <th style={{ padding: '7px 6px', fontWeight: '700', width: '14%' }}>ผู้ให้ข้อมูล / ช่าง</th>
              <th style={{ padding: '7px 6px', fontWeight: '700', width: '12%' }}>สรุปสิ่งที่แจ้ง</th>
            </tr>
          </thead>
          <tbody>
            {safeSurveys.length > 0 ? (
              safeSurveys.map((survey, index) => {
                const f = survey.fields || survey || {};
                const recordId = survey.recordId || f.recordId || '';
                const { p1, p2 } = formatRecordIdParts(recordId);

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
                    <td style={{ padding: '7px 4px', textAlign: 'center', color: '#64748b', fontWeight: '700', verticalAlign: 'top' }}>
                      {index + 1}
                    </td>

                    {/* Record ID (Clean 2-line monospace, non-overlapping) & Date */}
                    <td style={{ padding: '7px 8px', verticalAlign: 'top', width: '23%' }}>
                      <div style={{
                        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                        fontWeight: '700',
                        fontSize: '9.5px',
                        lineHeight: '1.4',
                        letterSpacing: '0.02em',
                        wordBreak: 'normal',
                      }}>
                        <div style={{ color: '#0284c7', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p1}
                        </div>
                        {p2 && (
                          <div style={{ color: '#0369a1', fontWeight: '700', fontSize: '8.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                            {p2}
                          </div>
                        )}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '8.5px', fontWeight: '500', marginTop: '4px', whiteSpace: 'nowrap' }}>
                        {date}
                      </div>
                    </td>

                    {/* Station & Province */}
                    <td style={{ padding: '7px 8px', verticalAlign: 'top', wordBreak: 'break-word' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '10px', lineHeight: 1.3 }}>
                        {station}
                      </div>
                      <div style={{ color: '#475569', fontSize: '9px', fontWeight: '600', marginTop: '2px' }}>
                        จ.{province}
                      </div>
                    </td>

                    {/* Permit Badge */}
                    <td style={{ padding: '7px 4px', textAlign: 'center', verticalAlign: 'top' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 7px',
                          borderRadius: '10px',
                          fontSize: '9px',
                          fontWeight: '800',
                          backgroundColor: badgeBg,
                          border: `1px solid ${badgeBorder}`,
                          color: badgeColor,
                          whiteSpace: 'nowrap',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                        }}
                      >
                        {permit}
                      </span>
                    </td>

                    {/* Equipment Conditions */}
                    <td style={{ padding: '7px 6px', verticalAlign: 'top', fontSize: '9px', lineHeight: 1.35 }}>
                      <div><span style={{ color: '#64748b' }}>วิทยุ:</span> <b style={{ color: '#0f172a' }}>{f.radioStatus || 'ปกติ'}</b></div>
                      <div style={{ marginTop: '1px' }}><span style={{ color: '#64748b' }}>ไฟฟ้า:</span> <b style={{ color: '#0f172a' }}>{f.powerStatus || 'ปกติ'}</b></div>
                      {f.batteryStatus && (
                        <div style={{ marginTop: '1px' }}><span style={{ color: '#64748b' }}>แบต:</span> <b style={{ color: '#0f172a' }}>{f.batteryStatus}</b></div>
                      )}
                    </td>

                    {/* Contact & Operator */}
                    <td style={{ padding: '7px 6px', verticalAlign: 'top', fontSize: '9px', wordBreak: 'break-word', lineHeight: 1.3 }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {f.contactName || '-'}
                      </div>
                      {f.contactPosition && (
                        <div style={{ color: '#64748b', fontSize: '8.5px', fontWeight: '500', marginTop: '1px' }}>
                          ({f.contactPosition})
                        </div>
                      )}
                      {f.operatorName && (
                        <div style={{ color: '#0284c7', fontSize: '8.5px', fontWeight: '600', marginTop: '2px' }}>
                          ช่าง: {f.operatorName}
                        </div>
                      )}
                    </td>

                    {/* Summary / Notes */}
                    <td style={{ padding: '7px 6px', verticalAlign: 'top', fontSize: '8.5px', color: '#334155', wordBreak: 'break-word', lineHeight: 1.3 }}>
                      {f.summary || f.siteCondition || f.userProblem || '-'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '10.5px' }}>
                  ไม่มีข้อมูลสำหรับออกรายงาน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sign-off & Signature Footer (Always stays together) */}
      <div style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginTop: '14px' }}>
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '7px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ backgroundColor: '#f1f5f9', padding: '5px 12px', borderBottom: '1px solid #cbd5e1', fontSize: '10px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>ส่วนการลงนามยืนยันและรับรองรายงาน (Official Approval & Verification)</span>
            <span style={{ fontSize: '9px', fontWeight: '600', color: '#64748b' }}>โครงการ NBTC Microwave Pre-PM</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', padding: '14px 16px' }}>
            {/* Left Signature */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#334155', marginBottom: '32px' }}>
                ลงชื่อ ............................................................................ ผู้จัดทำรายงาน
              </div>
              <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#0f172a' }}>
                ( ............................................................................ )
              </div>
              <div style={{ fontSize: '9px', fontWeight: '600', color: '#475569', marginTop: '3px' }}>
                เจ้าหน้าที่ผู้ปฏิบัติงานตรวจเยี่ยมภาคสนาม
              </div>
              <div style={{ fontSize: '8.5px', color: '#94a3b8', marginTop: '2px' }}>
                วันที่ ......... / .................. / .........
              </div>
            </div>

            {/* Right Signature */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#334155', marginBottom: '32px' }}>
                ลงชื่อ ............................................................................ ผู้รับรองรายงาน
              </div>
              <div style={{ fontSize: '10.5px', fontWeight: '700', color: '#0f172a' }}>
                ( ............................................................................ )
              </div>
              <div style={{ fontSize: '9px', fontWeight: '600', color: '#475569', marginTop: '3px' }}>
                หัวหน้างาน / วิศวกรควบคุมโครงการ
              </div>
              <div style={{ fontSize: '8.5px', color: '#94a3b8', marginTop: '2px' }}>
                วันที่ ......... / .................. / .........
              </div>
            </div>
          </div>
        </div>

        {/* Official Document Footer Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1.5px solid #0284c7', paddingTop: '6px', marginTop: '10px', fontSize: '8.5px', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: '700', color: '#0369a1' }}>สำนักงาน กสทช.</span>
            <span>·</span>
            <span>NBTC Microwave Survey Control Room</span>
            <span>·</span>
            <span>เอกสารนี้จัดทำโดยระบบสารสนเทศอัตโนมัติ</span>
          </div>
          <div style={{ fontWeight: '600', color: '#475569' }}>
            เอกสารควบคุมโครงการ Pre-PM · หน้า 1 / 1
          </div>
        </div>
      </div>
    </div>
  );
});

ReportPDF.displayName = 'ReportPDF';
