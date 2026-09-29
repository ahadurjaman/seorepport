import React, { useState, useEffect } from 'react';
import { AdsterraBanner } from './AdsterraBanner';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface StickyBottomBannerProps {
  isVisible?: boolean;
}

export const StickyBottomBanner: React.FC<StickyBottomBannerProps> = ({ isVisible = true }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [adProvider, setAdProvider] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (window as any).__AD_PROVIDER__ || localStorage.getItem('seotools_ad_provider') || 'adsterra';
    }
    return 'adsterra';
  });

  const [bannerEnabled, setBannerEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('seotools_adsterra_banner728');
      return stored === null ? true : stored === 'true';
    }
    return true;
  });

  useEffect(() => {
    const handleConfigChange = () => {
      if (typeof window !== 'undefined') {
        const prov = (window as any).__AD_PROVIDER__ || localStorage.getItem('seotools_ad_provider') || 'adsterra';
        setAdProvider(prov);
        const b728 = localStorage.getItem('seotools_adsterra_banner728');
        setBannerEnabled(b728 === null ? true : b728 === 'true');
      }
    };

    window.addEventListener('adconfigchange', handleConfigChange);
    return () => window.removeEventListener('adconfigchange', handleConfigChange);
  }, []);

  if (adProvider === 'none' || !bannerEnabled) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-500 ease-out print:hidden flex flex-col items-center justify-center ${
        !isVisible
          ? 'translate-y-full opacity-0 pointer-events-none'
          : isMinimized
          ? 'translate-y-[calc(100%-24px)] opacity-100'
          : 'translate-y-0 opacity-100'
      }`}
      style={{ filter: 'drop-shadow(0 -4px 12px rgba(0,0,0,0.08))' }}
      aria-label="Sticky Sponsored Advertisement"
    >
      {/* Top micro toggle pill */}
      <div className="flex items-center justify-between w-full max-w-[740px] px-3">
        <div className="bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-t-lg flex items-center gap-1 shadow-xs select-none">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sponsored</span>
        </div>

        <button
          type="button"
          onClick={() => setIsMinimized(!isMinimized)}
          className="bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md text-slate-300 hover:text-white text-[10px] font-semibold px-2 py-0.5 rounded-t-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
          title={isMinimized ? 'Expand ad banner' : 'Minimize ad banner'}
        >
          <span>{isMinimized ? 'Show Ad' : 'Hide'}</span>
          {isMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Main Sticky Ad Container */}
      <div className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 flex justify-center items-center overflow-x-auto min-h-[96px]">
        <div className="w-full max-w-[728px] flex justify-center items-center">
          <AdsterraBanner />
        </div>
      </div>
    </div>
  );
};

