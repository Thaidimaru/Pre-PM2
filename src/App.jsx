import React, { useState, useEffect } from 'react';
import { Spotlight } from '@/components/ui/spotlight';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { FieldVisitView } from '@/components/field/FieldVisitView';
import { LoginView } from '@/components/auth/LoginView';

export function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('surveyToken') || '');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/login') return 'login';
    return 'field';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
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
        className="relative min-h-screen text-slate-100 flex flex-col justify-center transition-colors duration-300"
        style={{ background: 'var(--theme-bg-gradient)' }}
      >
        <Spotlight />
        <LoginView onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen text-slate-100 transition-colors duration-300"
      style={{ background: 'var(--theme-bg-gradient)' }}
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

export default App;
