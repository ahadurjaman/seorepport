import React, { useState } from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { AdSlot } from '../components/common/AdSlot';
import { ReportView } from '../components/report/ReportView';
import { TOOLS } from '../data/toolsData';
import { AuditReport } from '../types/seo';
import {
  Globe,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Code,
  Zap,
  ShieldCheck,
  FileText,
  HelpCircle,
  BarChart3,
} from 'lucide-react';

interface ClusterConfig {
  type: string;
  title: string;
  seoTitle: string;
  seoMetaDesc: string;
  h1: string;
  subtitle: string;
  contentPillars: { title: string; desc: string; icon: any }[];
  faqs: { q: string; a: string }[];
  highlightCategory?: string;
}

const CLUSTERS: Record<string, ClusterConfig> = {
  'free-seo-tools': {
    type: 'free-seo-tools',
    title: 'Free SEO Tools',
    seoTitle: 'Free SEO Tools — 30+ Website SEO Tools | SEO Report Tools',
    seoMetaDesc: 'Access 30+ completely free website SEO tools. Audit technical SEO, analyze meta tags, check backlinks, test page speed, and validate schema markup.',
    h1: 'Free SEO Tools',
    subtitle: 'Comprehensive suite of 30+ free website SEO analysis, audit, and reporting tools. No login or registration required.',
    contentPillars: [
      { title: 'SEO Audit Suite', desc: 'Holistic full-page diagnostics calculating weighted health scores.', icon: BarChart3 },
      { title: 'Technical SEO Suite', desc: 'Robots.txt, XML sitemaps, canonical tags, and HTTP response codes.', icon: Layers },
      { title: 'On-Page SEO Suite', desc: 'Meta tags, title lengths, H1–H6 headings, and SERP simulations.', icon: Code },
      { title: 'Speed & Performance', desc: 'Page speed, Time to First Byte (TTFB), and Core Web Vitals checks.', icon: Zap },
      { title: 'Security & Protocol', desc: 'HTTPS verification, SSL certificates, and HTTP security response headers.', icon: ShieldCheck },
      { title: 'Content & Density', desc: 'Word count metrics, keyword density ratios, and image alt attributes.', icon: FileText },
    ],
    faqs: [
      { q: 'Are all 30 tools genuinely free?', a: 'Yes. Every tool is 100% free with no account creation, no paywall, and no subscriptions.' },
      { q: 'How do you sustain the free platform?', a: 'We are monetized through Google AdSense display advertising, ensuring universal access for everyone.' },
    ],
  },
  'seo-audit': {
    type: 'seo-audit',
    title: 'Free SEO Audit Tool',
    seoTitle: 'Free SEO Audit Tool — Analyze Your Website | SEO Report Tools',
    seoMetaDesc: 'Run a free comprehensive website SEO audit. Check technical health, on-page optimization, page speed, mobile readiness, and security headers.',
    h1: 'Free SEO Audit Tool',
    subtitle: 'Perform a deep diagnostic website SEO audit in seconds. Discover critical errors, optimization warnings, and actionable recommendations.',
    contentPillars: [
      { title: 'Technical SEO Audit', desc: 'Detect indexation blockers, robots directives, and canonical tags.', icon: Layers },
      { title: 'On-Page SEO Audit', desc: 'Verify title tags, meta descriptions, and semantic heading structure.', icon: Code },
      { title: 'Performance Audit', desc: 'Measure server response latency, payload weight, and asset compression.', icon: Zap },
      { title: 'Security Audit', desc: 'Audit SSL encryption and critical HTTP security response headers.', icon: ShieldCheck },
    ],
    faqs: [
      { q: 'What does a complete SEO audit include?', a: 'It evaluates 7 critical areas: technical crawlability, on-page metadata, performance, mobile readiness, security, content depth, and link architecture.' },
      { q: 'How long does the audit take?', a: 'Our server-side crawler evaluates and calculates your full diagnostic report in just 3 to 6 seconds.' },
    ],
  },
  'seo-report': {
    type: 'seo-report',
    title: 'Free SEO Report',
    seoTitle: 'Free SEO Report Generator — Website SEO Audit | SEO Report Tools',
    seoMetaDesc: 'Generate a detailed free SEO report for any website. Identify critical errors, review category scores, and download an executive PDF report.',
    h1: 'Free SEO Report Generator',
    subtitle: 'Generate an executive diagnostic SEO report evaluating technical crawlability, on-page optimization, and site performance.',
    contentPillars: [
      { title: 'Executive Summary', desc: 'Get an immediate holistic score from 0 to 100 with clear status flags.', icon: BarChart3 },
      { title: 'Phased Action Plan', desc: 'AI-assisted prioritization of quick wins and developer tasks.', icon: Sparkles },
      { title: 'Free PDF Export', desc: 'Download client-ready executive reports with clean presentation.', icon: FileText },
    ],
    faqs: [
      { q: 'Can I export the SEO report to PDF?', a: 'Yes! Click "Download PDF" on any report to generate a pristine, printable document with no watermark.' },
      { q: 'Can I share the report with my team?', a: 'Yes. Use the "Share Report" button to create a private shareable link that anyone can review.' },
    ],
  },
  'seo-score': {
    type: 'seo-score',
    title: 'SEO Score Checker',
    seoTitle: 'SEO Score Checker — Check Your Website SEO Score Free',
    seoMetaDesc: 'Check your website SEO score for free. Understand your weighted technical, on-page, performance, and security score from 0 to 100.',
    h1: 'SEO Score Checker',
    subtitle: 'Understand your website diagnostic score based on a transparent, weighted 7-category evaluation system.',
    contentPillars: [
      { title: 'Technical Weight (20%)', desc: 'Crawlability, canonicalization, and indexing directives.', icon: Layers },
      { title: 'On-Page Weight (20%)', desc: 'Titles, meta descriptions, and heading structure.', icon: Code },
      { title: 'Performance Weight (20%)', desc: 'Page speed, TTFB, and document weight.', icon: Zap },
      { title: 'Mobile & Security (20%)', desc: 'Responsive viewports, SSL, and security headers.', icon: ShieldCheck },
    ],
    faqs: [
      { q: 'Is the SEO score an official Google ranking score?', a: 'No. The score is an internal diagnostic benchmark calculated by SEO Report Tools against verified search engine standards.' },
      { q: 'What is considered a good SEO score?', a: 'A score of 80 or above indicates strong technical health, while scores below 65 indicate critical blockers needing repair.' },
    ],
  },
  'technical-seo': {
    type: 'technical-seo',
    title: 'Technical SEO Suite',
    seoTitle: 'Technical SEO Checker & Tools — Free Crawl & Index Diagnostics',
    seoMetaDesc: 'Audit technical SEO health. Verify robots.txt, XML sitemaps, canonical tags, HTTP response codes, and SSL encryption free forever.',
    h1: 'Technical SEO Checker & Tools',
    subtitle: 'Ensure search engines can crawl, parse, and index your website without friction or wasted crawl budget.',
    contentPillars: [
      { title: 'Crawl Access & Robots.txt', desc: 'Prevent accidental Disallow directives from blocking important pages.', icon: Layers },
      { title: 'XML Sitemap Validation', desc: 'Ensure all indexable canonical URLs are declared properly.', icon: FileText },
      { title: 'Canonical Tag Integrity', desc: 'Consolidate ranking signals and eliminate duplicate content risks.', icon: Code },
    ],
    faqs: [
      { q: 'Why is technical SEO the foundation of rankings?', a: 'If search engines cannot crawl or render your code, even high-quality content cannot be indexed or ranked.' },
      { q: 'How often should technical SEO be checked?', a: 'At least monthly, and immediately following major website code releases or CMS updates.' },
    ],
  },
  'on-page-seo': {
    type: 'on-page-seo',
    title: 'On-Page SEO Suite',
    seoTitle: 'On-Page SEO Checker — Optimize Titles, Descriptions & Content',
    seoMetaDesc: 'Analyze on-page SEO factors. Optimize title tags, meta descriptions, heading structures, keyword density, and search snippet previews.',
    h1: 'On-Page SEO Checker & Tools',
    subtitle: 'Optimize visible webpage elements to satisfy search intent, improve topical clarity, and boost organic Click-Through Rates (CTR).',
    contentPillars: [
      { title: 'Title & Meta Optimization', desc: 'Prevent snippet truncation and craft high-converting headlines.', icon: Code },
      { title: 'Heading Structure', desc: 'Organize content with clear semantic H1, H2, and H3 hierarchies.', icon: Layers },
      { title: 'Content Depth', desc: 'Measure word counts, reading time, and topical keyword coverage.', icon: FileText },
    ],
    faqs: [
      { q: 'What is the most important on-page SEO factor?', a: 'Satisfying user search intent with comprehensive, helpful content backed by a strong title and H1 tag.' },
      { q: 'How do meta descriptions help on-page SEO?', a: 'They act as your organic search advertisement, directly influencing click-through rates.' },
    ],
  },
};

