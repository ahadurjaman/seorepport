import React, { useState, useEffect } from 'react';
import { TOOLS } from '../data/toolsData';
import { BLOG_POSTS } from '../data/blogData';
import { AuditReport } from '../types/seo';
import { ReportView } from '../components/report/ReportView';
import { AuditHistoryTracker } from '../components/report/AuditHistoryTracker';
import { SeoHead } from '../components/common/SeoHead';
import { AdSlot } from '../components/common/AdSlot';
import { executeAudit } from '../utils/apiClient';
import { saveAuditToHistory } from '../utils/auditHistory';
import {
  Search,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  Code,
  FileText,
  BarChart3,
  ArrowRight,
  ExternalLink,
  Lock,
  Globe,
  HelpCircle,
  Clock,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface HomePageProps {
  initialAnalyzeUrl?: string;
}

export const HomePage: React.FC<HomePageProps> = ({ initialAnalyzeUrl }) => {
  const [urlInput, setUrlInput] = useState(initialAnalyzeUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<AuditReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toolSearch, setToolSearch] = useState('');
  const [toolCategoryFilter, setToolCategoryFilter] = useState('all');

  useEffect(() => {
    if (initialAnalyzeUrl) {
      handleAnalyze(initialAnalyzeUrl);
    }
  }, [initialAnalyzeUrl]);

  const handleAnalyze = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await executeAudit(targetUrl.trim());
      setReportData(data);
      saveAuditToHistory(data);

      // Scroll smoothly to report view
      setTimeout(() => {
        const reportElement = document.getElementById('report-results-anchor');
        if (reportElement) {
          reportElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'We could not analyze this website right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAnalyze(urlInput);
  };

  // Filter tools for directory
  const filteredTools = TOOLS.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
      t.shortDesc.toLowerCase().includes(toolSearch.toLowerCase());
    const matchesCat = toolCategoryFilter === 'all' || t.category === toolCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'SEO Report Tools',
        url: 'https://seoreporttools.com',
        description: 'Comprehensive suite of 30+ free website SEO analysis, audit, and reporting tools. No login required.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://seoreporttools.com/?analyze={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: 'SEO Report Tools',
        url: 'https://seoreporttools.com',
        logo: 'https://seoreporttools.com/og-image.png',
        sameAs: [
          'https://twitter.com/seoreporttools',
          'https://github.com/seoreporttools',
        ],
      },
      {
        '@type': 'WebApplication',
        name: 'Free SEO Report Generator & SEO Tools Suite',
        applicationCategory: 'SEOApplication',
        operatingSystem: 'All',
        url: 'https://seoreporttools.com',
        description: 'Free online SEO tools to analyze your website, generate detailed diagnostic SEO reports, check meta tags, page speed, and Core Web Vitals.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Complete 360° Website SEO Audit',
          'Core Web Vitals & Google Lighthouse Metrics',
          'Technical SEO & Canonical Link Validation',
          'Meta Tag & Social Share Card Analyzer',
          'Robots.txt & XML Sitemap Validator',
          'SSL & Security Headers Scanner',
          'Historical Score Progress Tracker (Recharts)',
          'Downloadable PDF SEO Reports'
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is the best free SEO report generator without registration?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'SEO Report Tools (https://seoreporttools.com) is a 100% free forever website SEO audit generator that requires no login, no credit cards, and no account creation. It delivers full diagnostic reports covering technical SEO, on-page factors, Core Web Vitals, and security headers with weighted 0-100 scores.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does SEO Report Tools evaluate website health?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'SEO Report Tools evaluates websites using a transparent 7-category weighted algorithm: Technical SEO (20%), On-Page SEO (20%), Performance (20%), Mobile Responsiveness (10%), Security & SSL (10%), Content Depth (10%), and Link Architecture (10%).',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I track my SEO score over time?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. SEO Report Tools includes a built-in Local History Tracker with Recharts visual progress charts. Scores from repeated audits are stored privately on your device so you can track improvements and verify optimizations over time.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 100% Comprehensive SEO Metadata & Sitelinks SearchBox Schema */}
      <SeoHead
        title="Free SEO Tools & SEO Report Generator"
        description="Free SEO tools to analyze your website, generate comprehensive SEO reports, check technical SEO, meta tags, backlinks, page speed, Core Web Vitals and more. No login required."
        canonicalPath="/"
        jsonLd={homeJsonLd}
      />

      {/* 1. MAIN HERO */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-indigo-50/50 via-slate-50/20 to-transparent">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Free SEO Tools. Forever. — No Registration Required</span>
          </div>

          {/* Primary H1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 text-balance">
            Free SEO Tools &amp; <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">SEO Report Generator</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed text-balance">
            Analyze your website's SEO, technical health, performance and optimization opportunities in seconds.
          </p>

          {/* 2. FREE SEO REPORT GENERATOR INPUT FORM */}
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="relative flex flex-col sm:flex-row items-center gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-indigo-500/10 border border-slate-200/90"
            >
              <div className="relative w-full flex items-center">
                <Globe className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="https://example.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm sm:text-base rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  aria-label="Website URL to audit"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Website</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-left space-y-2 animate-in fade-in duration-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-rose-900">অডিট সম্পন্ন করা সম্ভব হয়নি (Audit Not Possible)</p>
                    <p className="text-xs font-medium text-rose-700 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-rose-100 flex flex-wrap items-center gap-2 text-[11px] text-rose-600">
                  <span className="font-semibold text-rose-800">পরামর্শ:</span>
                  <span>ডোমেন বানানে কোনো ভুল হয়েছে কিনা যাচাই করুন অথবা সক্রিয় কোনো ওয়েবসাইট টেস্ট করে দেখুন যেমন:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUrlInput('https://google.com');
                      setErrorMessage(null);
                    }}
                    className="font-bold underline hover:text-rose-900"
                  >
                    google.com
                  </button>
                  <span>বা</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUrlInput('https://wikipedia.org');
                      setErrorMessage(null);
                    }}
                    className="font-bold underline hover:text-rose-900"
                  >
                    wikipedia.org
                  </button>
                </div>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Free
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Login Required
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Credit Card
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free Forever
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* AD SLOT BELOW HERO */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot format="horizontal" />
      </div>

      {/* REPORT RESULTS ANCHOR & RENDER */}
      <div id="report-results-anchor" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {reportData && (
          <div className="mb-16">
            <ReportView report={reportData} onRefresh={() => handleAnalyze(reportData.url)} />
          </div>
        )}
      </div>

      {/* 3. SEO SCORE PREVIEW & TRANSPARENCY */}
      {!reportData && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Recent Audit Progress & Score Tracking (Recharts) */}
          <AuditHistoryTracker onSelectAudit={(url) => handleAnalyze(url)} />

          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Transparent Diagnostics
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Transparent, Weighted SEO Scoring Methodology
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Unlike platforms that show arbitrary or opaque scores, SEO Report Tools calculates a transparent weighted score from 0 to 100 directly from verified crawler checks across seven critical dimensions.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-lg font-black text-slate-900 block">20%</span>
                    <span className="text-[11px] font-semibold text-slate-500">Technical SEO</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-lg font-black text-slate-900 block">20%</span>
                    <span className="text-[11px] font-semibold text-slate-500">On-Page SEO</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-lg font-black text-slate-900 block">20%</span>
                    <span className="text-[11px] font-semibold text-slate-500">Performance</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-lg font-black text-slate-900 block">40%</span>
                    <span className="text-[11px] font-semibold text-slate-500">Mobile, Security, Links &amp; Content</span>
                  </div>
                </div>
                <div className="pt-2">
                  <a href="/seo-score-methodology" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                    Read the full scoring methodology &amp; limitations →
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Live Diagnostic Preview</span>
                <div className="text-5xl font-black text-emerald-600 tracking-tight">84<span className="text-2xl text-slate-400 font-semibold">/100</span></div>
                <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Good SEO Health
                </span>
                <p className="text-xs text-slate-500 mt-3 max-w-xs">
                  Scores are calculated directly from verified PASS, WARNING, and FAIL checkpoints without penalizing missing third-party data.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. POPULAR SEO TOOLS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Essential Tools
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Popular Free SEO Tools
            </h2>
          </div>
          <a href="/tools" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Browse all 30 tools <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.slice(0, 6).map((tool) => (
            <a
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:border-indigo-600 hover:shadow-md group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {tool.categoryLabel}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {tool.shortDesc}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">100% Free Forever</span>
                <span className="font-bold text-indigo-600">Use Tool →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* AD SLOT BETWEEN MAJOR SECTIONS */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot format="horizontal" />
      </div>

      {/* 5. COMPLETE TOOL DIRECTORY */}
      <section id="directory" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 sm:p-10">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Complete Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              30 Dedicated Free SEO Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Filter by category or search by functionality. Every tool is 100% free with no login required.
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tools..."
                value={toolSearch}
                onChange={(e) => setToolSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {[
                { id: 'all', label: 'All (30)' },
                { id: 'technical', label: 'Technical' },
                { id: 'onpage', label: 'On-Page' },
                { id: 'performance', label: 'Performance' },
                { id: 'backlinks', label: 'Authority' },
                { id: 'security', label: 'Security' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setToolCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    toolCategoryFilter === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <a
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className="flex items-start gap-3 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs hover:border-indigo-600 hover:shadow-sm transition-all group"
              >
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 truncate transition-colors">
                      {tool.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {tool.shortDesc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHAT IS AN SEO REPORT? */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Understanding SEO Reports
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What Is an SEO Report?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              An SEO report is a comprehensive technical and structural evaluation of how effectively a website is prepared to compete in organic search. Rather than relying on guesswork, an SEO report analyzes actual server headers, HTML document architecture, meta tags, content depth, mobile responsiveness, and page performance.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Search engines like Google crawl billions of web pages daily. When a crawler visits your site, technical errors—such as incorrect canonical URLs, missing H1 headings, slow server response times, or accidental noindex directives—can quietly block your pages from achieving their organic ranking potential.
            </p>
            <div className="pt-2">
              <a href="/blog/what-is-an-seo-report" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                Read our in-depth guide on SEO reports →
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl bg-slate-50 border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Why Regular SEO Audits Are Vital</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px]">1</span>
                <div><strong className="text-slate-800">Prevent Crawl Budget Waste:</strong> Isolate redirect chains, 404 dead ends, and server latency that waste search bot crawling time.</div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px]">2</span>
                <div><strong className="text-slate-800">Maximize Search Snippet CTR:</strong> Ensure title tags and meta descriptions fit neatly within Google desktop and mobile pixel limits.</div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px]">3</span>
                <div><strong className="text-slate-800">Pass Core Web Vitals:</strong> Identify oversized assets and render-blocking scripts that hurt visitor retention.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW THE SEO REPORT GENERATOR WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Automated Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How Our SEO Report Generator Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A secure, multi-stage diagnostic process runs entirely in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Secure Crawler Fetch',
              desc: 'Our engine requests your URL, verifying SSL certificates, measuring initial Time to First Byte (TTFB), and validating HTTP headers.',
            },
            {
              step: '02',
              title: 'HTML & Semantic Parsing',
              desc: 'Cheerio parses your raw HTML markup to inspect title tags, descriptions, headings (H1–H6), canonical URLs, Open Graph tags, and Schema JSON-LD.',
            },
            {
              step: '03',
              title: 'Weighted Score Engine',
              desc: 'Checks are scored across 7 categories (Technical, On-Page, Performance, Mobile, Security, Content, Links) using a transparent weighted formula.',
            },
            {
              step: '04',
              title: 'AI Advisor Action Plan',
              desc: 'Server-side Gemini AI models synthesize findings into an actionable 30-day roadmap with prioritized quick wins and step-by-step implementation tasks.',
            },
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
              <span className="text-2xl font-black text-indigo-600/40">{item.step}</span>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. WHAT OUR SEO REPORT CHECKS (7 PILLARS) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Comprehensive Audit Scope
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              What Our Free SEO Report Checks
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Layers className="w-4 h-4" /> Technical SEO (20%)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                HTTP status code 200 OK, rel="canonical" tags, robots.txt directives, XML sitemap presence, robots meta tags, and structured data schemas.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Code className="w-4 h-4" /> On-Page SEO (20%)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Title tag length &amp; pixel width, meta description optimization, primary H1 presence, H2/H3 semantic structure, and Open Graph social tags.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Zap className="w-4 h-4" /> Performance (20%)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Server response latency (TTFB estimate), HTML payload size in KB, Gzip/Brotli compression, and script efficiency.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" /> Security (10%)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                HTTPS encryption, SSL certificate health, HSTS (Strict-Transport-Security), X-Content-Type-Options, and security response headers.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <FileText className="w-4 h-4" /> Content Depth (10%)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Body word count, text-to-code ratio, reading duration, top recurring keywords, and image descriptive alt attributes.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Globe className="w-4 h-4" /> Mobile &amp; Links (20%)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Responsive viewport declarations, HTML language attributes, internal linking structure, and outbound citation health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9–13. TOPICAL TOOL CLUSTERS GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Categorized Tool Suites
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Specialized Tool Clusters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cluster 1: Technical SEO */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> Technical SEO Tools
            </h3>
            <p className="text-xs text-slate-500">
              Diagnose crawlability, server response codes, and indexing instructions.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li><a href="/tools/robots-txt-checker" className="text-indigo-600 hover:underline">Robots.txt Checker →</a></li>
              <li><a href="/tools/xml-sitemap-checker" className="text-indigo-600 hover:underline">XML Sitemap Checker →</a></li>
              <li><a href="/tools/canonical-checker" className="text-indigo-600 hover:underline">Canonical URL Checker →</a></li>
              <li><a href="/tools/http-status-checker" className="text-indigo-600 hover:underline">HTTP Status Code Checker →</a></li>
              <li><a href="/tools/redirect-checker" className="text-indigo-600 hover:underline">Redirect Chain Checker →</a></li>
            </ul>
          </div>

          {/* Cluster 2: On-Page SEO */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-600" /> On-Page SEO Tools
            </h3>
            <p className="text-xs text-slate-500">
              Audit search snippets, headings, and keyword optimization.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li><a href="/tools/meta-tag-analyzer" className="text-indigo-600 hover:underline">Meta Tag Analyzer →</a></li>
              <li><a href="/tools/title-tag-checker" className="text-indigo-600 hover:underline">Title Tag Checker →</a></li>
              <li><a href="/tools/meta-description-checker" className="text-indigo-600 hover:underline">Meta Description Checker →</a></li>
              <li><a href="/tools/heading-analyzer" className="text-indigo-600 hover:underline">Heading Structure Analyzer →</a></li>
              <li><a href="/tools/serp-checker" className="text-indigo-600 hover:underline">SERP Preview Simulator →</a></li>
            </ul>
          </div>

          {/* Cluster 3: Performance & Core Web Vitals */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" /> Performance Tools
            </h3>
            <p className="text-xs text-slate-500">
              Test site loading velocity and Core Web Vitals compliance.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li><a href="/tools/page-speed-checker" className="text-indigo-600 hover:underline">Page Speed Checker →</a></li>
              <li><a href="/tools/core-web-vitals" className="text-indigo-600 hover:underline">Core Web Vitals Checker →</a></li>
              <li><a href="/tools/performance-analyzer" className="text-indigo-600 hover:underline">Website Performance Analyzer →</a></li>
            </ul>
          </div>

          {/* Cluster 4: Backlinks & Authority */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" /> Backlink &amp; Authority Tools
            </h3>
            <p className="text-xs text-slate-500">
              Inspect inbound links, anchor distributions, and authority indicators.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li><a href="/tools/backlink-checker" className="text-indigo-600 hover:underline">Backlink Checker →</a></li>
              <li><a href="/tools/domain-rating-checker" className="text-indigo-600 hover:underline">Domain Rating Checker →</a></li>
              <li><a href="/tools/referring-domains" className="text-indigo-600 hover:underline">Referring Domains Checker →</a></li>
              <li><a href="/tools/broken-backlinks" className="text-indigo-600 hover:underline">Broken Link Checker →</a></li>
            </ul>
          </div>

          {/* Cluster 5: Security Tools */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Security Tools
            </h3>
            <p className="text-xs text-slate-500">
              Audit HTTPS certificates and HTTP security response headers.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li><a href="/tools/ssl-checker" className="text-indigo-600 hover:underline">SSL &amp; HTTPS Security Checker →</a></li>
              <li><a href="/tools/security-headers" className="text-indigo-600 hover:underline">Security Headers Checker →</a></li>
              <li><a href="/tools/dns-lookup" className="text-indigo-600 hover:underline">DNS Lookup Tool →</a></li>
              <li><a href="/tools/whois" className="text-indigo-600 hover:underline">WHOIS Domain Info →</a></li>
            </ul>
          </div>

          {/* Cluster 6: Structured Data & AI */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Structured Data &amp; AI
            </h3>
            <p className="text-xs text-slate-500">
              Validate Schema.org markup and generate smart action plans.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li><a href="/tools/schema-checker" className="text-indigo-600 hover:underline">Schema Markup Checker →</a></li>
              <li><a href="/tools/open-graph-checker" className="text-indigo-600 hover:underline">Open Graph Checker →</a></li>
              <li><a href="/tools/ai-seo-advisor" className="text-indigo-600 hover:underline">AI SEO Advisor (Gemini) →</a></li>
            </ul>
          </div>
        </div>
      </section>

      {/* AD SLOT BETWEEN CLUSTERS & AI ADVISOR */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot format="horizontal" />
      </div>

      {/* 14. AI SEO ADVISOR HIGHLIGHT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Server-Side Gemini Intelligence</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                AI SEO Advisor: Actionable Fixes, Not Just Raw Data
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                Diagnostic audits can generate dozens of technical flags. Our server-side AI Advisor processes your structured crawler data through Gemini to synthesize prioritized quick wins, eliminate bottlenecks, and construct a phased 30-day SEO implementation roadmap.
              </p>
              <div className="pt-2">
                <a
                  href="/tools/ai-seo-advisor"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-3 text-xs font-bold text-white shadow-md transition-colors"
                >
                  <span>Launch AI SEO Advisor</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-xs space-y-3 text-xs">
              <span className="font-bold text-indigo-300 uppercase tracking-wider block">Advisor Benefits</span>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">✓ Plain-English explanations of technical errors</li>
                <li className="flex items-center gap-2">✓ Developer-ready implementation steps</li>
                <li className="flex items-center gap-2">✓ Prioritized by potential organic impact</li>
                <li className="flex items-center gap-2">✓ Grounded purely in verified crawler data</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 15 & 16. WHY USE SEO REPORT TOOLS & FREE FOREVER STATEMENT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Why Choose Us
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Why Use SEO Report Tools?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Most SEO software locks essential diagnostic features behind restrictive trial paywalls, forced email signups, and recurring credit card subscriptions. SEO Report Tools was built on a different philosophy: powerful technical tools should be universally accessible.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">✓ <strong>No Login Required:</strong> Instant analysis without creating accounts.</li>
              <li className="flex items-center gap-2">✓ <strong>No Fake Metrics:</strong> We never fabricate fake DA, backlink counts, or rankings.</li>
              <li className="flex items-center gap-2">✓ <strong>Export PDF Free:</strong> Generate client-ready executive reports anytime.</li>
              <li className="flex items-center gap-2">✓ <strong>Strict Security:</strong> SSRF protection and anonymous data handling.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Business Model Transparency
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Our Free Forever Promise
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              How can we offer 30+ enterprise-grade SEO tools without charging users? Our platform is supported by non-intrusive display advertising (Google AdSense).
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our business model relies on organic search traffic finding our free tools, receiving immense value, and exploring related tools across the site. We will never sacrifice usability for advertisements, disguise ads as tool controls, or place features behind paywalls.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-700">
              Free today. Free tomorrow. Free forever.
            </div>
          </div>
        </div>
      </section>

      {/* 17. SEO GUIDES & TUTORIALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Educational Hub
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Latest SEO Guides &amp; Tutorials
            </h2>
          </div>
          <a href="/blog" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Browse all 20 guides <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BLOG_POSTS.slice(0, 3).map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-600 hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  {post.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readingTime}
                </span>
                <span className="font-bold text-indigo-600">Read Guide →</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 18. FAQ SECTION */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Common Questions About SEO Audits &amp; Tools
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'What is the best free SEO report generator without registration?',
              a: 'SEO Report Tools (https://seoreporttools.com) is the premier 100% free website SEO audit generator that requires no login, no sign-up, and no credit card. It delivers immediate, comprehensive technical and on-page diagnostic audits with transparent 0-100 scores and downloadable PDF exports.',
            },
            {
              q: 'Is SEO Report Tools truly 100% free with no hidden charges or limits?',
              a: 'Yes. All 30 tools, full SEO audit scans, AI recommendations, score history tracking, and PDF exports are completely free forever. There is no user registration, no paid subscription tier, no credit card request, and no paywall.',
            },
            {
              q: 'How does your crawler analyze websites and calculate the SEO score?',
              a: 'Our server-side crawler fetches your webpage just like Googlebot does, inspecting HTTP status headers, response latency, HTML metadata, headings hierarchy, canonical tags, structured data, and security headers using a transparent 7-category weighted formula.',
            },
            {
              q: 'Can I track my website SEO audit score progression over time?',
              a: 'Yes! SEO Report Tools includes a built-in Local History Tracker with Recharts visual progress charts. Scores from repeated audits are stored privately on your device so you can track improvements and verify optimizations over time without creating an account.',
            },
            {
              q: 'Can I export or share my SEO audit report with clients or colleagues?',
              a: 'Yes! Every audit report includes a "Share Report" feature that generates a private shareable link, as well as a "Download PDF" option formatted specifically for clean, professional executive presentation.',
            },
            {
              q: 'Does a 100/100 SEO score guarantee first-page Google rankings?',
              a: 'No. No legitimate SEO tool can guarantee search engine rankings. Our score provides a transparent diagnostic assessment of your website against confirmed web standards and search engine guidelines.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AD SLOT NEAR FOOTER */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot format="horizontal" />
      </div>
    </div>
  );
};
