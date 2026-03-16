/**
 * PRICING COMPONENT
 * Implements a high-conversion pricing section with a "forced-annual" nudge mechanism.
 * Uses complex state transitions to prioritize high-value plans.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';

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
  isHovered = false
}: any) => {
  return (
    <div 
      onMouseEnter={() => onHover(index)}
      className={`relative flex flex-col min-h-[650px] md:min-h-[580px] lg:min-h-[680px] xl:min-h-[750px] w-[300px] md:w-[230px] lg:w-[310px] xl:w-[380px] shrink-0 rounded-[32px] md:rounded-[24px] lg:rounded-[32px] xl:rounded-[48px] border border-zinc-100 dark:border-zinc-800 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group p-8 md:p-6 lg:p-8 xl:p-12 ${
        isFeatured 
          ? 'bg-oroYellow dark:bg-oroYellow text-zinc-900 shadow-2xl shadow-oroYellow/20 z-10' 
          : 'bg-white dark:bg-darkCard text-zinc-900 dark:text-zinc-100 shadow-xl'
      }`}
    >
      {/* Sliding Border Overlay */}
      {isHovered && (
        <motion.div 
          layoutId="activeBorder"
          className="absolute inset-0 rounded-[32px] md:rounded-[24px] lg:rounded-[32px] xl:rounded-[48px] border-2 border-zinc-900 dark:border-white pointer-events-none z-20"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}

      <div className="w-full flex flex-col h-full relative z-10">
        {/* Plan Identification Section */}
        <div className="min-h-[160px] md:min-h-[140px] lg:min-h-[170px] xl:min-h-[200px] mb-6">
          <p className={`text-[10px] md:text-[9px] lg:text-[11px] xl:text-[13px] font-black uppercase tracking-[0.3em] mb-4 md:mb-3 ${isFeatured ? 'text-zinc-900' : 'text-zinc-900 dark:text-white'}`}>
            {title}
          </p>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className={`${isEnterprise ? 'text-3xl md:text-xl lg:text-4xl xl:text-5xl' : 'text-4xl md:text-2xl lg:text-5xl xl:text-6xl'} font-black tracking-tighter break-all`}>{price}</span>
            {!isEnterprise && <span className={`text-sm md:text-[10px] lg:text-base xl:text-lg font-bold opacity-40 ml-1`}>/{period}</span>}
          </div>
          <p className={`mt-4 md:mt-3 lg:mt-4 xl:mt-6 text-sm md:text-xs lg:text-sm xl:text-base font-semibold leading-relaxed opacity-70`}>
            {description}
          </p>
        </div>

        {/* Feature Matrix for the specific plan */}
        <div className="flex-1 space-y-5 md:space-y-4 mb-8 md:mb-6 pt-6 md:pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <p className={`text-[9px] md:text-[8px] lg:text-[10px] xl:text-[11px] font-black uppercase tracking-widest opacity-30 mb-2 md:mb-2`}>Included Protocol</p>
          {features.map((feature: string, i: number) => (
            <div key={i} className="flex items-start gap-4 md:gap-3">
              <div className={`w-5 h-5 md:w-4 md:h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isFeatured ? 'bg-zinc-900/10 text-zinc-900' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white'}`}>
                <svg className="w-3 h-3 md:w-2.5 md:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sm md:text-xs lg:text-sm xl:text-base font-bold tracking-tight leading-tight">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Button Section */}
        <div className="mt-auto">
          <button 
            onClick={onClick}
            className={`w-full py-4 md:py-3 rounded-[20px] md:rounded-[16px] lg:rounded-[20px] xl:rounded-[24px] text-[9px] md:text-[8px] lg:text-[10px] xl:text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 active:scale-95 ${
            isFeatured 
              ? 'bg-zinc-900 text-white hover:bg-white hover:text-zinc-900 shadow-xl shadow-zinc-900/30' 
              : 'bg-zinc-900 dark:bg-zinc-900 text-white hover:bg-oroYellow hover:text-zinc-900 shadow-lg'
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
  
  const commonFeatures = [
    "14-Day Full Protocol Synthesis",
    "Neural Hook Optimization",
    "Cinematic Direction & Visuals",
    "High-Ticket Conversion CTAs",
    "Unlimited Archive Access"
  ];

  return (
    <section className="py-40 px-4 relative overflow-hidden reveal">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight mb-6 uppercase">Scale Your Rain.</h2>
          <p className="text-zinc-500 dark:text-zinc-500 max-w-2xl mx-auto text-lg font-medium italic opacity-70">
            Choose the frequency of your success. All tiers include full access to the OroDrop synthesis engine.
          </p>
        </div>

        <div className="relative flex justify-center w-full">
          {/* Interactive Pricing Grid */}
          <div className={`flex flex-col md:flex-row gap-4 lg:gap-6 xl:gap-8 items-center justify-center relative transition-all duration-700 w-full`}>
            
            {/* Tier 1: Monthly */}
            <PricingCard 
              index={0}
              onHover={setHoveredIndex}
              isHovered={hoveredIndex === 0}
              onClick={() => alert("Proceeding to Monthly checkout...")}
              title="Standard Flow"
              price="RM65"
              period="month"
              description="Perfect for creators testing the waters. Professional monthly recurring access."
              features={commonFeatures}
              buttonText="Initiate Monthly"
            />
            
            {/* Tier 2: Annual */}
            <PricingCard 
              index={1}
              onHover={setHoveredIndex}
              isHovered={hoveredIndex === 1}
              onClick={() => console.log("Annual protocol initiated")}
              title="Accelerated Storm"
              price="RM499"
              period="year"
              description="Our most popular path. Massive savings for committed brand builders."
              features={commonFeatures}
              buttonText="Secure Annual"
              isFeatured={true}
            />
            
            {/* Tier 3: Enterprise */}
            <PricingCard 
              index={2}
              onHover={setHoveredIndex}
              isHovered={hoveredIndex === 2}
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
          <p className="text-[11px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.6em]">Secure Neural Checkout • AES-256 Encryption Active</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
