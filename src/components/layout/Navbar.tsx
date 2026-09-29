import React, { useState } from 'react';
import {
  Search,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Zap,
  FileText,
  Sparkles,
  BarChart3,
  Layers,
  Code,
  History,
} from 'lucide-react';

interface NavbarProps {
  onQuickAnalyze?: (url: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onQuickAnalyze }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      if (onQuickAnalyze) {
        onQuickAnalyze(quickInput.trim());
      } else {
        window.location.href = `/?analyze=${encodeURIComponent(quickInput.trim())}`;
      }
    }
  };

  const toolCategories = [
    {
      name: 'SEO Reports & Audits',
      icon: FileText,
      items: [
        { name: 'SEO Report Generator', href: '/tools/seo-report-generator', desc: 'Complete 360° website audit' },
        { name: 'Website SEO Checker', href: '/tools/website-seo-checker', desc: 'Instant on-page diagnostics' },
        { name: 'AI SEO Advisor', href: '/tools/ai-seo-advisor', desc: 'Smart action plans by Gemini' },
      ],
    },
    {
      name: 'On-Page & Metadata',
      icon: Code,
      items: [
        { name: 'FAQ Schema Generator', href: '/tools/faq-schema-generator', desc: 'JSON-LD rich FAQ snippets' },
        { name: 'Meta Tag Analyzer', href: '/tools/meta-tag-analyzer', desc: 'Title, description & viewport' },
        { name: 'Title Tag Checker', href: '/tools/title-tag-checker', desc: 'SERP truncation & pixel widths' },
        { name: 'Heading Analyzer', href: '/tools/heading-analyzer', desc: 'H1–H6 semantic hierarchy' },
      ],
    },
    {
      name: 'Technical & Crawl',
      icon: Layers,
      items: [
        { name: 'Robots.txt Checker', href: '/tools/robots-txt-checker', desc: 'Directives & crawl safety' },
        { name: 'XML Sitemap Checker', href: '/tools/xml-sitemap-checker', desc: 'Indexable URL validator' },
        { name: 'Canonical URL Checker', href: '/tools/canonical-checker', desc: 'Duplicate content protection' },
      ],
    },
    {
      name: 'Speed & Security',
      icon: Zap,
      items: [
        { name: 'Page Speed Checker', href: '/tools/page-speed-checker', desc: 'TTFB & document weight' },
        { name: 'Core Web Vitals', href: '/tools/core-web-vitals', desc: 'LCP, INP, & CLS readiness' },
        { name: 'SSL & Security Headers', href: '/tools/security-headers', desc: 'HSTS, CSP & HTTPS health' },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 px-4 py-1.5 text-center text-[11px] font-medium text-slate-200">
        <span className="inline-flex items-center gap-1.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">100% Free SEO Tools. Forever.</span>
          <span className="hidden sm:inline text-slate-400">— No login, no credit cards, no paywalls.</span>
        </span>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                SEO Report Tools
              </span>
              <span className="block text-[10px] font-semibold text-indigo-600 uppercase tracking-widest leading-none">
                Free SEO Tools. Forever.
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {/* Tools Mega Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsToolsDropdownOpen(true)}
            onMouseLeave={() => setIsToolsDropdownOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-lg transition-colors"
              onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
            >
              <span>Free SEO Tools</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isToolsDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
            </button>

            {isToolsDropdownOpen && (
              <div className="absolute top-full -left-20 w-[640px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="grid grid-cols-2 gap-6">
                  {toolCategories.map((cat, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <cat.icon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{cat.name}</span>
                      </div>
                      <div className="space-y-1">
                        {cat.items.map((item, i) => (
                          <a
                            key={i}
                            href={item.href}
                            className="block rounded-lg p-2 text-left transition-colors hover:bg-slate-50 group"
                          >
                            <div className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {item.desc}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a href="/tools" className="font-bold text-indigo-600 hover:text-indigo-700">
                    Explore all 30 Free SEO Tools →
                  </a>
                  <a href="/seo-score-methodology" className="text-slate-500 hover:text-slate-900">
                    Scoring Methodology
                  </a>
                </div>
              </div>
            )}
          </div>

          <a href="/seo-audit" className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-lg transition-colors">
            SEO Audit
          </a>
          <a href="/technical-seo" className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-lg transition-colors">
            Technical SEO
          </a>
          <a href="/on-page-seo" className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-lg transition-colors">
            On-Page SEO
          </a>
          <a href="/blog" className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-lg transition-colors">
            Guides &amp; Blog
          </a>
          <a href="/audit-history" className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 rounded-lg transition-colors flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span>Score History</span>
          </a>
        </nav>

        {/* Quick URL form & CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <form onSubmit={handleQuickSubmit} className="relative">
            <input
              type="text"
              placeholder="example.com"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              className="w-48 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </form>

          <a
            href="/tools/seo-report-generator"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Generate Report
          </a>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleQuickSubmit} className="relative">
            <input
              type="text"
              placeholder="Analyze any website URL..."
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-sm pt-2">
            <a href="/tools" className="font-semibold text-slate-800 p-2 rounded hover:bg-slate-50">
              All 30 Free Tools
            </a>
            <a href="/seo-audit" className="font-semibold text-slate-800 p-2 rounded hover:bg-slate-50">
              SEO Audit Tool
            </a>
            <a href="/technical-seo" className="font-semibold text-slate-800 p-2 rounded hover:bg-slate-50">
              Technical SEO
            </a>
            <a href="/on-page-seo" className="font-semibold text-slate-800 p-2 rounded hover:bg-slate-50">
              On-Page SEO
            </a>
            <a href="/tools/ai-seo-advisor" className="font-semibold text-indigo-600 p-2 rounded hover:bg-indigo-50 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI SEO Advisor
            </a>
            <a href="/audit-history" className="font-semibold text-indigo-600 p-2 rounded hover:bg-indigo-50 flex items-center gap-1">
              <History className="w-3.5 h-3.5" /> Score History
            </a>
            <a href="/blog" className="font-semibold text-slate-800 p-2 rounded hover:bg-slate-50">
              SEO Guides
            </a>
            <a href="/seo-score-methodology" className="font-semibold text-slate-800 p-2 rounded hover:bg-slate-50">
              Score Methodology
            </a>
            <a href="/about" className="font-semibold text-slate-800 p-2 rounded hover:bg-slate-50">
              About &amp; Trust
            </a>
          </div>

          <a
            href="/tools/seo-report-generator"
            className="w-full flex items-center justify-center rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"
          >
            Generate Free SEO Report
          </a>
        </div>
      )}
    </header>
  );
};
