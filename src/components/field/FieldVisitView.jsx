import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Radio as RadioIcon,
  User,
  ShieldCheck,
  Zap,
  TreePine,
  Camera,
  CheckSquare,
  UploadCloud,
  Trash2,
  ZoomIn,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { ShinyText } from '@/components/ui/shiny-text';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { fetchStations, submitSurvey } from '@/lib/api';

// Client-side image compression: Scales high-res camera photos down to 1600px max dimension
// and encodes to JPEG 0.8 to keep total payload safely below Vercel's 4.5 MB request body limit.
function compressImage(file, maxDimension = 1600, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          size: file.size,
          type: file.type || 'image/jpeg',
          previewUrl: reader.result,
          base64Data: (reader.result || '').split(',')[1] || '',
        });
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Data = compressedDataUrl.split(',')[1];
        const compressedBytes = Math.round((base64Data.length * 3) / 4);

        resolve({
          name: file.name.replace(/\.[^/.]+$/, '') + '.jpg',
          type: 'image/jpeg',
          originalSize: file.size,
          size: compressedBytes,
          previewUrl: compressedDataUrl,
          base64Data,
        });
      };
      img.onerror = () => {
        const rawBase64 = (reader.result || '').split(',')[1] || '';
        resolve({
          name: file.name,
          type: file.type || 'image/jpeg',
          originalSize: file.size,
          size: file.size,
          previewUrl: reader.result,
          base64Data: rawBase64,
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function FieldVisitView() {
  const [stations, setStations] = useState([]);
  const [formData, setFormData] = useState({
    permit: 'อนุญาต',
    radioStatus: 'ปกติ',
    receiveStatus: 'ปกติ',
    transmitStatus: 'ปกติ',
    powerStatus: 'ปกติ',
    batteryStatus: 'ปกติ'
  });
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePreviewPhoto, setActivePreviewPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const token = useMemo(() => sessionStorage.getItem('surveyToken') || '', []);

  // Fetch stations for auto-completion
  useEffect(() => {
    if (!token) return;
    fetchStations(token)
      .then((data) => {
        setStations(
          (data.stations || []).map((s) => ({
            village: s.village,
            subdistrict: s.subdistrict,
            district: s.district,
            province: s.province,
            installationPlace: s.installation_place,
            equipmentPlace: s.equipment_place,
            contactName: s.contact_name,
            contactPosition: s.contact_position
          }))
        );
      })
      .catch((err) => {
        console.error('Failed to fetch station directory:', err);
      });
  }, [token]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-fill installation and contact details when station is selected
  const activeStation = useMemo(
    () => stations.find((s) => s.village === formData.station),
    [stations, formData.station]
  );

  useEffect(() => {
    if (activeStation) {
      setFormData((prev) => ({
        ...prev,
        province: activeStation.province || prev.province || '',
        district: activeStation.district || prev.district || '',
        subdistrict: activeStation.subdistrict || prev.subdistrict || '',
        installationPlace: activeStation.installationPlace || prev.installationPlace || '',
        equipmentPlace: activeStation.equipmentPlace || prev.equipmentPlace || '',
        contactName: activeStation.contactName || prev.contactName || '',
        contactPosition: activeStation.contactPosition || prev.contactPosition || ''
      }));
    }
  }, [activeStation]);

  // Handle photo selection with client-side high performance compression
  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsCompressingPhotos(true);
    try {
      const compressedList = await Promise.all(files.map((file) => compressImage(file)));
      setSelectedPhotos((prev) => [...prev, ...compressedList]);
    } catch (err) {
      console.error('Photo optimization error:', err);
    } finally {
      setIsCompressingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage({ text: 'กำลังส่งข้อมูลและอัปโหลดรูปภาพ...', type: 'info' });

    try {
      const photosPayload = selectedPhotos.map((p) => ({
        name: p.name,
        type: p.type,
        data: p.base64Data
      }));

      const result = await submitSurvey(token, formData, photosPayload);

      setStatusMessage({
        text: `บันทึกข้อมูลรหัส ${result.recordId} เรียบร้อยแล้ว`,
        type: 'success'
      });

      // Clear form and photo previews
      setFormData({
        permit: 'อนุญาต',
        radioStatus: 'ปกติ',
        receiveStatus: 'ปกติ',
        transmitStatus: 'ปกติ',
        powerStatus: 'ปกติ',
        batteryStatus: 'ปกติ'
      });
      setSelectedPhotos([]);
    } catch (err) {
      setStatusMessage({
        text: err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Header */}
        <div className="field-visit-header rounded-2xl border border-white/60 dark:border-blue-500/30 bg-white/70 dark:bg-gradient-to-r dark:from-blue-950/60 dark:via-slate-900/80 dark:to-blue-950/60 p-6 shadow-sm dark:shadow-2xl backdrop-blur-xl transition-all">
          <div className="header-tag text-sm font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-cyan-400 whitespace-nowrap">
            FIELD VISIT / SITE RECORD
          </div>
          <h1 className="mt-1 text-xl sm:text-3xl lg:text-4xl font-black tracking-normal leading-snug sm:leading-normal text-slate-900 dark:text-white sm:whitespace-nowrap">
            <ShinyText>แบบบันทึกเข้าตรวจเยี่ยมเจ้าของพื้นที่</ShinyText>
          </h1>
          <p className="mt-1 text-base text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
            บันทึกการขออนุญาตเข้าพื้นที่ สภาพอุปกรณ์ภาคสนาม และภาพถ่ายประกอบการทำงาน
          </p>
        </div>

        {/* 01 ข้อมูลสถานี */}
        <GlassCard hoverEffect={false} className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400 flex-shrink-0">
              <RadioIcon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-normal leading-normal whitespace-nowrap">
              01 · ข้อมูลสถานี
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="station" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                ชื่อสถานี <span className="text-rose-500 dark:text-rose-400">*</span>
              </label>
              <input
                id="station"
                list="stations-list"
                required
                placeholder="พิมพ์เพื่อค้นหาชื่อสถานี..."
                value={formData.station || ''}
                onChange={(e) => updateField('station', e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 transition-colors shadow-xs dark:shadow-none"
              />
              <datalist id="stations-list">
                {stations.map((s, idx) => (
                  <option key={idx} value={s.village}>
                    {s.province ? `${s.village} (${s.district}, ${s.province})` : s.village}
                  </option>
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="installationPlace" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  สถานที่ติดตั้ง
                </label>
                <input
                  id="installationPlace"
                  type="text"
                  value={formData.installationPlace || ''}
                  onChange={(e) => updateField('installationPlace', e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 transition-colors shadow-xs dark:shadow-none"
                />
              </div>
              <div>
                <label htmlFor="equipmentPlace" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  สถานที่วางเครื่อง
                </label>
                <input
                  id="equipmentPlace"
                  type="text"
                  value={formData.equipmentPlace || ''}
                  onChange={(e) => updateField('equipmentPlace', e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 transition-colors shadow-xs dark:shadow-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="visitDate" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  วันที่เข้าพื้นที่
                </label>
                <input
                  id="visitDate"
                  type="date"
                  value={formData.visitDate || ''}
                  onChange={(e) => updateField('visitDate', e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 transition-colors shadow-xs dark:shadow-none"
                />
              </div>
              <div>
                <label htmlFor="visitTime" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  เวลาเข้าพื้นที่
                </label>
                <input
                  id="visitTime"
                  type="time"
                  value={formData.visitTime || ''}
                  onChange={(e) => updateField('visitTime', e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 transition-colors shadow-xs dark:shadow-none"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 02 ผู้ให้ข้อมูลในพื้นที่ */}
        <GlassCard hoverEffect={false} className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400 flex-shrink-0">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-normal leading-normal whitespace-nowrap">
              02 · ผู้ให้ข้อมูลในพื้นที่
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactName" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                ชื่อ - สกุล
              </label>
              <input
                id="contactName"
                type="text"
                value={formData.contactName || ''}
                onChange={(e) => updateField('contactName', e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 transition-colors shadow-xs dark:shadow-none"
              />
            </div>
            <div>
              <label htmlFor="contactPosition" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                ตำแหน่ง
              </label>
              <input
                id="contactPosition"
                type="text"
                value={formData.contactPosition || ''}
                onChange={(e) => updateField('contactPosition', e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 transition-colors shadow-xs dark:shadow-none"
              />
            </div>
            <div>
              <label htmlFor="contactVillage" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                หน่วยงาน / หมู่บ้าน
              </label>
              <input
                id="contactVillage"
                type="text"
                value={formData.contactVillage || ''}
                onChange={(e) => updateField('contactVillage', e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 transition-colors shadow-xs dark:shadow-none"
              />
            </div>
            <div>
              <label htmlFor="contactPhone" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                เบอร์โทรศัพท์
              </label>
              <input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone || ''}
                onChange={(e) => updateField('contactPhone', e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 transition-colors shadow-xs dark:shadow-none"
              />
            </div>
          </div>
        </GlassCard>

        {/* 03 การขออนุญาตเข้าพื้นที่ (Radix UI Radio Group) */}
        <GlassCard hoverEffect={false} className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400 flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-normal leading-normal whitespace-nowrap">
              03 · การขออนุญาตเข้าพื้นที่
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-2 whitespace-nowrap">
                ได้รับอนุญาตให้ดำเนินการหรือไม่ <span className="text-rose-500 dark:text-rose-400">*</span>
              </label>
              <RadioGroup
                value={formData.permit || 'อนุญาต'}
                onValueChange={(val) => updateField('permit', val)}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
              >
                <label
                  htmlFor="permit-allow"
                  data-checked={formData.permit === 'อนุญาต'}
                  className={cn(
                    "permit-radio-allow flex items-center justify-center sm:justify-start gap-3 rounded-xl border px-5 py-3 text-base font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap shadow-xs select-none backdrop-blur-md w-full sm:w-auto",
                    formData.permit === 'อนุญาต'
                      ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40 dark:border-emerald-500/60 dark:text-emerald-300 dark:ring-0"
                      : "border-slate-200/80 bg-white/55 hover:bg-white/75 text-slate-800 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:text-slate-400"
                  )}
                >
                  <RadioGroupItem value="อนุญาต" id="permit-allow" />
                  <span className={cn(
                    "font-bold whitespace-nowrap",
                    formData.permit === 'อนุญาต'
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-400"
                  )}>
                    อนุญาต
                  </span>
                </label>
                <label
                  htmlFor="permit-deny"
                  data-checked={formData.permit === 'ไม่อนุญาต'}
                  className={cn(
                    "permit-radio-deny flex items-center justify-center sm:justify-start gap-3 rounded-xl border px-5 py-3 text-base font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap shadow-xs select-none backdrop-blur-md w-full sm:w-auto",
                    formData.permit === 'ไม่อนุญาต'
                      ? "border-rose-500 bg-rose-50/80 text-rose-950 ring-2 ring-rose-500/20 dark:bg-rose-950/40 dark:border-rose-500/60 dark:text-rose-300 dark:ring-0"
                      : "border-slate-200/80 bg-white/55 hover:bg-white/75 text-slate-800 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 dark:text-slate-400"
                  )}
                >
                  <RadioGroupItem value="ไม่อนุญาต" id="permit-deny" />
                  <span className={cn(
                    "font-bold whitespace-nowrap",
                    formData.permit === 'ไม่อนุญาต'
                      ? "text-rose-700 dark:text-rose-400"
                      : "text-slate-700 dark:text-slate-400"
                  )}>
                    ไม่อนุญาต
                  </span>
                </label>
              </RadioGroup>
            </div>

            <div>
              <label htmlFor="accessLimit" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                ข้อจำกัดในการเข้าพื้นที่
              </label>
              <textarea
                id="accessLimit"
                rows={2}
                value={formData.accessLimit || ''}
                onChange={(e) => updateField('accessLimit', e.target.value)}
                placeholder="ระบุข้อจำกัดหรือเงื่อนไขเพิ่มเติม (ถ้ามี)..."
                className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 resize-y transition-colors shadow-xs dark:shadow-none"
              />
            </div>
          </div>
        </GlassCard>

        {/* 04 สอบถามการใช้งาน (Radix UI Select) */}
        <GlassCard hoverEffect={false} className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50/80 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400 flex-shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-normal leading-normal whitespace-nowrap">
              04 · สอบถามการใช้งาน
            </h2>
          </div>

          <div className="space-y-4">
            <div className="assessment-table-container overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/55 dark:bg-slate-950/40 backdrop-blur-md shadow-xs">
              <table className="w-full text-left text-base">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <th className="px-4 py-3 whitespace-nowrap">หัวข้อการประเมิน</th>
                    <th className="px-4 py-3 w-48 whitespace-nowrap">ผลการตรวจสอบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {[
                    ['radioStatus', 'ภาพรวมเครื่องวิทยุ', ['ปกติ', 'ไม่ปกติ']],
                    ['receiveStatus', 'การรับสัญญาณ', ['ปกติ', 'ไม่ปกติ']],
                    ['transmitStatus', 'ทดสอบการสนทนา', ['ปกติ', 'ไม่ปกติ']],
                    ['powerStatus', 'การทำงานของระบบไฟฟ้า', ['ปกติ', 'ไม่ปกติ']],
                    ['batteryStatus', 'การทำงานของระบบสำรองไฟ', ['ปกติ', 'ไม่ปกติ']]
                  ].map(([key, label, options]) => (
                    <tr key={key} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 leading-normal whitespace-nowrap">{label}</td>
                      <td className="px-4 py-2.5">
                        <Select
                          value={formData[key] || options[0]}
                          onValueChange={(val) => updateField(key, val)}
                        >
                          <SelectTrigger className="h-10 text-base whitespace-nowrap">
                            <SelectValue placeholder="เลือกคำตอบ" />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <label htmlFor="userProblem" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                ปัญหาเพิ่มเติมที่ผู้ใช้งานแจ้ง
              </label>
              <textarea
                id="userProblem"
                rows={2}
                value={formData.userProblem || ''}
                onChange={(e) => updateField('userProblem', e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 resize-y transition-colors shadow-xs dark:shadow-none"
              />
            </div>
          </div>
        </GlassCard>

        {/* 05 สภาพแวดล้อมหน้างาน */}
        <GlassCard hoverEffect={false} className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400 flex-shrink-0">
              <TreePine className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-normal leading-normal whitespace-nowrap">
              05 · สภาพแวดล้อมหน้างาน
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="siteCondition" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                สภาพพื้นที่ติดตั้งอุปกรณ์
              </label>
              <textarea
                id="siteCondition"
                rows={2}
                value={formData.siteCondition || ''}
                onChange={(e) => updateField('siteCondition', e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 resize-y transition-colors shadow-xs dark:shadow-none"
              />
            </div>

            <div>
              <label htmlFor="antennaCondition" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                สภาพเสาอากาศและสายอากาศที่มองเห็นได้จากพื้น
              </label>
              <textarea
                id="antennaCondition"
                rows={2}
                value={formData.antennaCondition || ''}
                onChange={(e) => updateField('antennaCondition', e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 resize-y transition-colors shadow-xs dark:shadow-none"
              />
            </div>

            <div>
              <label htmlFor="workObstacle" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                อุปสรรคในการปฏิบัติงาน
              </label>
              <textarea
                id="workObstacle"
                rows={2}
                value={formData.workObstacle || ''}
                onChange={(e) => updateField('workObstacle', e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 resize-y transition-colors shadow-xs dark:shadow-none"
              />
            </div>
          </div>
        </GlassCard>

        {/* 06 ภาพถ่ายก่อนดำเนินงาน */}
        <GlassCard hoverEffect={false} className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400 flex-shrink-0">
              <Camera className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-normal leading-normal whitespace-nowrap">
              06 · ภาพถ่ายก่อนดำเนินงาน
            </h2>
          </div>

          <div className="space-y-4">
            {/* Upload Drag & Drop Area */}
            <label
              htmlFor="photos-input"
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer ${isCompressingPhotos
                ? 'border-cyan-500/60 bg-cyan-50 dark:bg-cyan-950/30 animate-pulse text-cyan-700 dark:text-cyan-300'
                : 'border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50/70 dark:border-blue-500/30 dark:bg-blue-950/20 dark:hover:border-blue-500/60 dark:hover:bg-blue-950/30'
                }`}
            >
              {isCompressingPhotos ? (
                <Loader2 className="h-9 w-9 text-blue-600 dark:text-cyan-400 mb-2 animate-spin" />
              ) : (
                <UploadCloud className="h-9 w-9 text-blue-600 dark:text-cyan-400 mb-2" />
              )}
              <div className="text-base font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                {isCompressingPhotos
                  ? 'กำลังปรับขนาดและบีบอัดรูปภาพอัตโนมัติ...'
                  : 'คลิกเพื่อเลือกภาพถ่ายหน้างาน (ระบบบีบอัดความละเอียดสูงอัตโนมัติ)'}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 whitespace-nowrap">
                รองรับไฟล์ภาพ JPG, PNG, WebP — ปรับขนาดอัตโนมัติเพื่อการส่งข้อมูลภาคสนามที่รวดเร็ว
              </div>
              <input
                ref={fileInputRef}
                id="photos-input"
                type="file"
                multiple
                accept="image/*"
                disabled={isCompressingPhotos}
                onChange={handlePhotoSelect}
                className="sr-only"
              />
            </label>

            {/* Photo Thumbnails */}
            {selectedPhotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {selectedPhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-blue-500/30 bg-slate-100 dark:bg-slate-900 shadow-xs"
                  >
                    <img
                      src={photo.previewUrl}
                      alt={photo.name}
                      className="h-full w-full object-cover"
                    />

                    {/* Size badge */}
                    <div className="absolute top-1.5 left-1.5 rounded-md bg-black/75 px-2 py-0.5 text-xs font-mono font-semibold text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
                      {Math.round(photo.size / 1024)} KB
                    </div>

                    {/* Overlay controls */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActivePreviewPhoto(photo)}
                        className="rounded-lg bg-blue-600/80 p-2 text-white hover:bg-blue-600 transition-colors cursor-pointer"
                        title="ดูภาพขนาดใหญ่"
                      >
                        <ZoomIn className="h-4.5 w-4.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="rounded-lg bg-rose-600/80 p-2 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                        title="ลบภาพนี้"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-xs font-medium text-slate-200 truncate">
                      {photo.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        {/* 07 ยืนยันข้อมูล */}
        <GlassCard hoverEffect={false} className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400 flex-shrink-0">
              <CheckSquare className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-normal leading-normal whitespace-nowrap">
              07 · ยืนยันข้อมูล
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="summary" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                สรุปสิ่งที่ได้รับแจ้งจากเจ้าของพื้นที่
              </label>
              <textarea
                id="summary"
                rows={3}
                value={formData.summary || ''}
                onChange={(e) => updateField('summary', e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 resize-y transition-colors shadow-xs dark:shadow-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="informantName" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  ชื่อผู้ให้ข้อมูล
                </label>
                <input
                  id="informantName"
                  type="text"
                  value={formData.informantName || ''}
                  onChange={(e) => updateField('informantName', e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 transition-colors shadow-xs dark:shadow-none"
                />
              </div>
              <div>
                <label htmlFor="operatorName" className="block text-base font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  ชื่อผู้ปฏิบัติงาน
                </label>
                <input
                  id="operatorName"
                  type="text"
                  value={formData.operatorName || ''}
                  onChange={(e) => updateField('operatorName', e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-[rgba(115,149,174,0.25)] bg-white/55 dark:bg-[rgba(6,19,33,0.7)] backdrop-blur-md px-4 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-500/40 transition-colors shadow-xs dark:shadow-none"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Submit Button with Framer Motion Spring */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 py-4 text-lg font-bold tracking-wide text-slate-950 shadow-lg shadow-blue-500/20 hover:shadow-cyan-500/30 transition-all disabled:opacity-60 cursor-pointer whitespace-nowrap"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>กำลังบันทึกข้อมูล...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span>บันทึกข้อมูลการเข้าตรวจเยี่ยม</span>
            </>
          )}
        </motion.button>

        {/* Status Feedback Message */}
        {statusMessage.text && (
          <div
            className={`flex items-center gap-2.5 rounded-xl border p-4 text-base font-semibold ${statusMessage.type === 'success'
              ? 'border-emerald-200 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
              : statusMessage.type === 'error'
                ? 'border-rose-200 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                : 'border-blue-200 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300'
              }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            ) : (
              <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-blue-600 dark:text-blue-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </form>

      {/* Photo Preview Modal using Radix Dialog */}
      <Dialog
        open={Boolean(activePreviewPhoto)}
        onOpenChange={(open) => !open && setActivePreviewPhoto(null)}
      >
        <DialogContent className="max-w-2xl bg-white/85 dark:bg-slate-950/90 backdrop-blur-2xl border border-white/60 dark:border-blue-500/40 p-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate">
              {activePreviewPhoto?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-black/60 max-h-[70vh] flex items-center justify-center">
            {activePreviewPhoto && (
              <img
                src={activePreviewPhoto.previewUrl}
                alt={activePreviewPhoto.name}
                className="max-h-[65vh] w-auto object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.main>
  );
}
