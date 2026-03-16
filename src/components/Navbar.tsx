/**
 * NAVIGATION BAR
 * Responsive floating header with branding and primary landing page actions.
 */

import React from 'react';

interface NavbarProps {
  onActionClick: () => void;      // Logic to trigger auth or dashboard entry
  onSettingsClick?: () => void;   // Logic to deep-link to settings
}

const Navbar: React.FC<NavbarProps> = ({ onActionClick, onSettingsClick }) => {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] max-w-6xl z-50 bg-white/60 dark:bg-darkCard/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/40 dark:border-darkBorder/40 px-4 md:px-8 py-3 flex items-center justify-between transition-colors">
      
      {/* Brand Identity */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="w-8 h-8 md:w-9 md:h-9 bg-oroYellow rounded-lg md:rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
            <path d="m13 11-4 6h6l-4 6" />
          </svg>
        </div>
        <span className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">OroDrop</span>
      </div>
      
      {/* Primary Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Settings Shortcut Button */}
        <button 
          onClick={onSettingsClick}
          className="p-2 md:p-2.5 rounded-lg md:rounded-xl text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-100 dark:border-darkBorder transition-all active:scale-90"
          title="Settings"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        
        {/* Main CTA: Entry into Dashboard */}
        <button 
          onClick={onActionClick}
          className="px-3 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-zinc-900 dark:bg-oroYellow text-white dark:text-black text-[10px] md:text-xs font-black uppercase tracking-wider md:tracking-widest hover:bg-oroYellow hover:text-zinc-900 transition-all shadow-xl shadow-zinc-200 dark:shadow-none active:scale-95 whitespace-nowrap"
        >
          Launch Dashboard
        </button>
      </div>
    </nav>
  );
};

export default Navbar;