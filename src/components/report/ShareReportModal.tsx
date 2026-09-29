import React, { useState } from 'react';
import { AuditReport } from '../../types/seo';
import { generateReportPdf } from '../../utils/pdfGenerator';
import {
  Share2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Facebook,
  MessageCircle,
  Send,
  Mail,
  X,
  Sparkles,
  QrCode,
  Code,
  ExternalLink,
  ShieldCheck,
  Download,
  Loader2,
} from 'lucide-react';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AuditReport;
  token: string;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  isOpen,
  onClose,
  report,
  token,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'badge' | 'qr'>('link');

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://seoreporttools.com';
  const shortShareUrl = `${origin}/r/${token}`;
  const fullShareUrl = `${origin}/report/${token}`;

  const shareTitle = `SEO Audit Report for ${report.domain} (Score: ${report.overallScore}/100)`;
  const shareText = `Check out the comprehensive SEO Diagnostic Audit for ${report.domain} — Overall SEO Health Score is ${report.overallScore}/100! 🚀 Analyze any website for free on SEO Report Tools:`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shortShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateReportPdf(report);
    } catch (err) {
      console.error('Error generating PDF report:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shortShareUrl,
        });
      } catch {
        // User canceled
      }
    } else {
      handleCopyLink();
    }
  };

  const badgeHtml = `<a href="${shortShareUrl}" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/SEO_Score-${report.overallScore}%2F100-${report.overallScore >= 80 ? 'brightgreen' : report.overallScore >= 60 ? 'yellow' : 'red'}?style=for-the-badge&logo=google&logoColor=white" alt="SEO Health Score for ${report.domain}" /></a>`;

  const handleCopyBadge = async () => {
    try {
      await navigator.clipboard.writeText(badgeHtml);
      setCopiedBadge(true);
      setTimeout(() => setCopiedBadge(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Social Share Intent URLs
  const socialLinks = [
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: 'bg-black text-white hover:bg-neutral-800',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shortShareUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-4 h-4" />,
      color: 'bg-[#0A66C2] text-white hover:bg-[#084e96]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortShareUrl)}`,
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-4 h-4" />,
      color: 'bg-[#25D366] text-white hover:bg-[#1faa53]',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shortShareUrl}`)}`,
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-4 h-4" />,
      color: 'bg-[#1877F2] text-white hover:bg-[#135ec2]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortShareUrl)}`,
    },
    {
      name: 'Telegram',
      icon: <Send className="w-4 h-4" />,
      color: 'bg-[#229ED9] text-white hover:bg-[#1b81b3]',
      url: `https://t.me/share/url?url=${encodeURIComponent(shortShareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Email',
      icon: <Mail className="w-4 h-4" />,
      color: 'bg-slate-700 text-white hover:bg-slate-800',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nView Full Audit Report:\n${shortShareUrl}`)}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Shareable Audit Link</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Share SEO Audit Report
            </h3>
            <p className="text-xs text-slate-500">
              Anyone with this link can view this live diagnostic report.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Domain & Score Preview Card */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 border border-slate-200/90">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audited Website</span>
            <div className="text-sm font-extrabold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
              {report.domain}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SEO Health</span>
              <div
                className={`text-sm font-black ${
                  report.overallScore >= 80
                    ? 'text-emerald-600'
                    : report.overallScore >= 60
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                {report.overallScore} / 100
              </div>
            </div>
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs ${
                report.overallScore >= 80
                  ? 'bg-emerald-600'
                  : report.overallScore >= 60
                  ? 'bg-amber-500'
                  : 'bg-rose-600'
              }`}
            >
              {report.overallScore}
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'link'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Direct Link &amp; Social
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('badge')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'badge'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Embed Badge
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'qr'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            QR Code
          </button>
        </div>

        {/* Tab 1: Direct Link & Social Platforms */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            {/* Shortened URL Copy Input Box */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Unique Short Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shortShareUrl}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-900 select-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-xs ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Social Share Grid */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Share Directly to Social Media
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold transition-transform hover:scale-105 active:scale-95 shadow-2xs ${s.color}`}
                    title={`Share on ${s.name}`}
                  >
                    <div className="mb-1">{s.icon}</div>
                    <span className="text-[10px] truncate max-w-full">{s.name.split(' ')[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* PDF Export Direct Action */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 py-2.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-75"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Official PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Download as Official PDF Document</span>
                </>
              )}
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2 text-xs font-bold text-slate-800 shadow-2xs transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>More Share Options (Apps, SMS, Chat)</span>
              </button>
            )}
          </div>
        )}

        {/* Tab 2: Embed Badge */}
        {activeTab === 'badge' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Showcase your verified SEO health score badge on your website, GitHub README, or client portal:
            </p>

            {/* Preview Badge */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Live Badge Preview</span>
              <img
                src={`https://img.shields.io/badge/SEO_Score-${report.overallScore}%2F100-${
                  report.overallScore >= 80 ? 'brightgreen' : report.overallScore >= 60 ? 'yellow' : 'red'
                }?style=for-the-badge&logo=google&logoColor=white`}
                alt={`SEO Health Score for ${report.domain}`}
                className="h-7"
              />
            </div>

            {/* HTML Code Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  HTML Embed Code
                </label>
                <button
                  type="button"
                  onClick={handleCopyBadge}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                >
                  {copiedBadge ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedBadge ? 'Badge Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                readOnly
                value={badgeHtml}
                className="w-full rounded-xl border border-slate-200 bg-slate-900 text-indigo-300 p-3 text-xs font-mono select-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Tab 3: QR Code */}
        {activeTab === 'qr' && (
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-600">
              Scan this QR code with any smartphone camera to open the live report:
            </p>
            <div className="mx-auto w-44 h-44 p-3 bg-white border-2 border-indigo-100 rounded-2xl shadow-md flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shortShareUrl)}`}
                alt={`QR Code for ${report.domain} SEO Report`}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[11px] font-mono text-slate-500 truncate max-w-xs mx-auto">
              {shortShareUrl}
            </p>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Public report link verified</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
