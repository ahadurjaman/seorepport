import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ToolDetailPage } from './pages/ToolDetailPage';
import { ToolsDirectoryPage } from './pages/ToolsDirectoryPage';
import { ClusterLandingPage } from './pages/ClusterLandingPage';
import { PublicReportPage } from './pages/PublicReportPage';
import { BlogIndexPage } from './pages/BlogIndexPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPages } from './pages/LegalPages';
import { AdminPage } from './pages/AdminPage';
import { AuditHistoryPage } from './pages/AuditHistoryPage';
import { TOOLS } from './data/toolsData';
import { BLOG_POSTS } from './data/blogData';
import { StickyBottomBanner } from './components/common/StickyBottomBanner';
import { AdBlockDetector } from './components/common/AdBlockDetector';
import { getAdNetworkEndpoint } from './utils/adConfig';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/'
  );
  const [quickAnalyzeUrl, setQuickAnalyzeUrl] = useState<string | undefined>(undefined);
  const [hasInteractedOrScrolled, setHasInteractedOrScrolled] = useState<boolean>(false);

  // Smart post-first-fold and engagement detection to protect UX
  useEffect(() => {
    const handleScrollOrInteraction = () => {
      if (window.scrollY > 100) {
        setHasInteractedOrScrolled(true);
      }
    };

    window.addEventListener('scroll', handleScrollOrInteraction, { passive: true });
    
    // Delayed fallback activation after initial user action
    const handleInitialAction = () => {
      setTimeout(() => setHasInteractedOrScrolled(true), 2000);
    };
    window.addEventListener('click', handleInitialAction, { once: true, passive: true });
    window.addEventListener('touchstart', handleInitialAction, { once: true, passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollOrInteraction);
      window.removeEventListener('click', handleInitialAction);
      window.removeEventListener('touchstart', handleInitialAction);
    };
  }, []);

  // Clean up any third-party popunder scripts whenever on homepage to ensure 100% clean input UX
  useEffect(() => {
    if (currentPath === '/' || currentPath === '') {
      const existingPopScript = document.getElementById('adsterra-popunder-script');
      if (existingPopScript) {
        existingPopScript.remove();
      }
      const socialScript = document.getElementById('adsterra-socialbar-script');
      if (socialScript) {
        socialScript.remove();
      }
    }
  }, [currentPath]);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
    };
    window.addEventListener('popstate', onPopState);

    // Intercept internal link clicks for instant SPA routing
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target &&
        target.href &&
        target.origin === window.location.origin &&
        !target.getAttribute('download') &&
        target.getAttribute('target') !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        const href = target.getAttribute('href') || '';
        // Skip sitemap.xml and robots.txt so they load server responses directly
        if (href.endsWith('.xml') || href.endsWith('.txt')) {
          return;
        }

        e.preventDefault();
        window.history.pushState({}, '', href);
        setCurrentPath(window.location.pathname.toLowerCase());
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    document.addEventListener('click', handleLinkClick);

    // Check for ?analyze= query param on home load
    const params = new URLSearchParams(window.location.search);
    const analyzeParam = params.get('analyze');
    if (analyzeParam) {
      setQuickAnalyzeUrl(analyzeParam);
    }

      // Sync Ad Network configuration from backend or localStorage
    const syncAdNetwork = (data: any) => {
      const provider = data.adProvider || localStorage.getItem('seotools_ad_provider') || 'adsterra';
      const popunderEnabled = data.adsterraPopunder !== undefined ? Boolean(data.adsterraPopunder) : localStorage.getItem('seotools_adsterra_popunder') === 'true';
      const socialBarEnabled = data.adsterraSocialBar !== undefined ? Boolean(data.adsterraSocialBar) : localStorage.getItem('seotools_adsterra_socialbar') === 'true';
      const nativeEnabled = data.adsterraNativeBanner !== undefined ? Boolean(data.adsterraNativeBanner) : localStorage.getItem('seotools_adsterra_native') === 'true';
      const clientId = data.adsenseClientId || localStorage.getItem('seotools_adsense_client_id') || '';
      const slotId = data.adsenseSlotId || localStorage.getItem('seotools_adsense_slot_id') || '';

      (window as any).__AD_PROVIDER__ = provider;
      localStorage.setItem('seotools_ad_provider', provider);
      localStorage.setItem('seotools_adsterra_popunder', String(popunderEnabled));
      localStorage.setItem('seotools_adsterra_socialbar', String(socialBarEnabled));
      localStorage.setItem('seotools_adsterra_native', String(nativeEnabled));

      if (clientId) {
        (window as any).__ADSENSE_CLIENT_ID__ = clientId;
        localStorage.setItem('seotools_adsense_client_id', clientId);
      }
      if (slotId) {
        (window as any).__ADSENSE_SLOT_ID__ = slotId;
        localStorage.setItem('seotools_adsense_slot_id', slotId);
      }

      // Adsterra Popunder injection - STRICTLY DISABLED ON HOMEPAGE & FIRST FOLD INPUT TO PROTECT USER RETENTION
      const popunderScriptId = 'adsterra-popunder-script';
      const existingPopScript = document.getElementById(popunderScriptId) as HTMLScriptElement | null;
      const isHomePage = window.location.pathname === '/' || window.location.pathname === '';

      if ((provider === 'adsterra' || provider === 'both') && popunderEnabled && !isHomePage) {
        const hasTriggeredInSession = sessionStorage.getItem('seotools_pop_session');
        if (!existingPopScript && !hasTriggeredInSession) {
          const loadPopunderScript = () => {
            if (document.getElementById(popunderScriptId)) return;
            sessionStorage.setItem('seotools_pop_session', '1');
            const newPopScript = document.createElement('script');
            newPopScript.id = popunderScriptId;
            newPopScript.src = getAdNetworkEndpoint('popunder');
            document.body.appendChild(newPopScript);
            window.removeEventListener('scroll', handlePopScroll);
            document.removeEventListener('click', handlePopClick);
          };

          const handlePopScroll = () => {
            if (window.scrollY > 400 && window.location.pathname !== '/') {
              loadPopunderScript();
            }
          };

          const handlePopClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            // Never hijack user input fields, forms, search bars, or buttons
            if (
              target &&
              (target.closest('input') ||
                target.closest('textarea') ||
                target.closest('button') ||
                target.closest('form') ||
                target.closest('nav'))
            ) {
              return;
            }
            if (window.location.pathname !== '/') {
              setTimeout(loadPopunderScript, 1000);
            }
          };

          window.addEventListener('scroll', handlePopScroll, { passive: true });
          document.addEventListener('click', handlePopClick, { passive: true });
        }
      } else if (existingPopScript) {
        existingPopScript.remove();
      }

      // Adsterra Social Bar injection / removal
      const socialBarScriptId = 'adsterra-socialbar-script';
      const socialScript = document.getElementById(socialBarScriptId) as HTMLScriptElement | null;
      if ((provider === 'adsterra' || provider === 'both') && socialBarEnabled && !isHomePage) {
        if (!socialScript) {
          const newSocialScript = document.createElement('script');
          newSocialScript.id = socialBarScriptId;
          newSocialScript.src = getAdNetworkEndpoint('socialbar');
          document.body.appendChild(newSocialScript);
        }
      } else if (socialScript) {
        socialScript.remove();
      }

      // Google AdSense injection if active
      if ((provider === 'google' || provider === 'both') && clientId) {
        if (!document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }
      }

      window.dispatchEvent(new Event('adconfigchange'));
    };

    fetch('/api/system/settings')
      .then((res) => res.json())
      .then((data) => syncAdNetwork(data))
      .catch(() => {
        // Fallback for static cPanel deployment without Node.js
        syncAdNetwork({
          adProvider: localStorage.getItem('seotools_ad_provider') || 'adsterra',
          adsterraPopunder: localStorage.getItem('seotools_adsterra_popunder') === 'true',
          adsterraSocialBar: localStorage.getItem('seotools_adsterra_socialbar') === 'true',
          adsterraNativeBanner: localStorage.getItem('seotools_adsterra_native') === 'true',
          adsenseClientId: localStorage.getItem('seotools_adsense_client_id') || '',
          adsenseSlotId: localStorage.getItem('seotools_adsense_slot_id') || '',
        });
      });

    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  const handleQuickAnalyze = (url: string) => {
    setQuickAnalyzeUrl(url);
    if (currentPath !== '/') {
      window.history.pushState({}, '', `/?analyze=${encodeURIComponent(url)}`);
      setCurrentPath('/');
    }
  };

  // Route matching
  const renderRoute = () => {
    // 1. Home
    if (currentPath === '/' || currentPath === '') {
      return <HomePage initialAnalyzeUrl={quickAnalyzeUrl} />;
    }

    // 2. All Tools Directory
    if (currentPath === '/tools') {
      return <ToolsDirectoryPage />;
    }

    // 3. Individual Tool Page (/tools/:slug)
    if (currentPath.startsWith('/tools/')) {
      const slug = currentPath.replace('/tools/', '').replace(/\/$/, '');
      const tool = TOOLS.find((t) => t.slug === slug);
      if (tool) {
        return <ToolDetailPage tool={tool} />;
      }
      return <ToolsDirectoryPage />;
    }

    // 4. Cluster Landing Pages
    const clusterSlugs = [
      'free-seo-tools',
      'seo-audit',
      'seo-report',
      'seo-tools',
      'free-seo-report',
      'seo-report-generator',
      'seo-checker',
      'website-seo-checker',
      'seo-score',
      'seo-score-checker',
      'seo-analysis',
      'technical-seo',
      'on-page-seo',
    ];
    const pathSlug = currentPath.replace(/^\//, '').replace(/\/$/, '');
    if (clusterSlugs.includes(pathSlug)) {
      return <ClusterLandingPage slug={pathSlug} />;
    }

    // 5. Blog Index & Blog Posts
    if (currentPath === '/blog') {
      return <BlogIndexPage />;
    }
    if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '').replace(/\/$/, '');
      const post = BLOG_POSTS.find((p) => p.slug === slug);
      if (post) {
        return <BlogPostPage post={post} />;
      }
      return <BlogIndexPage />;
    }

    // 6. Public Shared Report (/report/:token or shortened /r/:token)
    if (currentPath.startsWith('/report/') || currentPath.startsWith('/r/')) {
      const token = currentPath.startsWith('/r/')
        ? currentPath.replace('/r/', '').replace(/\/$/, '')
        : currentPath.replace('/report/', '').replace(/\/$/, '');
      return <PublicReportPage token={token} />;
    }

    // 7. Information & Trust Pages
    if (currentPath === '/about') {
      return <AboutPage />;
    }
    if (currentPath === '/contact') {
      return <ContactPage />;
    }
    if (currentPath === '/seo-score-methodology') {
      return <MethodologyPage />;
    }
    if (currentPath === '/how-it-works') {
      return <LegalPages type="how-it-works" />;
    }
    if (currentPath === '/privacy-policy') {
      return <LegalPages type="privacy" />;
    }
    if (currentPath === '/terms') {
      return <LegalPages type="terms" />;
    }
    if (currentPath === '/cookie-policy') {
      return <LegalPages type="cookies" />;
    }

    // 8. Audit History & Progression Tracker
    if (currentPath === '/audit-history' || currentPath === '/history') {
      return <AuditHistoryPage />;
    }

    // 9. Admin Control Panel
    if (currentPath === '/admin') {
      return <AdminPage />;
    }

    // 404 Fallback -> Home
    return <HomePage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white font-sans pb-28 sm:pb-32">
      <AdBlockDetector />
      <Navbar onQuickAnalyze={handleQuickAnalyze} />
      <main className="flex-1">
        {renderRoute()}
      </main>
      <Footer />
      <StickyBottomBanner isVisible={hasInteractedOrScrolled} />
    </div>
  );
}
