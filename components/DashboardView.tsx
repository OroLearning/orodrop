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

/**
 * Helper to explain technical cinematic terms in tooltips.
 */
const getShotExplanation = (shot: string): string => {
  const s = shot.toLowerCase();
  if (s.includes('pan')) return "Perform a smooth horizontal rotation to reveal context and environment around the subject.";
  if (s.includes('track') || s.includes('gimbal') || s.includes('follow')) return "Physically move with the subject to create a dynamic, professional cinematic perspective.";
  if (s.includes('bokeh') || s.includes('blur') || s.includes('depth')) return "Use shallow depth of field to isolate the product from a beautifully soft background.";
  if (s.includes('zoom') || s.includes('push')) return "Narrow the frame focus through lens adjustment to highlight premium textures or features.";
  if (s.includes('angle')) return "Adjust vertical perspective to frame the subject with more authority or intimacy.";
  return "Utilize steady, intentional movements and clean framing to emphasize the premium nature of the brand.";
};

type SettingsView = 'main' | 'profile' | 'report';

export default function DashboardView({ 
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

  // Reporting System State
  const [reportText, setReportText] = useState('');
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [reportStatus, setReportStatus] = useState('');

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
  const [isSidebarPinned, setIsSidebarPinned] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    setIsMobileMenuOpen(false);
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
    if (!prompt.trim()) return;
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

  /**
   * Simulates a signal report transmission.
   */
  const handleSendReport = () => {
    if (!reportText.trim()) return;
    setReportStatus('Transmitting signal...');
    setTimeout(() => {
      setReportStatus('Report successfully logged in the vault.');
      setReportText('');
      setReportFiles([]);
      setTimeout(() => setReportStatus(''), 3000);
    }, 1500);
  };

  // Sidebar Interaction Logic
  const handleSidebarEnter = () => {
    if (window.innerWidth < 1024) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsSidebarHovered(true);
  };

  const handleSidebarLeave = () => {
    if (window.innerWidth < 1024) return;
    if (isSidebarPinned) return;
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(false);
    }, 2000);
  };

  const isSidebarVisible = isSidebarPinned || isSidebarHovered || isMobileMenuOpen;

  return (
    <div className={`w-screen h-screen flex font-sans bg-transparent text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-0`}>
      
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-6 left-6 z-[150] p-3 bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder rounded-xl shadow-lg text-slate-900 dark:text-white"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Invisible Hover Trigger Area */}
      <div className="hidden lg:block fixed top-0 left-0 w-4 h-full z-[100]" onMouseEnter={handleSidebarEnter} />

      {/* Sidebar Component */}
      <aside 
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
        className={`fixed top-0 left-0 h-full z-[110] flex flex-col bg-white dark:bg-darkCard border-r border-slate-100 dark:border-darkBorder shadow-heavy transition-all duration-500 ease-in-out transform ${isSidebarVisible ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}`}
      >
        <div className="p-10 pb-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
            <div className="w-10 h-10 bg-oroYellow rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
                <path d="m13 11-4 6h6l-4 6" />
              </svg>
            </div>
            <span className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Oro <span className="text-oroYellow">Drop</span></span>
          </div>
          <button 
            onClick={() => setIsSidebarPinned(!isSidebarPinned)}
            className={`hidden lg:block p-2.5 rounded-xl transition-all duration-300 ${isSidebarPinned ? 'text-oroYellow bg-oroYellow/20' : 'text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <svg className={`w-5 h-5 transform transition-transform ${isSidebarPinned ? 'rotate-0' : '-rotate-45'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 9v-4h1c.55 0 1-.45 1-1s-.45-1-1-1h-10c-.55 0-1 .45-1 1s.45 1 1 1h1v4c-1.66 0-3 1.34-3 3v2h7v7l1 1 1-1v-7h7v-2c0-1.66-1.34-3-3-3z"/>
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-8 space-y-4">
          <button onClick={() => navigateToTab('workspace')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === 'workspace' && !showSettings ? 'bg-slate-900 dark:bg-oroYellow text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Workspace
          </button>
          <button onClick={() => navigateToTab('history')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${activeTab === 'history' && !showSettings ? 'bg-slate-900 dark:bg-oroYellow text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Archive
          </button>
        </nav>

        <div className="p-8 border-t border-slate-50 dark:border-darkBorder">
           <button onClick={() => { setShowSettings(true); setSettingsView('main'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${showSettings ? 'bg-slate-900 dark:bg-oroYellow text-white dark:text-slate-900 shadow-xl' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Settings
           </button>
        </div>
      </aside>

      {/* Settings Overlay View */}
      {showSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-slate-900/20 dark:bg-black/60 backdrop-blur-md animate-fade-in" onClick={handleCloseSettings}>
          <div className="w-full max-w-2xl bg-white dark:bg-darkCard rounded-[32px] md:rounded-[48px] p-8 md:p-12 shadow-heavy border border-slate-100 dark:border-darkBorder animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 md:mb-12">
               <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight dark:text-white">
                 {settingsView === 'main' ? 'Neural Hub Settings' : settingsView === 'profile' ? 'Protocol Identity' : 'Signal Support'}
               </h2>
               <button onClick={handleCloseSettings} className="w-10 h-10 border border-slate-100 dark:border-darkBorder rounded-full flex items-center justify-center text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                 {settingsView === 'main' ? '✕' : '←'}
               </button>
            </div>
            
            <div className="space-y-6">
               {/* Main Settings Menu */}
               {settingsView === 'main' && (
                 <>
                   <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[36px] border border-slate-100 dark:border-darkBorder flex items-center justify-between">
                      <div>
                         <h4 className="text-xl font-black uppercase text-slate-900 dark:text-white">Interface Modality</h4>
                         <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Adjust visual environment</p>
                      </div>
                      <button onClick={() => setDarkMode(!darkMode)} className="relative w-24 h-12 bg-white dark:bg-slate-800 rounded-full p-1.5 transition-all duration-300 overflow-hidden border border-slate-200 dark:border-darkBorder shadow-inner group">
                         <div className={`absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 transform ${darkMode ? 'translate-x-12 bg-oroYellow' : 'translate-x-0 bg-white'}`}>
                            {darkMode ? <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z"/></svg> : <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM2 13h2a1 1 0 1 0 0-2H2a1 1 0 1 0 0 2zm18 0h2a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2zM11 2v2a1 1 0 1 0 2 0V2a1 1 0 1 0-2 0zm0 18v2a1 1 0 1 0 2 0v-2a1 1 0 1 0-2 0z"/></svg>}
                         </div>
                      </button>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[36px] border border-slate-100 dark:border-darkBorder overflow-hidden">
                      <div onClick={() => setSettingsView('profile')} className="p-6 border-b border-slate-100 dark:border-darkBorder hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-black uppercase text-slate-900 dark:text-white">Profile</h4>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Pilot Identification</p>
                        </div>
                        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                      </div>
                      <div onClick={onLogout} className="p-6 border-b border-slate-100 dark:border-darkBorder hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-black uppercase text-slate-900 dark:text-white">Logout</h4>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Terminate Connection</p>
                        </div>
                        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                      </div>
                      <div onClick={() => setSettingsView('report')} className="p-6 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-black uppercase text-slate-900 dark:text-white">Report Issue</h4>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">Signal Command</p>
                        </div>
                        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4" /></svg>
                      </div>
                   </div>
                 </>
               )}

               {/* Profile Identity Sub-view */}
               {settingsView === 'profile' && (
                 <div className="animate-fade-in-up">
                   <div className="flex items-center gap-6 mb-10 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[32px] border border-slate-100 dark:border-darkBorder">
                     <div className="w-20 h-20 rounded-full bg-oroYellow flex items-center justify-center text-3xl font-black text-slate-900 shadow-xl">
                       {userName.charAt(0)}
                     </div>
                     <div>
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{userName}</h3>
                       <p className="text-sm font-bold text-slate-400 lowercase">{userEmail}</p>
                     </div>
                   </div>
                   
                   <form onSubmit={handleProfileUpdate} className="space-y-4">
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-4 mb-2">Update Credentials</h4>
                     {profileMsg.text && (
                       <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${profileMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                         {profileMsg.text}
                       </div>
                     )}
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Display Name</label>
                        <input type="text" placeholder="Display Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-darkBorder rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-oroYellow transition-all shadow-inner" required />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Current Access Key</label>
                        <input type="password" placeholder="Current Access Key" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-darkBorder rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-oroYellow transition-all shadow-inner" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">New Access Key</label>
                        <input type="password" placeholder="New Access Key" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-darkBorder rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-oroYellow transition-all shadow-inner" />
                     </div>
                     <button type="submit" className="w-full h-14 bg-slate-900 dark:bg-oroYellow text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-4">Commit Profile Update</button>
                   </form>
                 </div>
               )}

               {/* Issue Reporting Sub-view */}
               {settingsView === 'report' && (
                 <div className="animate-fade-in-up space-y-6">
                    <p className="text-sm font-bold text-slate-400 leading-relaxed italic">Experiencing static in the engine? Describe your obstacle and attach evidence if available.</p>
                    
                    <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Neural feedback or system error details..." className="w-full h-40 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-darkBorder rounded-[32px] p-6 text-sm font-bold focus:outline-none focus:border-oroYellow transition-all shadow-inner resize-none" />
                    
                    <div className="flex flex-wrap gap-4">
                      {reportFiles.map((file, i) => (
                        <div key={i} className="px-4 py-2 bg-oroYellow/20 text-oroYellow rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           {file.name}
                           <button onClick={() => setReportFiles(reportFiles.filter((_, idx) => idx !== i))}>✕</button>
                        </div>
                      ))}
                      <label className="cursor-pointer px-6 py-4 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-100 dark:border-darkBorder rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                        + Attach Evidence
                        <input type="file" multiple className="hidden" onChange={(e) => setReportFiles([...reportFiles, ...Array.from(e.target.files || [])])} />
                      </label>
                    </div>

                    {reportStatus && <p className="text-[10px] font-black uppercase tracking-widest text-oroYellow animate-pulse">{reportStatus}</p>}

                    <button onClick={handleSendReport} className="w-full h-16 bg-slate-900 dark:bg-oroYellow text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Transmit Report</button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Primary Workspace Scroll Area */}
      <main 
        ref={scrollContainerRef} 
        className={`flex-1 flex flex-col overflow-y-auto relative custom-scrollbar transition-all duration-500 bg-transparent ${isSidebarPinned ? 'lg:ml-64' : 'ml-0'}`}
      >
        <div className="p-6 md:p-12 flex flex-col gap-10 h-full relative z-10">
          {activeTab === 'workspace' && (
            <div className={`flex flex-col items-center flex-1 w-full max-w-7xl mx-auto ${result ? 'pt-4' : 'justify-center'}`}>
              
              {/* Empty Workspace: Generator Prompt */}
              {!result ? (
                 <div className="w-full max-w-4xl text-center">
                    <h1 className="text-5xl md:text-7xl font-black uppercase mb-12 tracking-tight dark:text-white">Strategy Synthesis</h1>
                    <div className="relative rounded-[44px] md:rounded-[56px] p-8 md:p-10 border border-slate-100 dark:border-darkBorder bg-white dark:bg-darkCard shadow-heavy">
                       <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your product launch..." className="w-full bg-transparent border-none outline-none ring-0 placeholder-slate-300 dark:placeholder-slate-600 resize-none font-bold text-2xl md:text-3xl h-48 text-slate-900 dark:text-white" />
                       <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="relative group/director-btn flex-1 md:flex-none">
                            <button 
                                onClick={() => setIsDirectorMode(!isDirectorMode)}
                                className={`flex items-center justify-center gap-2 w-full px-6 h-14 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${isDirectorMode ? 'bg-oroYellow text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-darkBorder'}`}
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
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-slate-900 text-white text-[10px] font-bold rounded-2xl opacity-0 invisible group-hover/info-trigger:opacity-100 group-hover/info-trigger:visible transition-all duration-300 z-[100] shadow-2xl border border-white/10 text-center leading-relaxed">
                                    Let the Thunderstorm Begin - allow us to show you how to shoot your content
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                                  </div>
                                </div>
                            </button>
                          </div>
                          <button 
                            onClick={() => handleGenerate(false)} 
                            disabled={loading} 
                            className={`relative w-full md:w-auto h-14 px-12 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all overflow-hidden ${loading ? 'bg-oroYellow text-slate-900' : 'bg-slate-900 dark:bg-oroYellow text-white dark:text-slate-900 hover:bg-oroYellow hover:text-slate-900'}`}
                          >
                            {loading && (
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
                                    opacity="0.8"
                                  />
                                </svg>
                              </div>
                            )}
                            {loading ? (
                              <>
                                <div className="relative w-5 h-5 flex flex-col items-center">
                                  <svg className="w-5 h-3 text-slate-900 mb-[-3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 13a4 4 0 0 1 0 8H7a5 5 0 0 1 0-10 5 5 0 0 1 8 2z" />
                                  </svg>
                                  <div className="flex gap-1">
                                    <div className="w-0.5 h-1 bg-slate-900 rain-drop"></div>
                                    <div className="w-0.5 h-1 bg-slate-900 rain-drop"></div>
                                    <div className="w-0.5 h-1 bg-slate-900 rain-drop"></div>
                                  </div>
                                </div>
                                <span className="relative z-10">Synthesizing...</span>
                              </>
                            ) : "Begin Protocol"}
                          </button>
                       </div>
                    </div>
                 </div>
              ) : (
                /* Full Workspace: Render Results */
                <div className="w-full pb-20 animate-fade-in flex flex-col">
                  <div className="text-center mb-24 px-4">
                    <h3 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tight leading-none dark:text-white">{result.productName}</h3>
                    <p className="text-lg md:text-xl font-bold text-slate-400 dark:text-slate-500 italic">"{result.audience}"</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-20 md:gap-y-32 gap-x-6 md:gap-x-12 px-2 items-stretch mb-32">
                    {result.sequence.map((item, index) => {
                      const stage = getStageStyles(item.day);
                      const isLast = index === result.sequence.length - 1;
                      return (
                        <div key={item.day} className="relative flex">
                          <div className={`group relative w-full rounded-[32px] md:rounded-[56px] p-6 md:p-10 pt-24 md:pt-32 bg-white dark:bg-darkCard border-2 transition-all duration-700 flex flex-col items-center overflow-visible hover:shadow-heavy ${stage.border} h-full`}>
                            <div className={`absolute inset-0 transition-opacity duration-700 rounded-[32px] md:rounded-[56px] ${stage.tint} ${stage.hoverTint}`}></div>
                            <div className="absolute top-6 md:top-8 left-6 md:left-10 right-6 md:right-10 flex items-center justify-between z-20">
                               <span className={`${stage.textColor} font-black text-[8px] md:text-[10px] tracking-[0.4em] uppercase`}>{stage.label}</span>
                               <div className={`px-3 md:px-5 h-10 md:h-12 bg-white dark:bg-slate-800 border-[2px] md:border-[3px] ${stage.borderColor} rounded-[18px] md:rounded-[22px] flex items-center justify-center font-black ${stage.textColor} text-xs md:text-sm`}>Day {item.day}</div>
                            </div>
                            <div className="relative z-10 w-full flex flex-col items-center h-full">
                              <h4 className="font-black text-slate-900 dark:text-white text-xl md:text-3xl mb-6 md:mb-8 text-center leading-tight">"{item.hook}"</h4>
                              <p className="text-sm md:text-lg font-medium text-slate-500 dark:text-slate-400 mb-8 md:mb-10 text-center leading-relaxed italic opacity-90">{item.value}</p>
                              <div className="w-full pt-6 md:pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center mb-8 md:mb-10 mt-auto">
                               <p className={`text-[8px] md:text-[9px] font-black ${stage.textColor} opacity-60 uppercase tracking-widest mb-3 md:mb-4`}>Strategic CTA</p>
                               <span className={`${stage.textColor} font-black text-base md:text-xl tracking-tight leading-tight text-center px-4`}>{item.cta}</span>
                              </div>
                              {/* Director Mode Shot List */}
                              {item.shotList && item.shotList.length > 0 && (
                                <div className="w-full p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-darkBorder mt-6">
                                   <p className={`text-[10px] font-black ${stage.textColor} uppercase tracking-[0.2em] mb-4 text-center`}>Director Directive</p>
                                   <ul className="space-y-3">
                                      {item.shotList.map((shot, idx) => (
                                        <div key={idx} className="group/shot relative flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-50 dark:border-slate-700 h-20 cursor-help shadow-sm transition-all hover:border-slate-300">
                                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-4 bg-slate-900 text-white text-[11px] rounded-[20px] opacity-0 invisible group-hover/shot:opacity-100 group-hover/shot:visible transition-all z-[100] pointer-events-none shadow-2xl border border-white/10 leading-relaxed font-bold italic">
                                            "{getShotExplanation(shot)}"
                                          </div>
                                          <div className={`w-2.5 h-2.5 rounded-full ${stage.textColor.replace('text', 'bg')} shrink-0`}></div>
                                          <li className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic flex-1 leading-snug">{shot}</li>
                                        </div>
                                      ))}
                                   </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Visual separator with tooltip */}
                          {!isLast && (
                            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
                              <div className="w-0.5 h-20 border-l-2 border-dotted border-slate-200 dark:border-slate-800"></div>
                              <div className="group/info relative">
                                <div className={`w-9 h-9 rounded-full bg-white dark:bg-slate-800 border-2 ${stage.borderColor} shadow-lg flex items-center justify-center cursor-help animate-pulse transition-transform hover:scale-125`}>
                                  <span className={`text-base font-black ${stage.textColor}`}>i</span>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-6 bg-slate-900 text-white rounded-[24px] shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 z-50 border border-white/10">
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
                      <p className="text-sm font-bold text-slate-400 dark:text-slate-500 italic mt-2">Adjust your trajectory with a specific instruction.</p>
                    </div>
                    <div className="relative rounded-[44px] md:rounded-[56px] p-8 md:p-10 border border-slate-100 dark:border-darkBorder bg-white dark:bg-darkCard shadow-heavy">
                       <textarea 
                          value={prompt} 
                          onChange={(e) => setPrompt(e.target.value)} 
                          placeholder="Example: Make the hooks more aggressive, or add a day about user results..." 
                          className="w-full bg-transparent border-none outline-none ring-0 placeholder-slate-300 dark:placeholder-slate-600 resize-none font-bold text-2xl h-32 text-slate-900 dark:text-white" 
                        />
                       <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="relative group/director-btn flex-1 md:flex-none">
                            <button 
                                onClick={() => setIsDirectorMode(!isDirectorMode)}
                                className={`flex items-center justify-center gap-2 w-full px-6 h-14 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${isDirectorMode ? 'bg-oroYellow text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-darkBorder'}`}
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
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-slate-900 text-white text-[10px] font-bold rounded-2xl opacity-0 invisible group-hover/info-trigger:opacity-100 group-hover/info-trigger:visible transition-all duration-300 z-[100] shadow-2xl border border-white/10 text-center leading-relaxed">
                                    Let the Thunderstorm Begin - allow us to show you how to shoot your content
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900"></div>
                                  </div>
                                </div>
                            </button>
                          </div>

                          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <button 
                              onClick={() => handleGenerate(false)} 
                              disabled={loading} 
                              className={`relative w-full md:w-auto h-14 px-12 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full font-black text-[10px] uppercase tracking-widest border-2 border-slate-100 dark:border-darkBorder shadow-xl flex items-center justify-center gap-3 transition-all overflow-hidden ${loading ? 'opacity-50' : ''}`}
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
                                    <svg className="w-5 h-3 text-slate-400 mb-[-3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 13a4 4 0 0 1 0 8H7a5 5 0 0 1 0-10 5 5 0 0 1 8 2z" />
                                    </svg>
                                    <div className="flex gap-1">
                                      <div className="w-0.5 h-1 bg-slate-400 rain-drop"></div>
                                      <div className="w-0.5 h-1 bg-slate-400 rain-drop"></div>
                                      <div className="w-0.5 h-1 bg-slate-400 rain-drop"></div>
                                    </div>
                                  </div>
                                  <span className="relative z-10">Starting Fresh...</span>
                                </>
                              ) : "New Idea"}
                            </button>

                            <button 
                              onClick={() => handleGenerate(true)} 
                              disabled={loading} 
                              className={`relative w-full md:w-auto h-14 px-12 bg-slate-900 dark:bg-oroYellow text-white dark:text-slate-900 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-oroYellow hover:text-slate-900 shadow-xl flex items-center justify-center gap-3 transition-all overflow-hidden ${(loading && loadingSource === 'update') ? 'bg-oroYellow' : ''}`}
                            >
                              {(loading && loadingSource === 'update') && (
                                <div className="absolute inset-0 pointer-events-none">
                                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                    <rect 
                                      x="0" y="0" width="100%" height="100%" 
                                      rx="28" ry="28"
                                      fill="none" 
                                      stroke="white" 
                                      strokeWidth="3" 
                                      strokeDasharray="4, 12" 
                                      className="animate-dots-rotate"
                                      opacity="0.8"
                                    />
                                  </svg>
                                </div>
                              )}
                              {(loading && loadingSource === 'update') ? (
                                <>
                                  <div className="relative w-5 h-5 flex flex-col items-center">
                                    <svg className="w-5 h-3 text-white mb-[-3px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 13a4 4 0 0 1 0 8H7a5 5 0 0 1 0-10 5 5 0 0 1 8 2z" />
                                    </svg>
                                    <div className="flex gap-1">
                                      <div className="w-0.5 h-1 bg-white rain-drop"></div>
                                      <div className="w-0.5 h-1 bg-white rain-drop"></div>
                                      <div className="w-0.5 h-1 bg-white rain-drop"></div>
                                    </div>
                                  </div>
                                  <span className="relative z-10">Re-Synthesizing...</span>
                                </>
                              ) : "Update Protocol"}
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
            <div className="max-w-7xl mx-auto w-full px-4 md:px-12 pb-20">
               <div className="flex items-center justify-between mb-12">
                 <h2 className="text-4xl font-black uppercase tracking-tight dark:text-white">Archive</h2>
               </div>
               {history.length === 0 ? (
                 <div className="text-center py-20 bg-white dark:bg-darkCard rounded-[44px] border border-slate-100 dark:border-darkBorder shadow-premium">
                    <p className="text-slate-400 font-bold italic">No stored protocols in the neural vault.</p>
                 </div>
               ) : history.map((item, idx) => (
                 <div key={idx} className="bg-white dark:bg-darkCard p-6 md:p-8 lg:p-10 rounded-[32px] md:rounded-[44px] border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col md:flex-row items-center justify-between mb-6 gap-4 md:gap-6 transition-all hover:scale-[1.01]">
                   <div className="text-center md:text-left flex-1 min-w-0">
                      <h4 className="text-xl md:text-2xl font-black uppercase text-slate-900 dark:text-white mb-1 truncate">{item.result.productName}</h4>
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{item.result.audience}</p>
                   </div>
                   <div className="flex items-center gap-2 md:gap-3 lg:gap-4 w-full md:w-auto shrink-0">
                    {/* Mode badge status */}
                    <div className={`px-2 md:px-3 py-2 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] border shadow-sm shrink-0 ${item.isDirectorMode ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-darkBorder text-slate-700'}`}>
                      {item.isDirectorMode ? 'Director Mode' : 'Standard Mode'}
                    </div>
                    
                    {/* Load historical data back into active workspace */}
                    <button onClick={() => { setResult(item.result); setIsDirectorMode(item.isDirectorMode); setActiveTab('workspace'); }} className="flex-1 md:flex-none px-6 md:px-8 lg:px-10 py-3 md:py-4 bg-slate-900 dark:bg-oroYellow text-white dark:text-slate-900 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-oroYellow hover:text-slate-900 shadow-xl transition-all whitespace-nowrap">Recall Strategy</button>

                    {/* Permanent deletion from local storage */}
                    <button 
                      onClick={() => {
                        setHistory(prev => {
                          const updated = prev.filter((_, i) => i !== idx);
                          localStorage.setItem(historyStorageKey, JSON.stringify(updated));
                          return updated;
                        });
                      }}
                      className="p-3 md:p-4 rounded-2xl border border-slate-100 dark:border-darkBorder text-slate-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}