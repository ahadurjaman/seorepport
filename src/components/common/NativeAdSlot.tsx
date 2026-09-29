import React, { useEffect, useRef, useState } from 'react';
import { getAdNetworkEndpoint } from '../../utils/adConfig';
import { X, ShieldCheck } from 'lucide-react';

interface NativeAdSlotProps {
  className?: string;
  containerId?: string;
  scriptUrl?: string;
  showFallbackOnDisable?: boolean;
}

export const NativeAdSlot: React.FC<NativeAdSlotProps> = ({
  className = '',
  containerId = 'container-994b7e505de9acdabef5b96a9edf9efe',
  scriptUrl,
  showFallbackOnDisable = true,
}) => {
  const activeScriptUrl = scriptUrl || getAdNetworkEndpoint('native');
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Check current provider and native banner state from window/localStorage
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const provider = (window as any).__AD_PROVIDER__ || localStorage.getItem('seotools_ad_provider') || 'adsterra';
      const nativeSetting = localStorage.getItem('seotools_adsterra_native');
      const isNativeActive = nativeSetting === null ? true : nativeSetting === 'true';
      return (provider === 'adsterra' || provider === 'both') && isNativeActive;
    }
    return true;
  });

  // Listen to live settings changes from Admin panel
  useEffect(() => {
    const handleConfigChange = () => {
      if (typeof window !== 'undefined') {
        const provider = (window as any).__AD_PROVIDER__ || localStorage.getItem('seotools_ad_provider') || 'adsterra';
        const nativeSetting = localStorage.getItem('seotools_adsterra_native');
        const isNativeActive = nativeSetting === null ? true : nativeSetting === 'true';
        setIsEnabled((provider === 'adsterra' || provider === 'both') && isNativeActive);
      }
    };

    window.addEventListener('adconfigchange', handleConfigChange);
    return () => window.removeEventListener('adconfigchange', handleConfigChange);
  }, []);

  // Dynamically inject script when enabled
  useEffect(() => {
    if (isEnabled && typeof document !== 'undefined') {
      const scriptElementId = `adsterra-native-${containerId}`;
      let script = document.getElementById(scriptElementId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptElementId;
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = activeScriptUrl;
        document.body.appendChild(script);
      }
    }
  }, [isEnabled, containerId, activeScriptUrl]);

  if (!isEnabled) {
    if (!showFallbackOnDisable) return null;

    return (
      <aside className={`relative my-2 flex flex-col justify-center rounded-xl border border-slate-200/80 bg-slate-50/60 p-2 text-center ${className}`}>
        <div className="py-1 text-[11px] text-slate-400">
          Sponsored Banner (Disabled in <a href="/admin" className="font-semibold text-indigo-600 hover:underline">Admin</a>)
        </div>
      </aside>
    );
  }

  return (
    <aside
      ref={containerRef}
      className={`relative my-3 sm:my-4 flex flex-col justify-center rounded-xl sm:rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90 p-2.5 sm:p-3 shadow-2xs transition-all overflow-hidden w-full max-w-4xl mx-auto ${className}`}
      aria-label="Sponsored content"
    >
      <div className="flex items-center justify-between text-[9px] font-bold tracking-wider text-slate-400 uppercase select-none mb-1">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500 font-extrabold">Sponsored</span>
          <span className="text-slate-300">•</span>
          <span className="text-[8px] text-slate-400 font-medium">Partner Network</span>
        </div>
        <span className="text-[8px] text-slate-400">Ad</span>
      </div>

      <div className="w-full flex justify-center items-center overflow-x-auto">
        {/* Dynamic Adsterra Native Container */}
        <div id={containerId} className="w-full min-h-[60px] flex justify-center items-center"></div>
      </div>
    </aside>
  );
};

export default NativeAdSlot;
