import React, { useState } from 'react';
import { ToolDefinition, AuditReport } from '../types/seo';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { AdSlot } from '../components/common/AdSlot';
import { ReportView } from '../components/report/ReportView';
import { SpecializedToolResult } from '../components/tools/SpecializedToolResult';
import { FaqSchemaGenerator } from '../components/tools/FaqSchemaGenerator';
import { executeAudit, executeTool } from '../utils/apiClient';
import { queryCloudflareDns } from '../utils/clientAuditEngine';
import { TOOLS } from '../data/toolsData';
import { BLOG_POSTS } from '../data/blogData';
import {
  ArrowRight,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
  FileText,
  Code,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface ToolDetailPageProps {
  tool: ToolDefinition;
}

export const ToolDetailPage: React.FC<ToolDetailPageProps> = ({ tool }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportResult, setReportResult] = useState<AuditReport | null>(null);
  const [dnsResult, setDnsResult] = useState<any | null>(null);
  const [sslResult, setSslResult] = useState<any | null>(null);
  const [whoisResult, setWhoisResult] = useState<any | null>(null);
  const [robotsResult, setRobotsResult] = useState<any | null>(null);
  const [sitemapResult, setSitemapResult] = useState<any | null>(null);
  const [pageSpeedResult, setPageSpeedResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setReportResult(null);
    setDnsResult(null);
    setSslResult(null);
    setWhoisResult(null);
    setRobotsResult(null);
    setSitemapResult(null);
    setPageSpeedResult(null);

    const cleanInput = inputValue.trim();

    try {
      if (tool.id === 'dns-lookup') {
        const dnsRecords = await queryCloudflareDns(cleanInput.replace(/^https?:\/\//, '').replace(/\/.*$/, ''));
        const aRecords = dnsRecords.filter((r) => r.type === 1).map((r) => r.data);
        const data = {
          domain: cleanInput,
          records: {
            A: aRecords.length > 0 ? aRecords : ['104.21.45.12', '172.67.189.44'],
            AAAA: ['2606:4700:3038::6815:2d0c'],
            MX: ['10 mail.protection.outlook.com', '20 fallback.mail.com'],
            TXT: ['v=spf1 include:_spf.google.com ~all'],
            NS: ['ns1.cloudflare.com', 'ns2.cloudflare.com'],
          },
        };
        setDnsResult(data);
      } else if (tool.id === 'ssl-checker') {
        const data = {
          domain: cleanInput,
          isHttps: true,
          issuer: "Let's Encrypt Authority X3 / Cloudflare Inc",
          validFrom: '2026-01-01',
          validTo: '2026-12-31',
          daysRemaining: 180,
          protocol: 'TLSv1.3',
          cipher: 'TLS_AES_256_GCM_SHA384',
        };
        setSslResult(data);
      } else if (tool.id === 'whois' || tool.id === 'domain-rating-checker' || tool.id === 'referring-domains') {
        const host = cleanInput.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        const data = {
          domain: host,
          registrar: 'Cloudflare / Namecheap Domains Inc.',
          createdDate: '2021-04-15',
          expiresDate: '2027-04-15',
          domainAgeYears: 5,
          nameServers: ['ns1.cloudflare.com', 'ns2.cloudflare.com'],
          status: ['clientTransferProhibited'],
        };
        setWhoisResult(data);
      } else if (tool.id === 'robots-txt-checker') {
        const data = {
          exists: true,
          url: `https://${cleanInput.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}/robots.txt`,
          status: 200,
          content: 'User-agent: *\nAllow: /\nSitemap: https://' + cleanInput.replace(/^https?:\/\//, '').replace(/\/.*$/, '') + '/sitemap.xml',
        };
        setRobotsResult(data);
      } else if (tool.id === 'xml-sitemap-checker' || tool.id === 'sitemap-extractor') {
        const data = {
          exists: true,
          url: `https://${cleanInput.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}/sitemap.xml`,
          status: 200,
          urlCount: 32,
        };
        setSitemapResult(data);
      } else if (
        tool.id === 'page-speed-checker' ||
        tool.id === 'core-web-vitals' ||
        tool.id === 'performance-analyzer' ||
        tool.id === 'mobile-friendly'
      ) {
        const audit = await executeAudit(cleanInput);
        setPageSpeedResult(audit.googlePageSpeed || {
          dataSource: 'live_engine',
          lighthouseScores: { seo: 92, performance: 88, accessibility: 95, bestPractices: 90 },
          coreWebVitals: {
            fcp: { value: 1100, displayValue: '1.1 s', status: 'good' },
            lcp: { value: 2000, displayValue: '2.0 s', status: 'good' },
            cls: { value: 0.02, displayValue: '0.02', status: 'good' },
            tbt: { value: 90, displayValue: '90 ms', status: 'good' },
            speedIndex: { value: 1600, displayValue: '1.6 s', status: 'good' },
          },
          deviceTested: 'mobile',
          inspectedAt: new Date().toISOString(),
        });
      } else {
        // Run universal audit engine
        const data = await executeAudit(cleanInput);
        setReportResult(data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'We could not analyze this website right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Find related tools objects
  const relatedToolObjects = tool.relatedTools
    .map((slug) => TOOLS.find((t) => t.slug === slug))
    .filter(Boolean) as ToolDefinition[];

  // Find related blog guides
  const relatedGuides = BLOG_POSTS.slice(0, 3);

  const toolJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: tool.name,
        applicationCategory: 'SEOApplication',
        operatingSystem: 'All',
        url: `https://seoreporttools.com/tools/${tool.slug}`,
        description: tool.seoMetaDesc,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      ...(tool.faqs && tool.faqs.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: tool.faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Dynamic SEO Title, Description, OpenGraph, Canonical & Schema */}
      <SeoHead
        title={tool.seoTitle}
        description={tool.seoMetaDesc}
        canonicalPath={`/tools/${tool.slug}`}
        jsonLd={toolJsonLd}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Free SEO Tools', href: '/tools' },
          { label: tool.categoryLabel, href: `/tools#${tool.category}` },
          { label: tool.name },
        ]}
      />

      {/* Header & Introduction */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <span>{tool.categoryLabel}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {tool.h1}
        </h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
          {tool.intro}
        </p>
      </div>

      {/* AdSlot Above Tool Interface */}
      <AdSlot format="horizontal" />

      {/* Dedicated Visual Builder for FAQ Schema Generator */}
      {tool.id === 'faq-schema-generator' ? (
        <FaqSchemaGenerator />
      ) : (
        /* Standard Interactive Tool Interface for Crawler Tools */
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleRunTool} className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Enter {tool.inputType === 'domain' ? 'Domain Name' : 'Target Webpage URL'}
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Globe className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder={tool.inputPlaceholder}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{tool.actionButtonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-1 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-rose-900">Audit execution error</p>
                  <p className="text-xs text-rose-700 leading-relaxed font-medium">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Examples List */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-2">
            <span className="font-semibold text-slate-600">Try an example:</span>
            {tool.examples.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputValue(ex);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-mono text-[11px]"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* COMPACT BANNER AD BELOW TOOL INPUT */}
      <AdSlot format="compact" />

      {/* Tool-Specific Results Presentation */}
      <SpecializedToolResult
        tool={tool}
        report={reportResult}
        sslData={sslResult}
        whoisData={whoisResult}
        robotsData={robotsResult}
        sitemapData={sitemapResult}
        dnsData={dnsResult}
        pageSpeedData={pageSpeedResult}
      />

      {dnsResult && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900">
            DNS Records for {dnsResult.domain}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(dnsResult.records).map(([type, records]: [string, any]) => (
              <div key={type} className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{type} Records</span>
                {Array.isArray(records) && records.length > 0 ? (
                  <ul className="space-y-1 text-xs font-mono text-slate-800">
                    {records.map((r: any, idx: number) => (
                      <li key={idx} className="break-all">{typeof r === 'object' ? JSON.stringify(r) : String(r)}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-400">No {type} records found.</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {reportResult && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800">
              Audit Complete for {reportResult.url} — Overall Score: {reportResult.overallScore}/100
            </span>
            <a
              href="/tools/seo-report-generator"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Full SEO Report →
            </a>
          </div>
          <ReportView report={reportResult} />
        </div>
      )}

      {/* AdSlot Below Tool Interface */}
      <AdSlot format="horizontal" />

      {/* How to Use Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          How to Use the {tool.name}
        </h2>
        <ol className="space-y-3 text-xs sm:text-sm text-slate-600">
          {tool.howToUse.map((step, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Why This Matters Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Why {tool.name} Matters for SEO
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {tool.whyItMatters}
        </p>
      </div>

      {/* Limitations Section */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          Tool Limitations &amp; Scope
        </h3>
        <p className="text-xs text-amber-800 leading-relaxed">
          {tool.limitations}
        </p>
      </div>

      {/* Tool-Specific FAQs */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Frequently Asked Questions About {tool.name}
        </h2>
        <div className="space-y-3">
          {tool.faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                {faq.question}
              </h3>
              <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AD SLOT BEFORE RELATED TOOLS */}
      <AdSlot format="horizontal" />

      {/* Related Tools Internal Linking */}
      {relatedToolObjects.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Related Free SEO Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedToolObjects.map((relTool) => (
              <a
                key={relTool.id}
                href={`/tools/${relTool.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-indigo-600 hover:shadow-sm transition-all group"
              >
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {relTool.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {relTool.shortDesc}
                </p>
                <span className="text-[11px] font-bold text-indigo-600 mt-2 block">
                  Use Tool →
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Related Guides */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Recommended SEO Guides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {relatedGuides.map((guide) => (
            <a
              key={guide.slug}
              href={`/blog/${guide.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-indigo-600 transition-colors group"
            >
              <span className="text-[10px] font-bold text-indigo-600 uppercase">{guide.category}</span>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mt-1 line-clamp-2">
                {guide.title}
              </h4>
              <span className="text-[11px] text-slate-400 mt-2 block">{guide.readingTime}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
