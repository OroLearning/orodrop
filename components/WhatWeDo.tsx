/**
 * WHAT WE DO SECTION
 * High-level overview of the application's core capabilities.
 */

import React, { useEffect, useRef } from 'react';

/**
 * Reusable Feature Entry Card
 */
const FeatureCard = ({ title, description, icon: Icon, isDark = false }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Trigger intersection animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`reveal relative group h-64 rounded-[32px] p-8 flex flex-col justify-end transition-all duration-500 hover:-translate-y-2
        ${isDark 
          ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-2xl shadow-oroYellow/10 dark:shadow-[0_0_50px_-10px_rgba(226,255,0,0.2)]' 
          : 'bg-white dark:bg-darkCard text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-darkBorder shadow-xl shadow-slate-200/50 dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)]'}`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[40px] rounded-tr-[32px] flex items-center justify-center
        ${isDark ? 'bg-white/10 backdrop-blur-md' : 'bg-slate-50 dark:bg-slate-800'}`}>
        <Icon className={`w-10 h-10 ${isDark ? 'text-white' : 'text-oroYellow'}`} />
      </div>
      
      <div className="max-w-[70%]">
        <h3 className="text-lg md:text-2xl font-bold leading-tight mb-2">{title}</h3>
      </div>
    </div>
  );
};

const WhatWeDo: React.FC = () => {
  return (
    <section className="py-32 px-4 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        {/* Copywriting Section */}
        <div className="reveal">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-oroYellow animate-pulse"></div>
            <span className="text-oroYellow font-extrabold tracking-widest text-xs uppercase">Core Engine</span>
          </div>
          <h2 className="text-6xl font-black text-[#1e293b] dark:text-white mb-8 leading-[1.1]">
            The Science <br />
            <span className="text-oroYellow">Of Selling.</span>
          </h2>
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg mb-12">
            OroDrop isn't just a text generator. It's a psychological framework designed to move your audience from passive observers to active buyers in exactly 14 days.
          </p>
        </div>

        {/* Dynamic 2x2 Grid of Feature Cards */}
        <div className="grid grid-cols-2 gap-6">
          <FeatureCard 
            title="Drafts viral story hooks"
            icon={() => (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            )}
          />
          <FeatureCard 
            title="Builds authority daily"
            icon={() => (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            )}
          />
          <FeatureCard 
            title="Organizes launch metrics"
            isDark={true}
            icon={() => (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            )}
          />
          <FeatureCard 
            title="Researches niche trends"
            icon={() => (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            )}
          />
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;