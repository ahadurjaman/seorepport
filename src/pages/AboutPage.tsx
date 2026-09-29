import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { AdSlot } from '../components/common/AdSlot';
import { ShieldCheck, Heart, BarChart3, Globe, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <SeoHead
        title="About SEO Report Tools — Free Website SEO Diagnostic Platform"
        description="Learn about SEO Report Tools, our mission to democratize professional website SEO diagnostics, and our commitment to 100% free forever tools with zero registration."
        canonicalPath="/about"
      />

      <Breadcrumbs items={[{ label: 'About Us' }]} />

      <div className="space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Our Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Democratizing Professional SEO Diagnostics
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          SEO Report Tools was built to provide webmasters, small businesses, digital marketers, and developers with free, transparent, and accurate SEO diagnostics.
        </p>
      </div>

      <AdSlot format="horizontal" />

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">What We Do</h2>
        <p>
          SEO Report Tools (seoreporttools.com) is an independent web diagnostics platform offering 30+ single-purpose and full-suite SEO analysis tools. We evaluate technical crawlability, on-page optimization, server response times, mobile readiness, security headers, and structured data schemas.
        </p>

        <h2 className="text-xl font-bold text-slate-900">Our Business Model: 100% Free Forever</h2>
        <p>
          Most legacy SEO tools lock basic audits behind mandatory registrations, trial paywalls, and monthly credit card subscriptions. We believe fundamental technical health checks should be open and accessible to all website creators.
        </p>
        <p>
          Our platform is supported solely by non-intrusive display advertising (Google AdSense). There is no public login, no paywall, no hidden subscription, and no locked features.
        </p>

        <h2 className="text-xl font-bold text-slate-900">Transparent Data &amp; No Fake Metrics</h2>
        <p>
          We maintain strict integrity: we never invent fake domain authority scores, fake backlink counts, or fake ranking guarantees. When external third-party data (such as proprietary enterprise backlink graphs) is unconfigured, we display "Not Available" rather than deceiving our visitors.
        </p>

        <h2 className="text-xl font-bold text-slate-900">How Data Is Handled</h2>
        <p>
          All analyses are performed anonymously on publicly accessible web pages. We do not store personal customer credentials or track user browsing behavior. Generated audit reports are cached temporarily to reduce server load and expire automatically.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8 space-y-3">
        <h3 className="text-base font-bold text-slate-900">Disclaimer</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          SEO Report Tools is an independent diagnostics platform and is not affiliated with, maintained by, or endorsed by Google LLC. We never promise or guarantee specific search engine rank positions.
        </p>
      </div>

      <AdSlot format="horizontal" />
    </div>
  );
};
