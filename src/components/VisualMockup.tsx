/**
 * VISUAL MOCKUP COMPONENT
 * The interactive centerpiece of the landing page. Simulates the actual AI 
 * generation interface to provide user feedback before login.
 */

import React, { useState } from 'react';

/**
 * Procedural Background Pattern
 * Generates an array of words and icons floating in the background of the card
 * to emphasize the "strategy synthesis" brand theme.
 */
const BackgroundElements = () => {
  const elements = [
    // Branded keywords floating in 3D space
    { type: 'word', content: 'SCALE', top: '5%', left: '10%', rotate: '-15deg' },
    { type: 'word', content: 'REVENUE', top: '20%', left: '80%', rotate: '10deg' },
    { type: 'word', content: 'HOOK', top: '70%', left: '5%', rotate: '-8deg' },
    { type: 'word', content: 'STORY', top: '85%', left: '75%', rotate: '12deg' },
    { type: 'word', content: 'AI', top: '45%', left: '90%', rotate: '-25deg' },
    { type: 'word', content: 'ORO', top: '3%', left: '60%', rotate: '5deg' },
    { type: 'word', content: 'GROWTH', top: '95%', left: '20%', rotate: '-10deg' },
    { type: 'word', content: 'PROFIT', top: '50%', left: '8%', rotate: '15deg' },
    { type: 'word', content: 'FLOW', top: '30%', left: '40%', rotate: '-20deg' },
    { type: 'word', content: 'STRATEGY', top: '75%', left: '88%', rotate: '15deg' },
    { type: 'word', content: 'CONVERSION', top: '15%', left: '30%', rotate: '5deg' },
    { type: 'word', content: 'LEADS', top: '60%', left: '82%', rotate: '-12deg' },
    { type: 'word', content: 'IMPACT', top: '38%', left: '72%', rotate: '8deg' },
    { type: 'word', content: 'VISION', top: '92%', left: '55%', rotate: '-5deg' },
    { type: 'word', content: 'CASH', top: '58%', left: '15%', rotate: '20deg' },

    // Thematic iconography
    { type: 'icon', icon: 'brain', top: '10%', left: '50%', size: 'w-5 h-5' },
    { type: 'icon', icon: 'dollar', top: '40%', left: '35%', size: 'w-6 h-6' },
    { type: 'icon', icon: 'lightning', top: '42%', left: '12%', size: 'w-6 h-6' },
    { type: 'icon', icon: 'cloud', top: '55%', left: '80%', size: 'w-7 h-7' },

    // Visual "rain streaks" to add depth and motion
    { type: 'streak', top: '5%', left: '30%', length: 'w-24' },
    { type: 'streak', top: '12%', left: '15%', length: 'w-32' },
    { type: 'streak', top: '42%', left: '25%', length: 'w-44' },
    { type: 'streak', top: '78%', left: '10%', length: 'w-42' },
  ];

  // Helper to render relevant SVG icons
  const renderIcon = (name: string, className: string) => {
    switch (name) {
      case 'brain':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-2.5 2.5M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 2.5 2.5M12 9h5a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-5M12 9H7a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h5" />
          </svg>
        );
      case 'dollar':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 1v22m5-18H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
          </svg>
        );
      case 'lightning':
        return (
          <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'cloud':
        return (
          <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
            <path d="m13 11-4 6h6l-4 6" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.2] dark:opacity-[0.3] z-0 select-none">
      {elements.map((el, i) => (
        <div
          key={i}
          className="absolute"
          style={{ top: el.top, left: el.left, transform: el.rotate ? `rotate(${el.rotate})` : undefined }}
        >
          {el.type === 'word' && (
            <span className="text-zinc-900 dark:text-white font-black text-[8px] md:text-[9px] tracking-[0.35em] uppercase whitespace-nowrap">
              {el.content}
            </span>
          )}
          {el.type === 'icon' && renderIcon(el.icon!, `${el.size} text-zinc-500 dark:text-zinc-600`)}
          {el.type === 'streak' && (
            <div className={`${el.length} h-[1px] bg-gradient-to-r from-transparent via-zinc-500/40 to-transparent rotate-[-35deg]`}></div>
          )}
        </div>
      ))}
    </div>
  );
};