interface ClusterLandingPageProps {
  slug: string;
}

export const ClusterLandingPage: React.FC<ClusterLandingPageProps> = ({ slug }) => {
  const config = CLUSTERS[slug] || CLUSTERS['free-seo-tools'];
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportResult, setReportResult] = useState<AuditReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze website.');
      setReportResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'We could not analyze this website right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clusterJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: config.title,
        url: `https://seoreporttools.com/${config.type}`,
        description: config.seoMetaDesc,
      },
      ...(config.faqs && config.faqs.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: config.faqs.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: f.a,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 100% Comprehensive SEO Metadata & Schema */}
      <SeoHead
        title={config.seoTitle}
        description={config.seoMetaDesc}
        canonicalPath={`/${config.type}`}
        jsonLd={clusterJsonLd}
      />

      <Breadcrumbs items={[{ label: config.title }]} />

      {/* Hero Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          {config.h1}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {config.subtitle}
        </p>

        {/* Live Audit Form */}
        <form onSubmit={handleAnalyze} className="pt-4 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-2 rounded-2xl bg-white p-2 shadow-lg border border-slate-200">
            <div className="relative w-full flex items-center">
              <Globe className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="https://example.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm rounded-xl focus:outline-none text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <span>Run Free Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 text-left max-w-2xl mx-auto">
            {errorMessage}
          </div>
        )}
      </div>

      {/* AdSlot Below Search */}
      <AdSlot format="horizontal" />

      {/* Results View */}
      {reportResult && (
        <div className="space-y-6">
          <ReportView report={reportResult} />
        </div>
      )}

      {/* Pillar Cards */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 text-center">
          What Our {config.title} Analyzes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.contentPillars.map((p, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <p.icon className="w-5 h-5" />
                <span>{p.title}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AdSlot in Feed */}
      <AdSlot format="horizontal" />

      {/* Dedicated Tools Linking Grid */}
      <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Explore Relevant Free SEO Tools</h3>
            <p className="text-xs text-slate-500">Every tool is free with zero signup.</p>
          </div>
          <a href="/tools" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
            View all 30 tools →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.slice(0, 6).map((t) => (
            <a
              key={t.id}
              href={`/tools/${t.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-indigo-600 hover:shadow-sm transition-all group"
            >
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {t.name}
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {t.shortDesc}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Mid-Content Ad Slot */}
      <AdSlot format="horizontal" />

      {/* Cluster FAQs */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {config.faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
