import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, RefreshCw, CheckCircle2, AlertTriangle, Globe, Sparkles, HelpCircle } from 'lucide-react';

export const AdBlockDetector: React.FC = () => {
  const [isAdBlockDetected, setIsAdBlockDetected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [checkPassed, setCheckPassed] = useState<boolean>(false);
  const [enabledInSettings, setEnabledInSettings] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('seotools_adblock_detector');
      return stored === null ? true : stored === 'true';
    }
    return true;
  });

  // Multi-Vector AdBlock Detection Core Function
  const detectAdBlock = useCallback(async (): Promise<boolean> => {
    if (!enabledInSettings) return false;

    // Vector 1: Bait DOM element test
    let domBlocked = false;
    try {
      const bait = document.createElement('div');
      bait.className = 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links ad-banner adsbox advertisement ad-placement banner-ad';
      bait.setAttribute('aria-hidden', 'true');
      bait.style.cssText = 'position: absolute !important; left: -9999px !important; top: -9999px !important; width: 1px !important; height: 1px !important; pointer-events: none !important;';
      document.body.appendChild(bait);

      // Wait a microtick for adblocker stylesheet rules to apply
      await new Promise((r) => setTimeout(r, 60));

      const styles = window.getComputedStyle(bait);
      if (
        bait.offsetParent === null ||
        bait.offsetHeight === 0 ||
        bait.offsetWidth === 0 ||
        styles.display === 'none' ||
        styles.visibility === 'hidden'
      ) {
        domBlocked = true;
      }
      bait.remove();
    } catch {
      domBlocked = true;
    }

    if (domBlocked) return true;

    // Vector 2: Network Fetch Bait
    let networkBlocked = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      // Common ad network path that all major adblockers intercept
      const res = await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (e: any) {
      // If error is network blocked by client extension
      if (e.name !== 'AbortError') {
        networkBlocked = true;
      }
    }

    return networkBlocked;
  }, [enabledInSettings]);

  // Listen to config changes from Admin panel
  useEffect(() => {
    const handleConfigChange = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('seotools_adblock_detector');
        setEnabledInSettings(stored === null ? true : stored === 'true');
      }
    };

    window.addEventListener('adconfigchange', handleConfigChange);
    return () => window.removeEventListener('adconfigchange', handleConfigChange);
  }, []);

  // Initial and periodic scan
  useEffect(() => {
    if (!enabledInSettings) {
      setIsAdBlockDetected(false);
      return;
    }

    let isMounted = true;

    const runCheck = async () => {
      const blocked = await detectAdBlock();
      if (isMounted) {
        setIsAdBlockDetected(blocked);
        if (blocked) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    };

    // First run after page load
    const timer = setTimeout(runCheck, 800);

    // Periodic watchdog check every 10 seconds in case ad blocker is toggled
    const interval = setInterval(runCheck, 10000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(interval);
      document.body.style.overflow = '';
    };
  }, [detectAdBlock, enabledInSettings]);

  // Manual re-check by user
  const handleRecheck = async () => {
    setIsChecking(true);
    setCheckPassed(false);
    
    // Slight artificial delay for UX feedback
    await new Promise((r) => setTimeout(r, 800));
    const stillBlocked = await detectAdBlock();
    setIsChecking(false);

    if (!stillBlocked) {
      setCheckPassed(true);
      setTimeout(() => {
        setIsAdBlockDetected(false);
        document.body.style.overflow = '';
      }, 1000);
    } else {
      setIsAdBlockDetected(true);
      document.body.style.overflow = 'hidden';
    }
  };

  if (!isAdBlockDetected) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="adblock-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700/80 bg-slate-900 text-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 text-center">
        {/* Shield Icon Header */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <ShieldAlert className="h-8 w-8 animate-pulse" />
        </div>

        {/* Title & Explanation */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Ad Blocker Detected</span>
          </div>

          <h2 id="adblock-modal-title" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Please Disable Your Ad Blocker
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            SEO Report Tools is <strong className="text-indigo-400">100% free forever</strong> with zero registration or paywalls. We rely exclusively on non-intrusive ads to pay for our crawler servers and AI models.
          </p>
        </div>

        {/* Step-by-step Whitelist Instructions */}
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700 p-4 text-left space-y-3">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>How to unblock in 3 easy steps:</span>
          </div>

          <ol className="text-xs text-slate-300 space-y-2 pl-4 list-decimal marker:text-indigo-400 marker:font-bold">
            <li>
              Click your AdBlock extension icon (<span className="font-semibold text-slate-200">uBlock Origin, AdBlock Plus, AdGuard, or Brave Shield</span>) in your browser toolbar.
            </li>
            <li>
              Select <span className="font-semibold text-amber-300">"Pause on this site"</span> or toggle the shield power switch to <span className="font-semibold text-emerald-300">OFF</span>.
            </li>
            <li>
              Click the button below to verify and unlock full access.
            </li>
          </ol>
        </div>

        {/* Action Button */}
        <div className="space-y-3 pt-2">
          {checkPassed ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5" />
              <span>AdBlocker Disabled! Unlocking Site...</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRecheck}
              disabled={isChecking}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Scanning Extensions...' : "I've Disabled AdBlock — Refresh"}</span>
            </button>
          )}

          <p className="text-[11px] text-slate-400">
            Thank you for supporting independent free web development!
          </p>
        </div>
      </div>
    </div>
  );
};
