import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, Sun, Moon } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { ShinyText } from '@/components/ui/shiny-text';
import { APP_VERSION } from '@/version';
import { loginUser } from '@/lib/api';
import nbtcLogo from '@/assets/images/nbtc-logo-dashboard.png';

export function LoginView({ onLoginSuccess, theme = 'light', toggleTheme }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const data = await loginUser(password);
      sessionStorage.setItem('surveyToken', data.token);
      onLoginSuccess(data.token);
    } catch (err) {
      setErrorMsg(err.message || 'ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบรหัสผ่าน');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLight = theme === 'light';

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <GlassCard
          className={`p-8 sm:p-10 transition-all duration-300 ${
            isLight
              ? 'bg-white/95 border-slate-200/90 shadow-2xl shadow-slate-300/40 text-slate-900'
              : 'border-blue-500/30'
          }`}
          hoverEffect={false}
        >
          {/* Brand Header & Theme Toggle */}
          <div className={`flex items-center justify-between pb-6 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <div className="flex items-center gap-3.5">
              <img
                src={nbtcLogo}
                alt="NBTC Logo"
                onError={(e) => {
                  if (e.currentTarget.src !== '/assets/images/nbtc-logo-dashboard.png') {
                    e.currentTarget.src = '/assets/images/nbtc-logo-dashboard.png';
                  }
                }}
                className={`h-12 w-auto object-contain ${
                  isLight ? 'drop-shadow-sm' : 'drop-shadow-[0_0_10px_rgba(8,127,255,0.4)]'
                }`}
              />
              <div className="flex flex-col">
                <span className={`text-xl font-black whitespace-nowrap ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  NBTC MICROWAVE
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold tracking-[0.2em] whitespace-nowrap ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}>
                    SURVEY CONTROL ROOM
                  </span>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${
                    isLight
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    v{APP_VERSION}
                  </span>
                </div>
              </div>
            </div>

            {/* Theme Toggle Button */}
            {toggleTheme && (
              <button
                type="button"
                onClick={toggleTheme}
                title={isLight ? 'สลับเป็นโหมดกลางคืน' : 'สลับเป็นโหมดกลางวัน'}
                aria-label={isLight ? 'สลับเป็นโหมดกลางคืน' : 'สลับเป็นโหมดกลางวัน'}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  isLight
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 hover:text-slate-900'
                    : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 hover:text-blue-100'
                }`}
              >
                {isLight ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
              </button>
            )}
          </div>

          <div className="mt-6 mb-6">
            <h1 className={`text-3xl font-extrabold tracking-normal leading-normal whitespace-nowrap ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isLight ? 'เข้าสู่ระบบ' : <ShinyText>เข้าสู่ระบบ</ShinyText>}
            </h1>
            <p className={`mt-1.5 text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              กรุณากรอกรหัสผ่านเพื่อเข้าใช้งาน Dashboard ศูนย์ควบคุม และแบบบันทึกการสำรวจ Field Visit
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="login-password"
                className={`block text-base font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-200'}`}
              >
                รหัสผ่านสำหรับเข้าใช้งาน
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน..."
                  required
                  autoFocus
                  className={`w-full rounded-xl pl-11 pr-12 py-3 text-base transition-all focus:outline-none focus:ring-2 ${
                    isLight
                      ? 'border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-blue-500/20 shadow-sm'
                      : 'border border-[rgba(115,149,174,0.3)] bg-[rgba(6,19,33,0.85)] text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  className={`absolute inset-y-0 right-0 flex items-center pr-3.5 transition-colors cursor-pointer ${
                    isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 rounded-xl p-3.5 text-sm font-medium border ${
                  isLight
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'border-rose-500/30 bg-rose-950/40 text-rose-300'
                }`}
              >
                <AlertCircle className={`h-4.5 w-4.5 flex-shrink-0 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/35 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>กำลังตรวจสอบ...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer note */}
          <div className={`mt-6 text-center text-[11px] leading-normal ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            ระบบความปลอดภัยยืนยันตัวตนด้วยสิทธิ์ประจำสถานี • Pre-PM Platform
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