const VisualMockup: React.FC<{ 
  inputValue: string; 
  setInputValue: (v: string) => void;
  onGenerate: (directorMode: boolean) => void;
  isLoading: boolean;
}> = ({ inputValue, setInputValue, onGenerate, isLoading }) => {
  const [isDirectorMode, setIsDirectorMode] = useState(false);

  return (
    <div className="relative w-full max-w-6xl mx-auto min-h-[600px] flex items-center justify-center mt-12 mb-20 px-4">
      {/* Interactive Mockup Card Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-darkCard rounded-[48px] md:rounded-[56px] shadow-heavy p-8 md:p-12 border border-zinc-100/50 dark:border-darkBorder z-10 transition-colors duration-300 overflow-hidden">
         <BackgroundElements />

         {/* Header Controls (Decorative for Mockup) */}
         <div className="relative z-10 flex items-center justify-end mb-8 md:mb-10">
            <div className="text-zinc-500 dark:text-zinc-600 opacity-[0.2] dark:opacity-[0.3]">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
         </div>

         {/* Central Logo Symbol */}
         <div className="relative z-10 flex justify-center mb-10">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-oroYellow rounded-[28px] md:rounded-[32px] flex items-center justify-center shadow-lg shadow-oroYellow/20">
               <svg className="w-10 h-10 md:w-12 md:h-12 text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
                <path d="m13 11-4 6h6l-4 6" />
               </svg>
            </div>
         </div>

         {/* Interactive Input Mockup */}
         <div className="relative z-10 mt-10 flex flex-col gap-4">
            <div className="relative">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe product & audience..."
                className="w-full bg-zinc-50/80 dark:bg-zinc-900/50 border-2 border-zinc-100 dark:border-darkBorder rounded-full py-5 pl-12 pr-6 text-sm font-bold text-zinc-800 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-oroYellow focus:outline-none shadow-inner transition-all backdrop-blur-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-zinc-900 dark:bg-oroYellow text-white dark:text-black rounded-full flex items-center justify-center font-black text-lg">+</div>
            </div>

            {/* Utility Toggles (Director Mode) */}
            <div className="flex justify-center">
               <div className="relative group/director-btn w-full">
                 <button 
                    onClick={() => setIsDirectorMode(!isDirectorMode)}
                    className={`flex items-center justify-center gap-2 w-full h-16 rounded-3xl border-2 transition-all duration-300 font-black text-xs uppercase tracking-[0.2em] ${isDirectorMode ? 'bg-oroYellow border-oroYellow text-black shadow-lg' : 'bg-white/80 dark:bg-darkCard/80 border-zinc-100 dark:border-darkBorder text-zinc-400 dark:text-zinc-500 backdrop-blur-sm'}`}
                 >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 18v3" />
                      <path d="M9 21h6" />
                      <path d="M12 13v2" />
                      <circle cx="12" cy="15" r="3" />
                      <rect x="8" y="5" width="8" height="6" rx="1" />
                      <path d="M16 8l3-1.5v3L16 8" />
                    </svg>
                    <span>Director Mode</span>
                    {/* Feature Information Tooltip */}
                    <div className="relative group/info-trigger ml-1">
                      <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px] font-black cursor-help hover:bg-current hover:text-white transition-all">i</div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-zinc-900 text-white text-[10px] font-bold rounded-2xl opacity-0 invisible group-hover/info-trigger:opacity-100 group-hover/info-trigger:visible transition-all duration-300 z-[100] shadow-2xl border border-white/10 text-center leading-relaxed">
                        Let the Thunderstorm Begin - allow us to show you how to shoot your content
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-zinc-900"></div>
                      </div>
                    </div>
                 </button>
               </div>
            </div>

            {/* Primary Strategy Button with customized loading animation */}
            <button 
               onClick={() => onGenerate(isDirectorMode)}
               disabled={isLoading}
               className={`relative w-full h-16 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-500 shadow-xl flex items-center justify-center gap-3 overflow-hidden ${isLoading ? 'bg-oroYellow text-zinc-900' : 'bg-zinc-900 dark:bg-oroYellow text-white dark:text-black hover:bg-oroYellow hover:text-zinc-900'}`}
            >
               {isLoading && (
                 <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <rect 
                        x="0" y="0" width="100%" height="100%" 
                        rx="24" ry="24"
                        fill="none" 
                        stroke="zinc-900" 
                        strokeWidth="3" 
                        strokeDasharray="4, 12" 
                        className="animate-dots-rotate"
                        opacity="0.8"
                      />
                    </svg>
                 </div>
               )}
               {isLoading ? (
                 <>
                   <div className="relative w-6 h-6 flex flex-col items-center">
                      <svg className="w-6 h-4 text-zinc-900 mb-[-4px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 13a4 4 0 0 1 0 8H7a5 5 0 0 1 0-10 5 5 0 0 1 8 2z" />
                      </svg>
                      <div className="flex gap-1">
                        <div className="w-0.5 h-1.5 bg-zinc-900 rain-drop"></div>
                        <div className="w-0.5 h-1.5 bg-zinc-900 rain-drop"></div>
                        <div className="w-0.5 h-1.5 bg-zinc-900 rain-drop"></div>
                      </div>
                   </div>
                   <span className="relative z-10">Synthesizing...</span>
                 </>
               ) : "Drop Idea"}
            </button>
         </div>
      </div>
    </div>
  );
};

export default VisualMockup;