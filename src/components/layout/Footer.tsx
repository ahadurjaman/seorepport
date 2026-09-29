import React from 'react';
import { BarChart3, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-600">
      {/* Upper Footer: Value Proposition & Trust */}
      <div className="border-b border-slate-100 bg-slate-50/70 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  SEO Report Tools
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Free SEO tools to analyze your website, audit technical health, optimize meta tags, and diagnose performance bottlenecks. Free forever.
              </p>
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>No Login • No Paywall • 100% Free Forever</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                SEO Audit Tools
              </h4>
              <ul className="space-y-2 text-xs">
                <li><a href="/tools/seo-report-generator" className="hover:text-indigo-600 transition-colors">SEO Report Generator</a></li>
                <li><a href="/tools/website-seo-checker" className="hover:text-indigo-600 transition-colors">Website SEO Checker</a></li>
                <li><a href="/seo-audit" className="hover:text-indigo-600 transition-colors">Free SEO Audit Tool</a></li>
                <li><a href="/tools/ai-seo-advisor" className="hover:text-indigo-600 transition-colors">AI SEO Advisor (Gemini)</a></li>
                <li><a href="/seo-score" className="hover:text-indigo-600 transition-colors">SEO Score Checker</a></li>
                <li><a href="/seo-score-methodology" className="hover:text-indigo-600 transition-colors">Scoring Methodology</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Technical &amp; On-Page
              </h4>
              <ul className="space-y-2 text-xs">
                <li><a href="/tools/meta-tag-analyzer" className="hover:text-indigo-600 transition-colors">Meta Tag Analyzer</a></li>
                <li><a href="/tools/title-tag-checker" className="hover:text-indigo-600 transition-colors">Title Tag Checker</a></li>
                <li><a href="/tools/heading-analyzer" className="hover:text-indigo-600 transition-colors">Heading Structure (H1–H6)</a></li>
                <li><a href="/tools/robots-txt-checker" className="hover:text-indigo-600 transition-colors">Robots.txt Checker</a></li>
                <li><a href="/tools/xml-sitemap-checker" className="hover:text-indigo-600 transition-colors">XML Sitemap Validator</a></li>
                <li><a href="/tools/canonical-checker" className="hover:text-indigo-600 transition-colors">Canonical URL Checker</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Speed, Security &amp; Trust
              </h4>
              <ul className="space-y-2 text-xs">
                <li><a href="/tools/page-speed-checker" className="hover:text-indigo-600 transition-colors">Page Speed Checker</a></li>
                <li><a href="/tools/core-web-vitals" className="hover:text-indigo-600 transition-colors">Core Web Vitals Checker</a></li>
                <li><a href="/tools/ssl-checker" className="hover:text-indigo-600 transition-colors">SSL &amp; HTTPS Checker</a></li>
                <li><a href="/tools/security-headers" className="hover:text-indigo-600 transition-colors">Security Headers Checker</a></li>
                <li><a href="/about" className="hover:text-indigo-600 transition-colors">About &amp; Mission</a></li>
                <li><a href="/how-it-works" className="hover:text-indigo-600 transition-colors">How Our Crawler Works</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Guides & Clusters */}
      <div className="py-8 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Popular SEO Guides &amp; Tutorials
            </span>
            <a href="/blog" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View all 20 guides →
            </a>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <a href="/blog/what-is-an-seo-report" className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              What Is an SEO Report?
            </a>
            <a href="/blog/how-to-run-an-seo-audit" className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              How to Run an SEO Audit
            </a>
            <a href="/blog/how-to-improve-your-seo-score" className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              How to Improve SEO Score
            </a>
            <a href="/blog/what-is-technical-seo" className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              What Is Technical SEO?
            </a>
            <a href="/blog/what-are-core-web-vitals" className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              Core Web Vitals Guide
            </a>
            <a href="/blog/what-is-a-canonical-url" className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              Canonical Tags Explained
            </a>
            <a href="/blog/what-is-schema-markup" className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              Schema Markup Guide
            </a>
          </div>
        </div>
      </div>

      {/* Legal & Disclaimers */}
      <div className="py-6 bg-slate-50 text-[11px] text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <p>
              &copy; {new Date().getFullYear()} SEO Report Tools (seoreporttools.com). All rights reserved.
            </p>
            <p className="text-[10px] text-slate-400">
              Disclaimer: SEO Report Tools is an independent web diagnostic service and is not affiliated with, sponsored by, or endorsed by Google LLC. We never guarantee search rankings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium">
            <a href="/privacy-policy" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
            <a href="/cookie-policy" className="hover:text-indigo-600 transition-colors">Cookie Policy</a>
            <a href="/contact" className="hover:text-indigo-600 transition-colors">Contact</a>
            <a href="/sitemap.xml" className="hover:text-indigo-600 transition-colors">XML Sitemap</a>
            <a href="/llms.txt" className="hover:text-indigo-600 transition-colors" title="LLM Context for AI Agents">llms.txt</a>
            <a href="/ai-catalog.json" className="hover:text-indigo-600 transition-colors" title="ARD AI Catalog Manifest">ai-catalog.json</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
