/**
 * MAIN APP COMPONENT
 * Manages global state including routing (view), user authentication, and theme.
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VisualMockup from './components/VisualMockup';
import WhatWeDo from './components/WhatWeDo';
import ProcessSteps from './components/ProcessSteps';
import Pricing from './components/Pricing';
import DashboardView from './components/DashboardView';
import AuthModal from './components/AuthModal';
import { LaunchSequence } from './types';

const App: React.FC = () => {
  // Global Application State
  const [productInfo, setProductInfo] = useState('');     // User's input prompt from hero section
  const [loading, setLoading] = useState(false);          // Global loading state (unused in landing but kept for consistency)
  const [error, setError] = useState<string | null>(null); // Global error message
  const [view, setView] = useState<'landing' | 'dashboard'>('landing'); // Simple routing state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);        // Modal visibility
  const [openSettingsOnDash, setOpenSettingsOnDash] = useState(false);  // Control to deep-link to settings in dashboard
  
  // User Session Management
  const [user, setUser] = useState<{ email: string; name: string } | null>(() => {
    const saved = localStorage.getItem('rain_logged_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Dark Mode Persistence Logic
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('rain_theme') === 'dark' || document.documentElement.classList.contains('dark');
  });

  // Effect to apply theme classes to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('rain_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('rain_theme', 'light');
    }
  }, [darkMode]);

  // Effect to trigger landing page animations on scroll
  useEffect(() => {
    if (view === 'landing') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => e.isIntersecting && e.target.classList.add('active'));
      }, { threshold: 0.1 });
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }
  }, [view]);

  // Navigation Handlers
  const handleLaunchDashboard = () => {
    setOpenSettingsOnDash(false);
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setView('dashboard');
    }
  };

  const handleSettingsClick = () => {
    setOpenSettingsOnDash(true);
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setView('dashboard');
    }
  };

  // Auth Callbacks
  const handleAuthSuccess = (userData: { email: string; name: string }) => {
    setUser(userData);
    localStorage.setItem('rain_logged_user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('rain_logged_user');
    setOpenSettingsOnDash(false);
    setView('landing');
  };

  // Profile Update Handler
  const handleUpdateUser = (newName: string) => {
    if (user) {
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
      localStorage.setItem('rain_logged_user', JSON.stringify(updatedUser));
      
      const users = JSON.parse(localStorage.getItem('rain_users') || '{}');
      const normalizedEmail = user.email.toLowerCase();
      if (users[normalizedEmail]) {
        users[normalizedEmail].name = newName;
        localStorage.setItem('rain_users', JSON.stringify(users));
      }
    }
  };

  // Conditional Rendering for Authenticated Dashboard
  if (view === 'dashboard' && user) return (
    <DashboardView 
      onBack={() => setView('landing')} 
      userName={user.name} 
      userEmail={user.email}
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      initialPrompt={productInfo}
      openSettingsInitially={openSettingsOnDash}
    />
  );

  // Landing Page Render
  return (
    <div className="min-h-screen hero-bg bg-transparent dark:text-zinc-100 transition-colors duration-300">
      <Navbar onActionClick={handleLaunchDashboard} onSettingsClick={handleSettingsClick} />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={handleAuthSuccess} 
      />

      <main className="pt-32 md:pt-48 pb-20">
        <header className="flex flex-col items-center text-center mb-16 px-4 reveal">
          <div className="inline-block px-5 py-2 bg-oroYellow rounded-full mb-8 flex items-center gap-2 mx-auto w-fit">
             <div className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse shrink-0"></div>
             <span className="text-zinc-900 font-black text-[10px] tracking-[0.2em] uppercase">The Rainfall of Revenue Has Begun</span>
          </div>
          <div className="convex-title mb-8 flex justify-center w-full">
            <h1 className="text-5xl md:text-9xl font-black text-zinc-900 dark:text-white tracking-tighter leading-[1.1] md:leading-[1.1] text-center">Let Success <br /><span className="inline-block mt-2 px-6 py-2 bg-zinc-900/10 dark:bg-transparent backdrop-blur-sm dark:backdrop-blur-none rounded-[2rem] text-oroYellow italic">Rain Down.</span></h1>
          </div>
          <p className="text-xl md:text-2xl text-zinc-400 dark:text-zinc-500 max-w-3xl mx-auto font-medium leading-relaxed">OroDrop crafts the exact psychological narrative your brand needs.</p>
        </header>

        <section className="reveal">
          <VisualMockup 
            inputValue={productInfo} 
            setInputValue={setProductInfo} 
            onGenerate={handleLaunchDashboard} 
            isLoading={loading} 
          />
        </section>
        
        {error && (
          <div className="max-w-md mx-auto mb-10 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-center font-bold text-sm">
            {error}
          </div>
        )}

        <WhatWeDo />
        <ProcessSteps />
        <Pricing />
      </main>
    </div>
  );
};

export default App;