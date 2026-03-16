/**
 * DASHBOARD VIEW
 * The core workspace for authenticated users. Handles sequence generation,
 * archive history, and system settings.
 */

import React, { useState, useEffect, useRef } from 'react';
import { generateStorySequence } from '../services/geminiService';
import { LaunchSequence, StoryDay } from '../types';

interface HistoryItem {
  prompt: string;
  image: string | null;
  result: LaunchSequence;
  timestamp: number;
  isDirectorMode: boolean;
}

interface DashboardProps {
  onBack: () => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  onUpdateUser: (newName: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  initialPrompt?: string;
  openSettingsInitially?: boolean;
}

type SettingsView = 'main' | 'profile';

function DashboardView({ 
  onBack, 
  userName, 
  userEmail, 
  onLogout, 
  onUpdateUser, 
  darkMode, 
  setDarkMode, 
  initialPrompt = '', 
  openSettingsInitially = false 
}: DashboardProps) {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<'workspace' | 'history'>('workspace');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<SettingsView>('main');
  
  // Storage key uniquely identified by user email
  const historyStorageKey = `rain_history_${userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  const [shouldReturnToLanding, setShouldReturnToLanding] = useState(openSettingsInitially);

  // Profile Edit State
  const [newName, setNewName] = useState(userName);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Generation Core State
  const [prompt, setPrompt] = useState(initialPrompt);               // The product description
  const [loading, setLoading] = useState(false);                     // Is the AI thinking?
  const [loadingSource, setLoadingSource] = useState<'update' | 'new' | null>(null); // Context of the load
  const [error, setError] = useState<string | null>(null);           // Error handling
  const [result, setResult] = useState<LaunchSequence | null>(null); // The current active sequence
  
  // History persistence: Load from localStorage on initialization
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(`rain_history_${userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isDirectorMode, setIsDirectorMode] = useState(false); // Toggle for technical shot lists
  
  // Dynamic Sidebar State
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-generate on mount if initialPrompt is provided and no result exists
  useEffect(() => {
    if (initialPrompt && !result && !loading) {
      handleGenerate(false);
    }
  }, [initialPrompt]);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Synchronize initial component state with props
  useEffect(() => {
    if (openSettingsInitially) {
      setShowSettings(true);
      setSettingsView('main');
      setShouldReturnToLanding(true);
    }
  }, [openSettingsInitially]);

  useEffect(() => {
    setNewName(userName);
  }, [userName]);

  // UI State Handlers
  const handleCloseSettings = () => {
    if (settingsView !== 'main') {
      setSettingsView('main');
    } else {
      setShowSettings(false);
      if (shouldReturnToLanding) {
        onBack();
      }
    }
  };

  const navigateToTab = (tab: 'workspace' | 'history') => {
    setActiveTab(tab);
    setShowSettings(false);
    setShouldReturnToLanding(false);
    setIsSidebarOpen(false);
  };

  /**
   * Helper to determine color schemes for the 4 phases of the launch.
   */
  const getStageStyles = (day: number) => {
    if (day <= 3) return { label: 'A W A R E N E S S', textColor: 'text-cyan-500', borderColor: 'border-cyan-500', tint: 'bg-cyan-400/5', hoverTint: 'group-hover:bg-cyan-400/10', border: 'border-cyan-100/30' };
    if (day <= 7) return { label: 'A U T H O R I T Y', textColor: 'text-orange-500', borderColor: 'border-orange-500', tint: 'bg-orange-400/5', hoverTint: 'group-hover:bg-orange-400/10', border: 'border-orange-100/30' };
    if (day <= 10) return { label: 'L E A D  G E N', textColor: 'text-rose-500', borderColor: 'border-rose-500', tint: 'bg-rose-400/5', hoverTint: 'group-hover:bg-rose-400/10', border: 'border-rose-100/30' };
    return { label: 'C O N V E R S I O N', textColor: 'text-lime-500', borderColor: 'border-lime-500', tint: 'bg-lime-400/5', hoverTint: 'group-hover:bg-lime-400/10', border: 'border-lime-100/30' };
  };

  /**
   * Triggers the AI synthesis process.
   * @param isUpdate If true, sends previous context to the AI for refinement.
   */
  const handleGenerate = async (isUpdate: boolean = true) => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setLoadingSource(isUpdate ? 'update' : 'new');
    setError(null);
    try {
      const currentMode = isDirectorMode;
      const data = await generateStorySequence(prompt, undefined, currentMode, isUpdate ? (result || undefined) : undefined);
      setResult(data);
      
      const newItem: HistoryItem = { 
        prompt, 
        image: null, 
        result: data, 
        timestamp: Date.now(), 
        isDirectorMode: currentMode 
      };

      // Persistent Storage Logic
      setHistory(prev => {
        const updated = [newItem, ...prev];
        localStorage.setItem(historyStorageKey, JSON.stringify(updated));
        return updated;
      });

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError("Engine congestion. Retry in 60s.");
    } finally {
      setLoading(false);
      setLoadingSource(null);
    }
  };

