import React, { useEffect, useRef, useState } from 'react';
import { AdsterraBanner } from './AdsterraBanner';
import { NativeAdSlot } from './NativeAdSlot';
import { getAdNetworkEndpoint } from '../../utils/adConfig';
import { ExternalLink, Zap } from 'lucide-react';

interface AdSlotProps {
  format?: 'horizontal' | 'rectangle' | 'in-feed' | 'compact';
  className?: string;
  slotId?: string;
  variant?: 'standard' | 'minimal' | 'card';
}

export const AdSlot: React.FC<AdSlotProps> = ({
  format = 'horizontal',
  className = '',
  slotId,
  variant = 'standard',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [adProvider, setAdProvider] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (window as any).__AD_PROVIDER__ || localStorage.getItem('seotools_ad_provider') || 'adsterra';
    }
    return 'adsterra';
  });

  const [banner728Enabled, setBanner728Enabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('seotools_adsterra_banner728');
      return stored === null ? true : stored === 'true';
    }
    return true;
  });

  const [nativeBannerEnabled, setNativeBannerEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('seotools_adsterra_native');
      return stored === 'true'; // OFF by default as requested
    }
    return false;
  });

  const adsenseClientId =
    (typeof window !== 'undefined' &&
      ((window as any).__ADSENSE_CLIENT_ID__ ||
        localStorage.getItem('seotools_adsense_client_id'))) ||
    '';

  const currentSlotId =
    slotId ||
    (typeof window !== 'undefined' &&
      ((window as any).__ADSENSE_SLOT_ID__ ||
        localStorage.getItem('seotools_adsense_slot_id'))) ||
    '';

  useEffect(() => {
    const handleConfigChange = () => {
      if (typeof window !== 'undefined') {
        const prov = (window as any).__AD_PROVIDER__ || localStorage.getItem('seotools_ad_provider') || 'adsterra';
        setAdProvider(prov);
        const b728 = localStorage.getItem('seotools_adsterra_banner728');
        setBanner728Enabled(b728 === null ? true : b728 === 'true');
        const nativeOn = localStorage.getItem('seotools_adsterra_native');
        setNativeBannerEnabled(nativeOn === 'true');
      }
    };

    window.addEventListener('adconfigchange', handleConfigChange);
    return () => window.removeEventListener('adconfigchange', handleConfigChange);
  }, []);

  useEffect(() => {
    if ((adProvider === 'google' || adProvider === 'both') && adsenseClientId) {
      const scriptSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`;
      if (!document.querySelector(`script[src*="pagead2.googlesyndication.com"]`)) {
        const script = document.createElement('script');
        script.async = true;
        script.src = scriptSrc;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      try {
        if (typeof window !== 'undefined') {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      } catch {
        // Handled
      }
    }
  }, [adProvider, adsenseClientId, currentSlotId]);

  if (adProvider === 'none') {
    return null;
  }

  // If 728x90 Banner is active for Adsterra
  const isAdsterraBannerActive = (adProvider === 'adsterra' || adProvider === 'both') && banner728Enabled;
  if (isAdsterraBannerActive) {
    return (
      <aside
        ref={containerRef}
        className={`relative my-3 sm:my-4 flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90 p-2 sm:p-2.5 shadow-2xs overflow-hidden w-full max-w-4xl mx-auto ${className}`}
        aria-label="Sponsored Banner"
      >
        <div className="w-full flex items-center justify-between text-[9px] font-bold tracking-wider text-slate-400 uppercase select-none mb-1 px-1">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 font-extrabold">Sponsored</span>
            <span className="text-slate-300">•</span>
            <span className="text-[8px] text-slate-400 font-medium">Adsterra 728x90 Banner</span>
          </div>
          <span className="text-[8px] text-slate-400">Ad</span>
        </div>

        <AdsterraBanner />
      </aside>
    );
  }

  // If Native Banner is enabled manually
  const isAdsterraNativeActive = (adProvider === 'adsterra' || adProvider === 'both') && nativeBannerEnabled;
  if (isAdsterraNativeActive) {
    return (
      <NativeAdSlot
        className={className}
        containerId={`container-994b7e505de9acdabef5b96a9edf9efe-${format}`}
        scriptUrl={getAdNetworkEndpoint('native')}
        showFallbackOnDisable={false}
      />
    );
  }

  const isGoogleActive = (adProvider === 'google' || adProvider === 'both') && adsenseClientId && currentSlotId;

  // Compact responsive styles
  const formatClasses = {
    horizontal: 'w-full max-w-4xl mx-auto py-2.5 px-3 sm:px-4 my-3 sm:my-4 min-h-[60px]',
    compact: 'w-full max-w-3xl mx-auto py-2 px-3 my-2 min-h-[48px]',
    rectangle: 'w-full max-w-sm mx-auto p-3.5 my-3 min-h-[180px]',
    'in-feed': 'w-full my-3 sm:my-4 p-3 sm:p-3.5 min-h-[65px]',
  }[format];

  return (
    <aside
      ref={containerRef}
      className={`relative flex flex-col justify-center rounded-xl sm:rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50/80 via-white to-indigo-50/20 shadow-2xs hover:border-indigo-200/80 transition-all overflow-hidden ${formatClasses} ${className}`}
      aria-label="Sponsored advertisement"
    >
      <div className="flex items-center justify-between text-[9px] font-bold tracking-wider text-slate-400 uppercase select-none mb-1">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500 font-extrabold">Sponsored</span>
          <span className="text-slate-300">•</span>
          <span className="text-[8px] text-slate-400 font-medium">
            {isGoogleActive ? 'Google AdSense' : 'Featured Partner'}
          </span>
        </div>
        <span className="text-[8px] text-slate-400">Ad</span>
      </div>

      {isGoogleActive ? (
        <div className="w-full flex justify-center items-center overflow-x-auto py-1">
          <ins
            className="adsbygoogle block w-full text-center"
            style={{ display: 'block' }}
            data-ad-client={adsenseClientId}
            data-ad-slot={currentSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-left">
          <div className="flex items-center gap-2.5 max-w-xl">
            <div className="hidden xs:flex p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">
                  Cloud SSD Hosting
                </span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-100 text-amber-800">
                  70% OFF
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                High-Speed Cloud VPS &amp; Free Automated SSL Certificates
              </h4>
            </div>
          </div>

          <a
            href="/tools"
            className="inline-flex items-center gap-1 self-end sm:self-center shrink-0 rounded-lg bg-slate-900 hover:bg-indigo-600 px-3 py-1 text-[10px] font-bold text-white shadow-2xs transition-colors"
          >
            <span>Learn More</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      )}
    </aside>
  );
};


