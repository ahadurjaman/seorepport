import React from 'react';
import { SeoHead } from '../components/common/SeoHead';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { AuditHistoryTracker } from '../components/report/AuditHistoryTracker';
import { AdSlot } from '../components/common/AdSlot';
import { History, ShieldCheck, Zap, LineChart, Sparkles } from 'lucide-react';

export const AuditHistoryPage: React.FC = () => {
  const handleSelectAudit = (url: string) => {
    window.location.href = `/?analyze=${encodeURIComponent(url)}`;
  };

  const historyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SEO Audit History Tracker',
    applicationCategory: 'SEOApplication',
    description: 'Track your local website SEO audit scores over time with interactive Recharts trends and historical progress logs.',
    url: 'https://seoreporttools.com/audit-history',
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <SeoHead
        title="SEO Audit Score History & Progress Tracker"
        description="Track your website SEO audit score progression over time. Privately stored in your browser with interactive Recharts visual trends."
        canonicalPath="/audit-history"
        jsonLd={historyJsonLd}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Audit History & Trends' },
        ]}
      />

      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <History className="w-3.5 h-3.5" />
          <span>Local Storage History Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          SEO Audit Score History &amp; Progress Tracker
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          Monitor your website's SEO health evolution across multiple audits. Your scores are saved locally and visualized with interactive Recharts progress graphs so you can verify that optimizations are working.
        </p>
      </div>

      {/* AdSlot */}
      <AdSlot format="horizontal" />

      {/* Main Interactive Tracker */}
      <AuditHistoryTracker onSelectAudit={handleSelectAudit} />

      {/* Privacy & Methodology Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Private Storage</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your audit history never leaves your device. Data is securely held in your browser's local storage with zero tracking or user profiling.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <LineChart className="w-4 h-4" />
            <span>Recharts Time Series</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Switch between overall health scores, technical crawl benchmarks, page speed performance, and on-page metadata metrics effortlessly.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <Zap className="w-4 h-4" />
            <span>Instant Re-Auditing</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click on any past audit entry to re-test the domain immediately and record a new milestone data point on the progression chart.
          </p>
        </div>
      </div>
    </div>
  );
};
