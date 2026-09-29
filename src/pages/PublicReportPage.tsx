import React, { useEffect, useState } from 'react';
import { AuditReport } from '../types/seo';
import { ReportView } from '../components/report/ReportView';
import { ShareReportBar } from '../components/report/ShareReportBar';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { AdSlot } from '../components/common/AdSlot';
import { getReportById } from '../utils/apiClient';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface PublicReportPageProps {
  token: string;
}

export const PublicReportPage: React.FC<PublicReportPageProps> = ({ token }) => {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReportById(token);
        if (!data) {
          throw new Error('This report could not be found or has expired.');
        }
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load report.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [token]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Public Reports', href: '/' },
          { label: report ? `Audit: ${report.domain}` : 'Shared Report' },
        ]}
      />

      {/* Prominent Header CTA */}
      <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Shared Public Audit Report
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Want to audit your own website?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Generate an executive SEO report for any domain in seconds. 100% free with no login.
          </p>
        </div>

        <a
          href="/"
          className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-3 text-xs font-bold text-white shadow-md transition-colors"
        >
          <span>Analyze Your Website Free</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="mx-auto w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading public audit report...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="text-base font-bold text-rose-900">{error}</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">
            Temporary reports expire automatically. You can generate a fresh, instant audit report for any website for free on our homepage.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors"
          >
            <span>Run Free SEO Audit</span>
          </a>
        </div>
      ) : report ? (
        <div className="space-y-8">
          <SeoHead
            title={`SEO Audit Report for ${report.domain} (Score: ${report.overallScore}/100)`}
            description={`Comprehensive website SEO diagnostic audit report for ${report.domain}. Overall Health Score: ${report.overallScore}/100 with ${report.statusSummary.passCount} passed checks.`}
            canonicalPath={`/report/${token}`}
          />

          {/* Share functionality with unique shortened link and social media buttons */}
          <ShareReportBar report={report} token={token} />

          <ReportView report={report} />
          <AdSlot format="horizontal" />
        </div>
      ) : null}
    </div>
  );
};
