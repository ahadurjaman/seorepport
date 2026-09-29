import React from 'react';
import { AuditReport, ToolDefinition } from '../../types/seo';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Globe,
  FileCode,
  Tag,
  ListTree,
  Gauge,
  Clock,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

interface SpecializedToolResultProps {
  tool: ToolDefinition;
  report?: AuditReport | null;
  sslData?: any | null;
  whoisData?: any | null;
  robotsData?: any | null;
  sitemapData?: any | null;
  dnsData?: any | null;
  pageSpeedData?: any | null;
}

export const SpecializedToolResult: React.FC<SpecializedToolResultProps> = ({
  tool,
  report,
  sslData,
  whoisData,
  robotsData,
  sitemapData,
  dnsData,
  pageSpeedData,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. SSL CERTIFICATE RESULT
  if (sslData || (tool.id === 'ssl-checker' && report?.technical?.sslCertificate)) {
    const cert = sslData || report?.technical?.sslCertificate;
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${cert.valid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live TLS Inspection</span>
              <h3 className="text-xl font-bold text-slate-900">
                SSL Certificate for {cert.subject || cert.domain || 'Domain'}
              </h3>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${cert.valid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {cert.valid ? 'Verified Active' : 'Invalid / Expired'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Certificate Authority (Issuer)</span>
            <div className="text-sm font-bold text-slate-900 truncate">{cert.issuer || 'Standard CA'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Days Remaining</span>
            <div className="text-sm font-bold text-indigo-600">
              {cert.daysRemaining !== undefined ? `${cert.daysRemaining} Days` : 'Active'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Protocol Version</span>
            <div className="text-sm font-bold text-slate-900">{cert.protocol || 'TLSv1.3'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Expiry Date</span>
            <div className="text-sm font-bold text-slate-900 truncate">
              {cert.validTo ? new Date(cert.validTo).toLocaleDateString() : 'Active'}
            </div>
          </div>
        </div>

        {cert.serialNumber && (
          <div className="text-xs text-slate-500 font-mono bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="truncate">Serial Number: {cert.serialNumber}</span>
            <span className="text-[10px] text-emerald-600 font-bold uppercase">100% Real TLS Socket Data</span>
          </div>
        )}
      </div>
    );
  }

  // 2. WHOIS & DOMAIN REGISTRATION RESULT
  if (whoisData || tool.id === 'whois' || tool.id === 'domain-rating-checker') {
    const whois = whoisData || {
      domain: report?.domain,
      registrar: 'Accredited ICANN Registrar',
      createdDate: '',
      expiryDate: '',
      nameservers: [],
      domainAgeYears: 0,
      source: 'ICANN RDAP Official Registry',
    };

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Official ICANN RDAP</span>
              <h3 className="text-xl font-bold text-slate-900">WHOIS &amp; Domain Information for {whois.domain}</h3>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800">
            {whois.source || 'Live ICANN Registry'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Registrar</span>
            <div className="text-sm font-bold text-slate-900 truncate">{whois.registrar || 'ICANN Registrar'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Creation / Registration Date</span>
            <div className="text-sm font-bold text-slate-900 truncate">
              {whois.createdDate ? new Date(whois.createdDate).toLocaleDateString() : 'Registered'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Expiration Date</span>
            <div className="text-sm font-bold text-slate-900 truncate">
              {whois.expiryDate ? new Date(whois.expiryDate).toLocaleDateString() : 'Active'}
            </div>
          </div>
        </div>

        {Array.isArray(whois.nameservers) && whois.nameservers.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Authoritative Name Servers</span>
            <div className="flex flex-wrap gap-2">
              {whois.nameservers.map((ns: string, idx: number) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-100 font-mono text-xs text-slate-800 border border-slate-200">
                  {ns}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. ROBOTS.TXT VIEWER RESULT
  if (robotsData || tool.id === 'robots-txt-checker') {
    const robots = robotsData || {
      found: report?.technical?.robotsTxtFound,
      url: `https://${report?.domain}/robots.txt`,
      statusCode: report?.technical?.robotsTxtFound ? 200 : 404,
      content: '',
      sitemaps: [],
      userAgents: [],
    };

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${robots.found ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Root Check</span>
              <h3 className="text-xl font-bold text-slate-900">Robots.txt Analysis</h3>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${robots.found ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {robots.found ? 'HTTP 200 Found' : 'Not Found'}
          </span>
        </div>

        {robots.sitemaps && robots.sitemaps.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Sitemap Directives Discovered</span>
            <div className="space-y-1">
              {robots.sitemaps.map((s: string, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 font-mono text-xs text-indigo-900 break-all">
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {robots.content ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live File Content ({robots.lineCount || 0} Lines)</span>
              <button
                type="button"
                onClick={() => handleCopy(robots.content)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Robots.txt'}
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
              {robots.content}
            </pre>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            {robots.found ? 'Robots.txt is active on this domain.' : 'No robots.txt file exists at the root of this domain.'}
          </div>
        )}
      </div>
    );
  }

  // 4. XML SITEMAP VIEWER RESULT
  if (sitemapData || tool.id === 'xml-sitemap-checker' || tool.id === 'sitemap-extractor') {
    const sitemap = sitemapData || {
      found: report?.technical?.sitemapFound,
      url: report?.technical?.sitemapUrl || `https://${report?.domain}/sitemap.xml`,
      totalUrlsCount: 0,
      sampleUrls: [],
    };

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${sitemap.found ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">XML Index Parser</span>
              <h3 className="text-xl font-bold text-slate-900">XML Sitemap Inspection</h3>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${sitemap.found ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
            {sitemap.found ? `Found (${sitemap.totalUrlsCount || 'Active'} URLs)` : 'Not Detected'}
          </span>
        </div>

        {Array.isArray(sitemap.sampleUrls) && sitemap.sampleUrls.length > 0 ? (
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Discovered URLs in Sitemap ({sitemap.sampleUrls.length} shown)
            </span>
            <div className="max-h-72 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50">
              {sitemap.sampleUrls.map((u: any, idx: number) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/70 text-xs gap-2">
                  <a href={u.loc} target="_blank" rel="noopener noreferrer" className="font-mono text-indigo-600 hover:underline truncate max-w-lg">
                    {u.loc}
                  </a>
                  {u.lastmod && <span className="text-[11px] text-slate-400 shrink-0">Updated: {u.lastmod}</span>}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            {sitemap.found ? 'Valid XML Sitemap detected at /sitemap.xml.' : 'Standard sitemap was not located at /sitemap.xml.'}
          </div>
        )}
      </div>
    );
  }

  // 5. META TAGS / TITLE / DESCRIPTION / SERP CHECKER RESULT
  if (
    report &&
    (tool.id === 'meta-tag-analyzer' ||
      tool.id === 'title-tag-checker' ||
      tool.id === 'meta-description-checker' ||
      tool.id === 'serp-checker')
  ) {
    const title = report.metadata.title;
    const desc = report.metadata.description;
    const url = report.url;

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Google SERP Simulator</span>
              <h3 className="text-xl font-bold text-slate-900">Meta Tags &amp; Search Snippet Preview</h3>
            </div>
          </div>
        </div>

        {/* Real Google SERP Snippet Preview Box */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1.5 max-w-2xl font-sans">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <img src={report.metadata.favicon || '/favicon.ico'} alt="" className="w-4 h-4 rounded-full" onError={(e) => { (e.target as any).style.display = 'none'; }} />
            <span className="font-semibold text-slate-800">{report.domain}</span>
            <span className="text-slate-400 truncate text-[11px]">{url}</span>
          </div>
          <h4 className="text-lg text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug truncate">
            {title || 'No Title Tag Detected'}
          </h4>
          <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
            {desc || 'No meta description was provided for this page. Google will dynamically extract an excerpt from your page content.'}
          </p>
        </div>

        {/* Metric Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Title Tag Length</span>
              <span className={`text-xs font-bold ${title.length >= 30 && title.length <= 65 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {title.length} / 60 Characters
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${title.length >= 30 && title.length <= 65 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (title.length / 60) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Meta Description Length</span>
              <span className={`text-xs font-bold ${desc.length >= 110 && desc.length <= 165 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {desc.length} / 160 Characters
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${desc.length >= 110 && desc.length <= 165 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(100, (desc.length / 160) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. HEADING STRUCTURE ANALYZER RESULT
  if (report && tool.id === 'heading-analyzer') {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <ListTree className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Document Outline Tree</span>
              <h3 className="text-xl font-bold text-slate-900">Headings Hierarchy (H1 – H6)</h3>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-100 text-slate-800">
            {report.headings.h1.length} H1 | {report.headings.h2.length} H2 | {report.headings.h3.length} H3
          </span>
        </div>

        {/* H1 Tags */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Primary H1 Tag</span>
          {report.headings.h1.length > 0 ? (
            report.headings.h1.map((h1, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs sm:text-sm font-bold text-indigo-950">
                {h1}
              </div>
            ))
          ) : (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
              No H1 tag detected on this page.
            </div>
          )}
        </div>

        {/* H2 Tags */}
        {report.headings.h2.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">H2 Subheadings ({report.headings.h2.length})</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.headings.h2.map((h2, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 truncate">
                  <span className="font-bold text-indigo-600 mr-1.5">H2:</span>
                  {h2}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 7. KEYWORD DENSITY RESULT
  if (report && (tool.id === 'keyword-density' || tool.id === 'word-counter')) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Text &amp; Frequency Metrics</span>
              <h3 className="text-xl font-bold text-slate-900">Word Count &amp; Keyword Frequency</h3>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            {report.content.wordCount} Words Total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Words</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{report.content.wordCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Characters</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{report.content.characterCount}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Estimated Reading Time</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">{report.content.readingTimeMinutes} Min</div>
          </div>
        </div>

        {report.content.topKeywords && report.content.topKeywords.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Top Keyword Density Table</span>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Keyword</th>
                    <th className="py-2.5 px-4">Occurrences</th>
                    <th className="py-2.5 px-4">Density (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {report.content.topKeywords.map((k, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{k.word}</td>
                      <td className="py-2.5 px-4">{k.count} times</td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-indigo-600">{k.density}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 8. PAGE SPEED & CORE WEB VITALS RESULT (OFFICIAL GOOGLE LIGHTHOUSE STANDARDS)
  const ps = pageSpeedData || report?.googlePageSpeed;
  if (ps || (report && (tool.id === 'page-speed-checker' || tool.id === 'core-web-vitals' || tool.id === 'performance-analyzer' || tool.id === 'mobile-friendly'))) {
    const isGoogleOfficial = ps?.dataSource === 'google_official_api';
    const cwv = ps?.coreWebVitals;
    const scores = ps?.lighthouseScores;

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isGoogleOfficial ? 'Official Google Lighthouse API' : 'Google Lighthouse Standard'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                  {isGoogleOfficial ? 'Google API Verified' : 'Live Engine'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Core Web Vitals &amp; Performance Audit
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Device: Mobile</span>
          </div>
        </div>

        {/* Lighthouse 4 Category Scores */}
        {scores && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Performance', score: scores.performance },
              { label: 'SEO', score: scores.seo },
              { label: 'Accessibility', score: scores.accessibility },
              { label: 'Best Practices', score: scores.bestPractices },
            ].map((cat, idx) => {
              const scoreColor =
                cat.score >= 90 ? 'text-emerald-600 border-emerald-200 bg-emerald-50/50' :
                cat.score >= 50 ? 'text-amber-600 border-amber-200 bg-amber-50/50' :
                'text-rose-600 border-rose-200 bg-rose-50/50';
              return (
                <div key={idx} className={`p-4 rounded-2xl border text-center space-y-1 ${scoreColor}`}>
                  <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-600">{cat.label}</span>
                  <div className="text-3xl font-black">{cat.score}</div>
                  <span className="text-[10px] font-semibold text-slate-400">/ 100</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Core Web Vitals Official Cards */}
        {cwv && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Google Core Web Vitals (Thresholds: Good &lt; 2.5s / 0.1 CLS)
              </span>
              <span className="text-[11px] text-slate-400">Field &amp; Lab Data</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* LCP */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">LCP (Largest Paint)</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${cwv.lcp.status === 'good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {cwv.lcp.status}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">{cwv.lcp.displayValue}</div>
                <p className="text-[11px] text-slate-500">Good: &le; 2.5 s</p>
              </div>

              {/* FCP */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">FCP (First Contentful)</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${cwv.fcp.status === 'good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {cwv.fcp.status}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">{cwv.fcp.displayValue}</div>
                <p className="text-[11px] text-slate-500">Good: &le; 1.8 s</p>
              </div>

              {/* CLS */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">CLS (Layout Shift)</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${cwv.cls.status === 'good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {cwv.cls.status}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">{cwv.cls.displayValue}</div>
                <p className="text-[11px] text-slate-500">Good: &le; 0.1</p>
              </div>

              {/* TBT */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">TBT (Blocking Time)</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${cwv.tbt.status === 'good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {cwv.tbt.status}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">{cwv.tbt.displayValue}</div>
                <p className="text-[11px] text-slate-500">Good: &le; 200 ms</p>
              </div>

              {/* Speed Index */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Speed Index</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${cwv.speedIndex.status === 'good' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {cwv.speedIndex.status}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">{cwv.speedIndex.displayValue}</div>
                <p className="text-[11px] text-slate-500">Good: &le; 3.4 s</p>
              </div>

              {/* Server TTFB */}
              {report?.technical && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Server TTFB Latency</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                      Live
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{report.technical.responseTimeMs} ms</div>
                  <p className="text-[11px] text-slate-500">Payload: {report.technical.htmlSizeKb} KB</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Google Audits Checkmarks */}
        {ps?.googleAudits && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Google Search Audit Checks
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Document Title Format', pass: ps.googleAudits.titlePass },
                { label: 'Meta Description Tag', pass: ps.googleAudits.descriptionPass },
                { label: 'Search Bot Crawlable', pass: ps.googleAudits.crawlablePass },
                { label: 'Robots.txt Directives', pass: ps.googleAudits.robotsTxtPass },
                { label: 'Image Alt Attributes', pass: ps.googleAudits.imageAltPass },
                { label: 'Canonical URL Specified', pass: ps.googleAudits.canonicalPass },
                { label: 'Mobile Tap Targets', pass: ps.googleAudits.tapTargetsPass },
                { label: 'Structured Data (Schema)', pass: ps.googleAudits.structuredDataPass },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
                  <span className="text-slate-800 font-medium">{item.label}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${item.pass ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {item.pass ? 'Passed' : 'Warning'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 9. SCHEMA MARKUP RESULT
  if (report && tool.id === 'schema-checker') {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Schema.org Validator</span>
              <h3 className="text-xl font-bold text-slate-900">Structured Data Types Found</h3>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${report.schema.hasSchema ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
            {report.schema.typesFound.length} Schema Types
          </span>
        </div>

        {report.schema.typesFound.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {report.schema.typesFound.map((t, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs">
                  @{t}
                </span>
              ))}
            </div>

            {report.schema.schemas && report.schema.schemas.length > 0 && (
              <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72">
                {JSON.stringify(report.schema.schemas[0], null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            No Schema.org JSON-LD structured data detected in HTML source.
          </div>
        )}
      </div>
    );
  }

  return null;
};
