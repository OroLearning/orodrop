/**
 * PRICING COMPONENT
 * Implements a high-conversion pricing section with a "forced-annual" nudge mechanism.
 * Uses complex state transitions to prioritize high-value plans.
 */

import React, { useState, useRef, useEffect } from 'react';

const PricingCard = ({ 
  title, 
  price, 
  period, 
  description, 
  features, 
  buttonText, 
  isFeatured = false, 
  isEnterprise = false,
  onHover,
  onClick,
  index,
  isHidden = false,
  translateClass = ""
}: any) => {
  return (
    <div 
      onMouseEnter={() => !isHidden && onHover(index)}
      className={`relative flex flex-col h-[600px] md:h-[540px] lg:h-[680px] w-[300px] md:w-[230px] lg:w-[380px] shrink-0 rounded-[32px] md:rounded-[24px] lg:rounded-[48px] border-2 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group ${
        isFeatured 
          ? 'bg-[#1e293b] dark:bg-slate-800 text-white border-oroYellow shadow-2xl shadow-oroYellow/20 z-10' 
          : 'bg-white dark:bg-darkCard text-slate-900 dark:text-slate-100 border-slate-50 dark:border-darkBorder shadow-xl'
      } ${isHidden ? 'opacity-0 pointer-events-none scale-95 -translate-x-8 !w-0 !p-0 !m-0 overflow-hidden border-0' : 'opacity-100 p-6 md:p-4 lg:p-10'} ${translateClass}`}
    >
      <div className={`w-full flex flex-col h-full ${isHidden ? 'invisible' : 'visible'}`}>
        {/* Plan Identification Section */}
        <div className="h-[140px] md:h-[120px] lg:h-[180px] mb-4">
          <p className={`text-[9px] md:text-[8px] lg:text-[11px] font-black uppercase tracking-[0.3em] mb-3 md:mb-2 ${isFeatured ? 'text-oroYellow' : 'text-oroYellow dark:text-oroYellow'}`}>
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl md:text-2xl lg:text-6xl font-black tracking-tighter">{price}</span>
            {!isEnterprise && <span className={`text-sm md:text-[10px] lg:text-lg font-bold opacity-40 ml-1`}>/{period}</span>}
          </div>
          <p className={`mt-3 md:mt-2 lg:mt-5 text-xs md:text-[10px] lg:text-sm font-semibold leading-relaxed opacity-70`}>
            {description}
          </p>
        </div>

        {/* Feature Matrix for the specific plan */}
        <div className="flex-1 space-y-3 md:space-y-2 mb-6 md:mb-4 pt-4 md:pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className={`text-[8px] md:text-[7px] lg:text-[10px] font-black uppercase tracking-widest opacity-30 mb-1 md:mb-1`}>Included Protocol</p>
          {features.map((feature: string, i: number) => (
            <div key={i} className="flex items-start gap-3 md:gap-2">
              <div className={`w-4 h-4 md:w-3.5 md:h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isFeatured ? 'bg-oroYellow/20 text-oroYellow' : 'bg-slate-50 dark:bg-slate-800 text-oroYellow'}`}>
                <svg className="w-2.5 h-2.5 md:w-2 md:h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-[10px] md:text-[9px] font-bold tracking-tight leading-tight">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Button Section */}
        <div className="mt-auto">
          <button 
            onClick={onClick}
            className={`w-full py-4 md:py-3 rounded-[20px] md:rounded-[16px] lg:rounded-[24px] text-[9px] md:text-[8px] lg:text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 active:scale-95 ${
            isFeatured 
              ? 'bg-oroYellow text-slate-900 hover:bg-white hover:text-slate-900 shadow-xl shadow-oroYellow/30' 
              : 'bg-[#0f172a] dark:bg-slate-900 text-white hover:bg-oroYellow hover:text-slate-900 shadow-lg'
          }`}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const Pricing: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState(1);
  
  // Psychological Nudge State Logic
  const [isNudgeActive, setIsNudgeActive] = useState(false);        // Show "Are you sure?" modal
  const [isAnnualCovering, setIsAnnualCovering] = useState(false);  // Visual "covering" animation state
  const [isMonthlyHidden, setIsMonthlyHidden] = useState(false);    // Temp hide monthly option
  const [showGoodChoice, setShowGoodChoice] = useState(false);      // Success feedback bubble
  const [isBypassActive, setIsBypassActive] = useState(false);      // Allows clicking monthly after nudge bypass

  const commonFeatures = [
    "14-Day Full Protocol Synthesis",
    "Neural Hook Optimization",
    "Cinematic Direction & Visuals",
    "High-Ticket Conversion CTAs",
    "Unlimited Archive Access"
  ];

  /**
   * Nudge Mechanism: Prevents users from easily selecting monthly.
   * On first click, hides monthly and slides annual into its place.
   */
  const handleMonthlyClick = () => {
    // Disable nudge on mobile/tablet (less than 1024px)
    if (window.innerWidth < 1024) {
      alert("Proceeding to Monthly checkout...");
      return;
    }

    // If user already saw the nudge and said "Yes", allow the click
    if (isBypassActive) {
      alert("Proceeding to Monthly checkout...");
      return;
    }

    // Otherwise, trigger the visual slide and confirmation modal
    setIsAnnualCovering(true);
    setTimeout(() => {
      setIsNudgeActive(true);
    }, 800);
  };

  /**
   * Handles user decision on the "Are you sure?" nudge.
   */
  const handleDecision = (decision: 'yes' | 'no') => {
    if (decision === 'yes') {
      // User insisted on monthly
      setIsAnnualCovering(false);
      setIsNudgeActive(false);
      setIsBypassActive(true); // Enable bypass for 60 seconds
      setTimeout(() => {
        setIsBypassActive(false);
      }, 60000);
    } else {
      // User chose to reconsider (stay on annual/featured)
      setShowGoodChoice(true);
      setIsNudgeActive(false);
      setIsAnnualCovering(false);
      setIsMonthlyHidden(true); // Hide monthly for 60 seconds to lock in decision
      
      setTimeout(() => setShowGoodChoice(false), 3000);
      setTimeout(() => {
        setIsMonthlyHidden(false);
      }, 60000);
    }
  };

  return (
    <section className="py-40 px-4 relative overflow-hidden reveal">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6 uppercase">Scale Your Rain.</h2>
          <p className="text-slate-500 dark:text-slate-500 max-w-2xl mx-auto text-lg font-medium italic opacity-70">
            Choose the frequency of your success. All tiers include full access to the OroDrop synthesis engine.
          </p>
        </div>

        <div className="relative flex justify-center w-full">
          {/* Forced-Annual Nudge Modal */}
          {isNudgeActive && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-md animate-fade-in">
              <div 
                className="bg-white dark:bg-darkCard p-12 rounded-[56px] shadow-heavy border border-slate-100 dark:border-darkBorder flex flex-col items-center gap-10 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-slate-900 dark:text-white font-black text-2xl uppercase tracking-[0.3em] text-center">Are you sure?</p>
                <div className="flex gap-8">
                  <button 
                    onClick={() => handleDecision('yes')}
                    className="px-12 py-5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-[28px] font-black text-sm uppercase tracking-[0.2em] transition-all"
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => handleDecision('no')}
                    className="px-14 py-5 bg-oroYellow text-slate-900 rounded-[28px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-oroYellow/40 active:scale-95 transition-all"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Psychological Reward Bubble */}
          {showGoodChoice && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] animate-bounce">
              <div className="bg-emerald-500 text-white px-12 py-6 rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-heavy border-4 border-white/30">
                Good Choice
              </div>
            </div>
          )}

          {/* Interactive Pricing Grid */}
          <div className={`flex flex-col md:flex-row gap-4 lg:gap-8 items-center justify-center relative transition-all duration-700 w-full`}>
            
            {/* Tier 1: Monthly (Vulnerable to nudge) */}
            <PricingCard 
              index={0}
              isHidden={isMonthlyHidden || isAnnualCovering}
              onHover={setHoveredIndex}
              onClick={handleMonthlyClick}
              title="Standard Flow"
              price="RM65"
              period="month"
              description="Perfect for creators testing the waters. Professional monthly recurring access."
              features={commonFeatures}
              buttonText="Initiate Monthly"
            />
            
            {/* Tier 2: Annual (The primary goal of the nudge) */}
            <PricingCard 
              index={1}
              onHover={setHoveredIndex}
              onClick={() => console.log("Annual protocol initiated")}
              title="Accelerated Storm"
              price="RM499"
              period="year"
              description="Our most popular path. Massive savings for committed brand builders."
              features={commonFeatures}
              buttonText="Secure Annual"
              isFeatured={true}
              translateClass={isAnnualCovering ? "md:-translate-x-[262px] lg:-translate-x-[412px]" : ""}
            />
            
            {/* Tier 3: Enterprise */}
            <PricingCard 
              index={2}
              onHover={setHoveredIndex}
              onClick={() => console.log("Enterprise requested")}
              title="Infinite Cloud"
              price="Enterprise"
              period="lifetime"
              description="Exclusive lifetime access for established agencies and enterprises."
              features={commonFeatures}
              buttonText="Contact Us"
              isEnterprise={true}
            />
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-24 text-center">
          <p className="text-[11px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.6em]">Secure Neural Checkout • AES-256 Encryption Active</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;