  /**
   * Updates user name or password in the global neural vault (localStorage).
   */
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    
    const users = JSON.parse(localStorage.getItem('rain_users') || '{}');
    const normalizedEmail = userEmail.toLowerCase().trim();
    const user = users[normalizedEmail];
    
    if (!user) {
      setProfileMsg({ text: 'Neural profile not found.', type: 'error' });
      return;
    }

    let updated = false;
    if (currentPass || newPass) {
      if (user.password !== currentPass) {
        setProfileMsg({ text: 'Invalid current access key.', type: 'error' });
        return;
      }
      if (!newPass) {
        setProfileMsg({ text: 'Please enter a new access key.', type: 'error' });
        return;
      }
      user.password = newPass;
      updated = true;
    }
    if (newName.trim() && newName !== userName) {
      user.name = newName.trim();
      onUpdateUser(user.name);
      updated = true;
    }
    if (updated) {
      users[normalizedEmail] = user;
      localStorage.setItem('rain_users', JSON.stringify(users));
      setProfileMsg({ text: 'Protocol identity updated successfully.', type: 'success' });
      setCurrentPass('');
      setNewPass('');
    } else {
      setProfileMsg({ text: 'No changes detected in the neural stream.', type: 'error' });
    }
  };

  const isSidebarVisible = isSidebarOpen;

  return (
    <div className={`w-screen h-screen flex font-sans bg-transparent text-zinc-900 dark:text-zinc-100 overflow-hidden transition-colors duration-0`}>
      
      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[105] animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside 
        className={`fixed top-0 left-0 h-full z-[110] flex flex-col bg-white dark:bg-darkCard border-r border-zinc-100 dark:border-darkBorder shadow-heavy transition-all duration-500 ease-in-out transform ${isSidebarVisible ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}`}
      >
        <div className="pt-10 pb-4 flex flex-col items-center">
          <div className="flex flex-col items-center gap-4 cursor-pointer w-full" onClick={onBack}>
            <div className="w-12 h-12 bg-oroYellow rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
                <path d="m13 11-4 6h6l-4 6" />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white text-center">OroDrop</span>
          </div>
        </div>

        <nav className="flex-1 px-8 pt-4 space-y-4 flex flex-col">
          <button onClick={() => navigateToTab('workspace')} className={`w-full flex items-center justify-start gap-4 px-10 py-4 rounded-2xl text-sm font-black transition-all border border-zinc-900 dark:border-zinc-800 ${activeTab === 'workspace' && !showSettings ? 'bg-oroYellow text-black shadow-xl' : 'bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white hover:bg-oroYellow hover:text-black dark:hover:bg-oroYellow dark:hover:text-black hover:shadow-lg hover:shadow-oroYellow/20'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Workspace
          </button>
          <button onClick={() => navigateToTab('history')} className={`w-full flex items-center justify-start gap-4 px-10 py-4 rounded-2xl text-sm font-black transition-all border border-zinc-900 dark:border-zinc-800 ${activeTab === 'history' && !showSettings ? 'bg-oroYellow text-black shadow-xl' : 'bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white hover:bg-oroYellow hover:text-black dark:hover:bg-oroYellow dark:hover:text-black hover:shadow-lg hover:shadow-oroYellow/20'}`}>
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Archive
          </button>
          <button onClick={() => { setShowSettings(true); setSettingsView('main'); setIsSidebarOpen(false); }} className={`w-full flex items-center justify-start gap-4 px-10 py-4 rounded-2xl text-sm font-black transition-all border border-zinc-900 dark:border-zinc-800 ${showSettings ? 'bg-oroYellow text-black shadow-xl' : 'bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white hover:bg-oroYellow hover:text-black dark:hover:bg-oroYellow dark:hover:text-black hover:shadow-lg hover:shadow-oroYellow/20'}`}>
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Settings
          </button>
        </nav>

        <div className="p-8 border-t border-zinc-50 dark:border-darkBorder opacity-0 pointer-events-none">
           {/* Placeholder for spacing */}
        </div>
      </aside>

      {/* Settings Overlay View */}
      {showSettings && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-6 bg-zinc-900/20 dark:bg-zinc-900/60 backdrop-blur-md animate-fade-in" onClick={handleCloseSettings}>
          <div className="w-full max-w-2xl bg-white dark:bg-darkCard rounded-[32px] md:rounded-[48px] p-8 md:p-12 shadow-heavy border border-zinc-100 dark:border-darkBorder animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 md:mb-12">
               <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight dark:text-white">
                 {settingsView === 'main' ? 'Neural Hub Settings' : 'Protocol Identity'}
               </h2>
               <button onClick={handleCloseSettings} className="w-10 h-10 border border-zinc-100 dark:border-darkBorder rounded-full flex items-center justify-center text-zinc-300 hover:text-black dark:hover:text-white transition-colors">
                 {settingsView === 'main' ? '✕' : '←'}
               </button>
            </div>
            
            <div className="space-y-6">
               {/* Main Settings Menu */}
               {settingsView === 'main' && (
                 <>
                   <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[36px] border border-zinc-100 dark:border-darkBorder flex items-center justify-between">
                      <div>
                         <h4 className="text-xl font-black uppercase text-zinc-900 dark:text-white">Interface Modality</h4>
                         <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">Adjust visual environment</p>
                      </div>
                      <button onClick={() => setDarkMode(!darkMode)} className="relative w-20 md:w-24 h-10 md:h-12 bg-white dark:bg-zinc-800 rounded-full p-1 md:p-1.5 transition-all duration-300 overflow-hidden border border-zinc-200 dark:border-darkBorder shadow-inner group shrink-0">
                         <div className={`absolute top-1/2 -translate-y-1/2 left-1 md:left-1.5 w-8 h-8 md:w-9 md:h-9 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 transform ${darkMode ? 'translate-x-10 md:translate-x-12 bg-oroYellow' : 'translate-x-0 bg-white'}`}>
                            {darkMode ? <svg className="w-4 h-4 md:w-5 md:h-5 text-zinc-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z"/></svg> : <svg className="w-4 h-4 md:w-5 md:h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM2 13h2a1 1 0 1 0 0-2H2a1 1 0 1 0 0 2zm18 0h2a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2zM11 2v2a1 1 0 1 0 2 0V2a1 1 0 1 0-2 0zm0 18v2a1 1 0 1 0 2 0v-2a1 1 0 1 0-2 0z"/></svg>}
                         </div>
                      </button>
                   </div>
                   <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[36px] border border-zinc-100 dark:border-darkBorder overflow-hidden">
                      <div onClick={() => setSettingsView('profile')} className="p-6 border-b border-zinc-100 dark:border-darkBorder hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer group flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-black uppercase text-zinc-900 dark:text-white">Profile</h4>
                          <p className="text-[10px] font-bold text-zinc-400 mt-0.5 uppercase tracking-widest">Pilot Identification</p>
                        </div>
                        <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                      </div>
                      <div onClick={onLogout} className="p-6 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer group flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-black uppercase text-zinc-900 dark:text-white">Logout</h4>
                          <p className="text-[10px] font-bold text-zinc-400 mt-0.5 uppercase tracking-widest">Terminate Connection</p>
                        </div>
                        <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                      </div>
                   </div>
                 </>
               )}

               {/* Profile Identity Sub-view */}
               {settingsView === 'profile' && (
                 <div className="animate-fade-in-up">
                   <div className="flex items-center gap-6 mb-10 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-100 dark:border-darkBorder">
                     <div className="w-20 h-20 rounded-full bg-oroYellow flex items-center justify-center text-3xl font-black text-zinc-900 shadow-xl">
                       {userName.charAt(0)}
                     </div>
                     <div>
                       <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">{userName}</h3>
                       <p className="text-sm font-bold text-zinc-400 lowercase">{userEmail}</p>
                     </div>
                   </div>
                   
                   <form onSubmit={handleProfileUpdate} className="space-y-4">
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 ml-4 mb-2">Update Credentials</h4>
                     {profileMsg.text && (
                       <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${profileMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                         {profileMsg.text}
                       </div>
                     )}
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Display Name</label>
                        <input type="text" placeholder="Display Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-darkBorder rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-oroYellow transition-all shadow-inner" required />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Current Access Key</label>
                        <div className="relative">
                          <input type={showCurrentPass ? "text" : "password"} placeholder="Current Access Key" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-darkBorder rounded-2xl py-4 pl-6 pr-14 text-sm font-bold focus:outline-none focus:border-oroYellow transition-all shadow-inner" />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-400 dark:text-zinc-500 hover:text-oroYellow transition-colors rounded-xl"
                          >
                            {showCurrentPass ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M1 1l22 22" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">New Access Key</label>
                        <div className="relative">
                          <input type={showNewPass ? "text" : "password"} placeholder="New Access Key" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-darkBorder rounded-2xl py-4 pl-6 pr-14 text-sm font-bold focus:outline-none focus:border-oroYellow transition-all shadow-inner" />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-400 dark:text-zinc-500 hover:text-oroYellow transition-colors rounded-xl"
                          >
                            {showNewPass ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M1 1l22 22" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                     </div>
                     <button type="submit" className="w-full h-14 bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white hover:bg-oroYellow hover:text-black dark:hover:bg-oroYellow dark:hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-4">Commit Profile Update</button>
                   </form>
                 </div>
               )}


            </div>
          </div>
        </div>
      )}

      {/* Primary Workspace Scroll Area */}
      <main 
        ref={scrollContainerRef} 
        className={`flex-1 flex flex-col overflow-y-auto relative custom-scrollbar transition-all duration-500 bg-transparent ml-0`}
      >
        <div className="p-6 md:p-12 flex flex-col gap-10 h-full relative z-10">
          {activeTab === 'workspace' && (
            <div className={`flex flex-col items-center flex-1 w-full max-w-7xl mx-auto pt-24 md:pt-32`}>
              
              {/* Empty Workspace: Generator Prompt */}
              {!result ? (
                  <div className="w-full max-w-4xl text-center">
                    <h1 className="text-5xl md:text-7xl font-black uppercase mb-12 tracking-tight dark:text-white">14 Day Strategy Launch</h1>
                    <div className="relative rounded-[44px] md:rounded-[56px] p-8 md:p-10 border border-zinc-100 dark:border-darkBorder bg-white dark:bg-darkCard shadow-heavy">
                       <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your product launch..." className="w-full bg-transparent border-none outline-none ring-0 placeholder-zinc-300 dark:placeholder-zinc-600 resize-none font-bold text-2xl md:text-3xl h-48 text-zinc-900 dark:text-white" />
                       <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="relative group/director-btn w-full md:w-auto">
                            <button 
                                onClick={() => setIsDirectorMode(!isDirectorMode)}
                                className={`flex items-center justify-center gap-2 w-full px-6 h-14 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${isDirectorMode ? 'bg-oroYellow text-black shadow-lg' : 'bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white border-2 border-zinc-900 dark:border-zinc-700 hover:bg-oroYellow hover:text-black dark:hover:bg-oroYellow dark:hover:text-black hover:border-oroYellow'}`}
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 18v3" />
                                  <path d="M9 21h6" />
                                  <path d="M12 13v2" />
                                  <circle cx="12" cy="15" r="3" />
                                  <rect x="8" y="5" width="8" height="6" rx="1" />
                                  <path d="M16 8l3-1.5v3L16 8" />
                                </svg>
                                <span>Director Mode</span>
                                <div className="relative group/info-trigger ml-1">
                                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px] font-black cursor-help hover:bg-current hover:text-white transition-all">i</div>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-black text-white text-[10px] font-bold rounded-2xl opacity-0 invisible group-hover/info-trigger:opacity-100 group-hover/info-trigger:visible transition-all duration-300 z-[100] shadow-2xl border border-white/10 text-center leading-relaxed">
                                    Let the Thunderstorm Begin - allow us to show you how to shoot your content
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-black"></div>
                                  </div>
                                </div>
                            </button>
                          </div>

                          <button 
                            onClick={() => handleGenerate(false)} 
                            className={`relative w-full md:w-auto h-14 px-12 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 overflow-hidden ${loading ? 'bg-oroYellow text-zinc-900' : 'bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white border-2 border-zinc-900 dark:border-zinc-700 hover:bg-oroYellow hover:text-black dark:hover:bg-oroYellow dark:hover:text-black hover:border-oroYellow'}`}
                          >
                            {loading && (
                              <div className="absolute inset-0 pointer-events-none">
                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                  <rect 
                                    x="0" y="0" width="100%" height="100%" 
                                    rx="28" ry="28"
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="3" 
                                    strokeDasharray="4, 12" 
                                    className="animate-dots-rotate"
                                    opacity="0.8"
                                  />
                                </svg>
                              </div>
                            )}
                            {loading ? (
                              <>
                                <div className="relative w-5 h-5 flex flex-col items-center">
                                  <svg className="w-5 h-3 text-zinc-900 mb-[-3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 13a4 4 0 0 1 0 8H7a5 5 0 0 1 0-10 5 5 0 0 1 8 2z" />
                                  </svg>
                                  <div className="flex gap-1">
                                    <div className="w-0.5 h-1 bg-zinc-900 rain-drop"></div>
                                    <div className="w-0.5 h-1 bg-zinc-900 rain-drop"></div>
                                    <div className="w-0.5 h-1 bg-zinc-900 rain-drop"></div>
                                  </div>
                                </div>
                                <span className="relative z-10">Synthesizing...</span>
                              </>
                            ) : "Drop Idea"}
                          </button>
                       </div>
                    </div>
                 </div>
              ) : (
                /* Full Workspace: Render Results */
                <div className="w-full pb-20 animate-fade-in flex flex-col">
                  <div className="text-center mb-24 px-4">
                    <h3 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tight leading-none dark:text-white">{result.brandName}</h3>
                    <p className="text-xl md:text-2xl font-bold text-zinc-600 dark:text-zinc-400 italic">"{result.audience}"</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-20 md:gap-y-32 gap-x-6 md:gap-x-12 px-2 items-stretch mb-32">
                    {result.sequence.map((item, index) => {
                      const stage = getStageStyles(item.day);
                      const isLast = index === result.sequence.length - 1;
                      return (
                        <div key={item.day} className="relative flex">
                          <div className={`group relative w-full rounded-[32px] md:rounded-[56px] p-6 md:p-10 pt-24 md:pt-32 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-oroYellow/20 hover:border-oroYellow hover:bg-oroYellow dark:hover:bg-zinc-900 transition-all duration-700 flex flex-col items-center overflow-visible hover:shadow-heavy h-full`}>
                            <div className={`absolute inset-0 transition-opacity duration-700 rounded-[32px] md:rounded-[56px] bg-oroYellow/0 group-hover:bg-oroYellow/5 dark:bg-oroYellow/5 dark:group-hover:bg-oroYellow/10`}></div>
                            <div className="absolute top-6 md:top-8 left-6 md:left-10 right-6 md:right-10 flex items-center justify-between z-20">
                               <span className={`${stage.textColor} font-black text-[10px] md:text-[11px] xl:text-[12px] tracking-[0.4em] md:tracking-normal xl:tracking-[0.2em] uppercase group-hover:text-zinc-900 dark:group-hover:text-oroYellow transition-colors`}>{stage.label}</span>
                               <div className={`px-2 md:px-3 xl:px-5 h-10 md:h-11 xl:h-12 bg-zinc-50 dark:bg-zinc-800 border-[2px] md:border-[3px] border-oroYellow rounded-[18px] md:rounded-[22px] flex items-center justify-center font-black text-black dark:text-oroYellow text-[10px] md:text-xs xl:text-sm group-hover:bg-zinc-900 group-hover:text-oroYellow group-hover:border-zinc-900 transition-all`}>Day {item.day}</div>
                            </div>
                            <div className="relative z-10 w-full flex flex-col items-center h-full">
                              <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[120px] md:min-h-[160px]">
                                <h4 className="font-black text-zinc-900 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-white text-xl md:text-3xl mb-6 md:mb-8 text-center leading-tight transition-colors">"{item.hook}"</h4>
                                <p className="text-sm md:text-lg font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-400 mb-8 md:mb-10 text-center leading-relaxed italic opacity-90 transition-colors">{item.value}</p>
                              </div>
                              <div className="w-full pt-6 md:pt-10 border-t border-zinc-200 dark:border-zinc-700 group-hover:border-zinc-900/20 dark:group-hover:border-zinc-600 flex flex-col items-center mb-8 md:mb-10 mt-auto transition-colors">
                               <div className="px-4 py-1.5 rounded-full border border-zinc-200 dark:border-oroYellow/30 bg-zinc-50 dark:bg-zinc-800/50 mb-4 group-hover:border-zinc-900/30 dark:group-hover:border-oroYellow/50 transition-colors">
                                 <p className={`text-[8px] md:text-[9px] font-black text-zinc-900 dark:text-oroYellow group-hover:text-zinc-900 dark:group-hover:text-oroYellow uppercase tracking-widest transition-colors`}>Strategic CTA</p>
                               </div>
                               <div className="min-h-[4rem] flex items-center justify-center w-full">
                                 <span className={`text-zinc-900 dark:text-white group-hover:text-zinc-900 dark:group-hover:text-white font-black text-base md:text-xl tracking-tight leading-tight text-center px-4 transition-colors block`}>
                                   {(() => {
                                     const words = item.cta.split(' ');
                                     if (words.length <= 1) return item.cta;
                                     const mid = Math.ceil(words.length / 2);
                                     return (
                                       <>
                                         {words.slice(0, mid).join(' ')}
                                         <br />
                                         {words.slice(mid).join(' ')}
                                       </>
                                     );
                                   })()}
                                 </span>
                               </div>
                              </div>
                              {/* Director Mode Shot List */}
                              {item.shotList && item.shotList.length > 0 && (
                                <div className="w-full p-6 bg-zinc-100 dark:bg-zinc-800/50 rounded-[32px] border border-zinc-200 dark:border-zinc-700 mt-6">
                                   <p className={`text-[10px] font-black text-zinc-600 dark:text-oroYellow uppercase tracking-[0.2em] mb-4 text-center`}>Director Directive</p>
                                   <ul className="space-y-3">
                                      {item.shotList.map((shot, idx) => (
                                        <div key={idx} className="group/shot relative flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 h-20 cursor-help shadow-sm transition-all hover:border-oroYellow/30">
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-4 bg-zinc-900 text-white text-[11px] rounded-[20px] opacity-0 invisible group-hover/shot:opacity-100 group-hover/shot:visible transition-all z-[100] pointer-events-none shadow-2xl border border-white/10 leading-relaxed font-bold italic">
                                            "{shot.instruction}"
                                          </div>
                                          <div className={`w-2.5 h-2.5 rounded-full bg-oroYellow shrink-0`}></div>
                                          <li className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 italic flex-1 leading-snug">{shot.title}</li>
                                        </div>
                                      ))}
                                   </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Visual separator with tooltip */}
                          {!isLast && (
                            <div className="absolute -bottom-16 md:-bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
                              <div className="w-0.5 h-16 md:h-20 border-l-2 border-dotted border-zinc-200 dark:border-zinc-800"></div>
                              <div className="group/info relative">
                                <div className={`w-9 h-9 rounded-full bg-zinc-800 border-2 border-oroYellow shadow-lg flex items-center justify-center cursor-help animate-pulse transition-transform hover:scale-125`}>
                                  <span className={`text-base font-black text-oroYellow`}>i</span>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-6 bg-zinc-900 text-white rounded-[24px] shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 z-50 border border-white/10">
                                  <p className="text-[9px] font-black text-oroYellow uppercase tracking-widest mb-2">Proceed Criteria</p>
                                  <p className="text-xs font-bold leading-relaxed italic opacity-90">"{item.moveForwardCriteria}"</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Secondary Refinement Area (Reprompt) */}
                  <div className="w-full max-w-4xl mx-auto mb-12">
                    <div className="text-center mb-8">
                      <h4 className="text-3xl font-black uppercase tracking-tight dark:text-white">Refine Strategy</h4>
                      <p className="text-sm font-bold text-zinc-600 dark:text-zinc-500 italic mt-2">Adjust your trajectory with a specific instruction.</p>
                    </div>
                    <div className="relative rounded-[44px] md:rounded-[56px] p-8 md:p-10 border border-zinc-100 dark:border-oroYellow/20 bg-white dark:bg-zinc-900 shadow-heavy">
                       <textarea 
                          value={prompt} 
                          onChange={(e) => setPrompt(e.target.value)} 
                          placeholder="Example: Make the hooks more aggressive, or add a day about user results..." 
                          className="w-full bg-transparent border-none outline-none ring-0 placeholder-zinc-300 dark:placeholder-zinc-600 resize-none font-bold text-2xl h-64 md:h-32 text-zinc-900 dark:text-white" 
                        />
                       <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="relative group/director-btn w-full md:w-auto">
                            <button 
                                onClick={() => setIsDirectorMode(!isDirectorMode)}
                                className={`flex items-center justify-center gap-2 w-full px-12 h-14 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${isDirectorMode ? 'bg-oroYellow text-black shadow-lg' : 'bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white border-2 border-zinc-900 dark:border-zinc-700 hover:bg-oroYellow hover:text-black dark:hover:bg-oroYellow dark:hover:text-black hover:border-oroYellow'}`}
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 18v3" />
                                  <path d="M9 21h6" />
                                  <path d="M12 13v2" />
                                  <circle cx="12" cy="15" r="3" />
                                  <rect x="8" y="5" width="8" height="6" rx="1" />
                                  <path d="M16 8l3-1.5v3L16 8" />
                                </svg>
                                <span>Director Mode</span>
                                <div className="relative group/info-trigger ml-1">
                                  <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px] font-black cursor-help hover:bg-current hover:text-white transition-all">i</div>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-black text-white text-[10px] font-bold rounded-2xl opacity-0 invisible group-hover/info-trigger:opacity-100 group-hover/info-trigger:visible transition-all duration-300 z-[100] shadow-2xl border border-white/10 text-center leading-relaxed">
                                    Let the Thunderstorm Begin - allow us to show you how to shoot your content
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-black"></div>
                                  </div>
                                </div>
                            </button>
                          </div>

                          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <button 
                              onClick={() => handleGenerate(false)} 
                              className={`relative w-full md:w-auto h-14 px-12 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 overflow-hidden ${(loading && loadingSource === 'new') ? 'bg-oroYellow text-zinc-900' : 'bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white border-2 border-zinc-900 dark:border-zinc-700 hover:bg-oroYellow hover:text-black dark:hover:bg-oroYellow dark:hover:text-black hover:border-oroYellow'}`}
                            >
                              {(loading && loadingSource === 'new') && (
                                <div className="absolute inset-0 pointer-events-none">
                                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                    <rect 
                                      x="0" y="0" width="100%" height="100%" 
                                      rx="28" ry="28"
                                      fill="none" 
                                      stroke="currentColor" 
                                      strokeWidth="3" 
                                      strokeDasharray="4, 12" 
                                      className="animate-dots-rotate opacity-20"
                                    />
                                  </svg>
                                </div>
                              )}
                              {(loading && loadingSource === 'new') ? (
                                <>
                                  <div className="relative w-5 h-5 flex flex-col items-center">
                                    <svg className="w-5 h-3 text-zinc-900 mb-[-3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 13a4 4 0 0 1 0 8H7a5 5 0 0 1 0-10 5 5 0 0 1 8 2z" />
                                    </svg>
                                    <div className="flex gap-1">
                                      <div className="w-0.5 h-1 bg-zinc-900 rain-drop"></div>
                                      <div className="w-0.5 h-1 bg-zinc-900 rain-drop"></div>
                                      <div className="w-0.5 h-1 bg-zinc-900 rain-drop"></div>
                                    </div>
                                  </div>
                                  <span className="relative z-10">Starting Fresh...</span>
                                </>
                              ) : "Drop Idea"}
                            </button>

                            <button 
                              onClick={() => handleGenerate(true)} 
                              className={`relative w-full md:w-auto h-14 px-12 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 overflow-hidden ${(loading && loadingSource === 'update') ? 'bg-oroYellow text-zinc-900' : 'bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white border-2 border-zinc-900 dark:border-zinc-700 hover:bg-oroYellow hover:text-black dark:hover:bg-oroYellow dark:hover:text-black hover:border-oroYellow'}`}
                            >
                              {(loading && loadingSource === 'update') && (
                                <div className="absolute inset-0 pointer-events-none">
                                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                    <rect 
                                      x="0" y="0" width="100%" height="100%" 
                                      rx="28" ry="28"
                                      fill="none" 
                                      stroke="black" 
                                      strokeWidth="3" 
                                      strokeDasharray="4, 12" 
                                      className="animate-dots-rotate"
                                      opacity="0.4"
                                    />
                                  </svg>
                                </div>
                              )}
                              {(loading && loadingSource === 'update') ? (
                                <>
                                  <div className="relative w-5 h-5 flex flex-col items-center">
                                    <svg className="w-5 h-3 text-zinc-900 mb-[-3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 13a4 4 0 0 1 0 8H7a5 5 0 0 1 0-10 5 5 0 0 1 8 2z" />
                                    </svg>
                                    <div className="flex gap-1">
                                      <div className="w-0.5 h-1 bg-zinc-900 rain-drop"></div>
                                      <div className="w-0.5 h-1 bg-zinc-900 rain-drop"></div>
                                      <div className="w-0.5 h-1 bg-zinc-900 rain-drop"></div>
                                    </div>
                                  </div>
                                  <span className="relative z-10">Re-Synthesizing...</span>
                                </>
                              ) : "Update Idea"}
                            </button>
                          </div>
                       </div>
                    </div>
                 </div>
                </div>
              )}
            </div>
          )}
          {/* History Tab: List of Saved Protocols */}
          {activeTab === 'history' && (
            <div className="max-w-7xl mx-auto w-full px-4 md:px-12 pb-20 pt-24 md:pt-32">
               <div className="w-full flex items-center justify-center mb-12">
                 <h2 className="text-center text-2xl md:text-4xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">Archive</h2>
               </div>
               {history.length === 0 ? (
                 <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[44px] border border-zinc-100 dark:border-oroYellow/20 shadow-premium">
                    <p className="text-zinc-400 dark:text-zinc-500 font-bold italic">No stored protocols in the neural vault.</p>
                 </div>
               ) : history.map((item, idx) => (
                 <div key={idx} className="relative bg-white dark:bg-zinc-900 p-6 md:p-8 lg:p-10 rounded-[32px] md:rounded-[44px] border border-zinc-100 dark:border-oroYellow/20 shadow-premium flex flex-col lg:flex-row items-center justify-between mb-6 gap-4 lg:gap-6 transition-all hover:scale-[1.01]">
                    {/* Permanent deletion from local storage - Positioned top-right on mobile portrait */}
                    <button 
                      onClick={() => {
                        setHistory(prev => {
                          const updated = prev.filter((_, i) => i !== idx);
                          localStorage.setItem(historyStorageKey, JSON.stringify(updated));
                          return updated;
                        });
                      }}
                      className="absolute top-6 right-6 lg:static p-2 md:p-4 rounded-2xl border border-zinc-100 dark:border-darkBorder text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-colors shrink-0 z-20"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <div className="text-center lg:text-left flex-1 min-w-0 px-10 lg:px-0">
                      <h4 className="text-base md:text-2xl font-black uppercase text-zinc-900 dark:text-white mb-1 break-words">{item.result.brandName}</h4>
                      <p className="text-[9px] md:text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest break-words">{item.result.audience}</p>
                   </div>
                   <div className="grid grid-cols-2 lg:flex items-center justify-center gap-2 lg:gap-4 w-full lg:w-auto shrink-0">
                    {/* Mode badge status */}
                    <div className="flex items-center justify-center px-2 py-3 lg:py-4 rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border shadow-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-darkBorder">
                      {item.isDirectorMode ? 'Director Mode' : 'Standard Mode'}
                    </div>
                    
                    {/* Load historical data back into active workspace */}
                    <button onClick={() => { setResult(item.result); setIsDirectorMode(item.isDirectorMode); setActiveTab('workspace'); }} className="flex items-center justify-center px-2 py-3 lg:py-4 bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-oroYellow hover:text-black dark:hover:bg-oroYellow dark:hover:text-black shadow-xl transition-all whitespace-nowrap">Recall Strategy</button>
                    


                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </main>

      {/* Menu Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-6 left-6 z-[600] p-3 bg-zinc-900 dark:bg-darkCard border border-zinc-900 dark:border-darkBorder rounded-xl shadow-lg text-white dark:text-white transition-all active:scale-95 hover:bg-oroYellow hover:text-black dark:hover:bg-oroYellow dark:hover:text-black hover:border-oroYellow"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isSidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    </div>
  );
}

export default DashboardView;