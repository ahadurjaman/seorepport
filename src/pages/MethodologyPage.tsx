import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { AdSlot } from '../components/common/AdSlot';
import { CheckCircle2, AlertTriangle, XCircle, Info, ShieldCheck } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <SeoHead
        title="SEO Score Methodology & Diagnostic Framework"
        description="Learn how SEO Report Tools calculates website health scores (0-100) using a transparent 7-category weighted formula across technical, speed, on-page, and security checks."
        canonicalPath="/seo-score-methodology"
      />

      <Breadcrumbs items={[{ label: 'SEO Score Methodology' }]} />

      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Transparent Standards
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          SEO Score Methodology &amp; Diagnostic Framework
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          How our engine calculates website health scores, what each checkpoint measures, and how our transparent weighted formula operates.
        </p>
      </div>

      <AdSlot format="horizontal" />

      {/* Transparent Weights Section */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Transparent Weighted Formula (0–100)
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Our overall SEO score is not an arbitrary estimate. It is calculated directly from the weighted sum of seven distinct diagnostic categories:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex justify-between font-bold text-slate-900 mb-1">
              <span>Technical SEO</span>
              <span className="text-indigo-600">20% Weight</span>
            </div>
            <p className="text-slate-500 text-[11px]">HTTP 200 OK status, canonical tag configuration, robots.txt accessibility, XML sitemap presence, robots meta directives, and structured data schemas.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex justify-between font-bold text-slate-900 mb-1">
              <span>On-Page SEO</span>
              <span className="text-indigo-600">20% Weight</span>
            </div>
            <p className="text-slate-500 text-[11px]">Title tag length &amp; pixel truncation (30–65 chars), meta description presence &amp; length, single primary H1 tag, and heading hierarchy.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex justify-between font-bold text-slate-900 mb-1">
              <span>Performance</span>
              <span className="text-indigo-600">20% Weight</span>
            </div>
            <p className="text-slate-500 text-[11px]">Server response time (TTFB latency under 500ms), HTML payload document weight, and Gzip/Brotli text compression headers.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex justify-between font-bold text-slate-900 mb-1">
              <span>Mobile Readiness</span>
              <span className="text-indigo-600">10% Weight</span>
            </div>
            <p className="text-slate-500 text-[11px]">Responsive viewport meta tags and HTML language declarations.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex justify-between font-bold text-slate-900 mb-1">
              <span>Security</span>
              <span className="text-indigo-600">10% Weight</span>
            </div>
            <p className="text-slate-500 text-[11px]">Enforced HTTPS protocol, HSTS (Strict-Transport-Security), and critical HTTP security response headers.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex justify-between font-bold text-slate-900 mb-1">
              <span>Content Depth</span>
              <span className="text-indigo-600">10% Weight</span>
            </div>
            <p className="text-slate-500 text-[11px]">Substantial body word count (300+ words), image alt text completeness, and text-to-HTML ratios.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
            <div className="flex justify-between font-bold text-slate-900 mb-1">
              <span>Link Architecture</span>
              <span className="text-indigo-600">10% Weight</span>
            </div>
            <p className="text-slate-500 text-[11px]">Internal link connectivity ensuring search engine spiders can discover adjacent site pages.</p>
          </div>
        </div>
      </section>

      {/* Check Status Definitions */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Check Status Definitions
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-2xl bg-white p-5 border border-slate-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">PASS (100% Value)</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                The audited element fully meets established search engine guidelines and web standards. No action is required.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-white p-5 border border-slate-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">WARNING (50% Value)</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                The element functions, but represents an optimization opportunity. Examples include a title tag that is slightly too long, images missing alt attributes, or slow server response times.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-white p-5 border border-slate-200">
            <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">FAIL (0% Value)</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                A critical blocker was detected that directly prevents or severely impairs search engine indexing or user security. Examples include HTTP 4xx/5xx status codes, missing H1 headings, or insecure HTTP protocols.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-white p-5 border border-slate-200">
            <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">NOT AVAILABLE</span>
              <p className="text-xs text-slate-600 leading-relaxed">
                When third-party external data (such as proprietary enterprise backlink indices) is unconfigured or unavailable, it is never penalized or fabricated. We report it as unavailable without affecting the verified score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Limitations of the Score */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          Limitations of an SEO Score
        </h2>
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong>1. The Score Does Not Guarantee Rankings:</strong> Google evaluates hundreds of proprietary signals—including off-page entity authority, historical search click behavior, and user intent matching. No automated tool has access to Google\'s secret ranking algorithms.
          </p>
          <p>
            <strong>2. Single Page vs. Sitewide Context:</strong> Single-page audits evaluate the specific target URL analyzed. Sitewide factors—such as overall domain backlink authority or deep orphaned directories—require full site crawler analysis.
          </p>
          <p>
            <strong>3. JavaScript-Rendered Content:</strong> Our crawler inspects the pristine HTML payload returned by your web server. Single Page Apps (SPAs) that require heavy client-side JavaScript execution to generate basic HTML markup should utilize Server-Side Rendering (SSR) for optimal search engine accessibility.
          </p>
        </div>
      </section>

      <AdSlot format="horizontal" />
    </div>
  );
};
