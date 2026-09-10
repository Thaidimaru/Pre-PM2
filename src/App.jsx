import React, { useState, useEffect } from 'react';
import { Spotlight } from '@/components/ui/spotlight';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { FieldVisitView } from '@/components/field/FieldVisitView';
import { LoginView } from '@/components/auth/LoginView';

export function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('surveyToken') || '');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/login') return 'login';
    return 'field';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    const targetUrl = page === 'dashboard' ? '/dashboard' : page === 'login' ? '/login' : '/';
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('surveyToken');
    setToken('');
    setCurrentPage('login');
    window.history.pushState({}, '', '/login');
  };

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    navigateTo('dashboard');
  };

  // Sync state with browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/dashboard') setCurrentPage('dashboard');
      else if (path === '/login') setCurrentPage('login');
      else setCurrentPage('field');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Redirect to dashboard if already authenticated and browsing to /login
  useEffect(() => {
    if (token && window.location.pathname === '/login') {
      navigateTo('dashboard');
    }
  }, [token]);

  if (!token) {
    return (
      <div
        className="relative min-h-screen flex flex-col justify-center transition-colors duration-300"
        style={{ background: 'var(--theme-bg-gradient)', color: 'var(--theme-text)' }}
      >
        <Spotlight />
        <LoginView
          theme={theme}
          toggleTheme={toggleTheme}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen transition-colors duration-300"
      style={{ background: 'var(--theme-bg-gradient)', color: 'var(--theme-text)' }}
    >
      <Spotlight />

      {/* Top Fixed Navbar */}
      <Navbar />

      <div className="flex">
        {/* Left Fixed Sidebar */}
        <Sidebar
          currentPage={currentPage === 'login' ? 'dashboard' : currentPage}
          onNavigate={navigateTo}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* Dynamic Page Content */}
        <div className="flex-1 pl-0 lg:pl-64 transition-all duration-300">
          <div className="min-h-[calc(100vh-88px)] py-6">
            {currentPage === 'dashboard' ? (
              <DashboardView onNavigate={navigateTo} />
            ) : (
              <FieldVisitView />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-900">
          <div className="max-w-lg p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">เกิดข้อผิดพลาดในการแสดงผล</h2>
            <p className="text-sm text-slate-600 mb-4">
              ระบบตรวจพบข้อผิดพลาด กรุณารีเฟรชหน้าเว็บ หรือกดลองใหม่อีกครั้ง
            </p>
            {this.state.error?.message && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-mono text-rose-700 text-left overflow-x-auto max-h-32">
                <b>Error:</b> {this.state.error.message}
              </div>
            )}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                ลองใหม่อีกครั้ง
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer"
              >
                รีเฟรชหน้าเว็บ
              </button>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.clear();
                  window.location.href = '/dashboard';
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
              >
                ล้างเซสชันแล้วเข้าใหม่
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AppWithErrorBoundary(props) {
  return (
    <ErrorBoundary>
      <App {...props} />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;
