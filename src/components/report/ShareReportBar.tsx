import React, { useState } from 'react';
import { AuditReport } from '../../types/seo';
import { ShareReportModal } from './ShareReportModal';
import {
  Share2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Facebook,
  MessageCircle,
  Sparkles,
  QrCode,
  ExternalLink,
} from 'lucide-react';

interface ShareReportBarProps {
  report: AuditReport;
  token: string;
  className?: string;
}

export const ShareReportBar: React.FC<ShareReportBarProps> = ({
  report,
  token,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://seoreporttools.com';
  const shortShareUrl = `${origin}/r/${token}`;
  const shareText = `Check out the comprehensive SEO Diagnostic Audit for ${report.domain} — Overall SEO Health Score is ${report.overallScore}/100! 🚀`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const socialChannels = [
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      bg: 'bg-black text-white hover:bg-neutral-800',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shortShareUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-3.5 h-3.5" />,
      bg: 'bg-[#0A66C2] text-white hover:bg-[#084e96]',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortShareUrl)}`,
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-3.5 h-3.5" />,
      bg: 'bg-[#25D366] text-white hover:bg-[#1faa53]',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shortShareUrl}`)}`,
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-3.5 h-3.5" />,
      bg: 'bg-[#1877F2] text-white hover:bg-[#135ec2]',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortShareUrl)}`,
    },
  ];

  return (
    <>
      <div
        className={`rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/80 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${className}`}
      >
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                Unique Short Link
              </span>
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                Share with clients or team
              </span>
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-slate-800 truncate max-w-[220px] sm:max-w-xs mt-0.5">
              {shortShareUrl}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Quick Copy Link Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/30'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          {/* Social Quick Share Icons */}
          <div className="flex items-center gap-1.5">
            {socialChannels.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-transform hover:scale-105 active:scale-95 shadow-2xs ${s.bg}`}
                title={`Share on ${s.name}`}
                aria-label={`Share on ${s.name}`}
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Full Options Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="More share options (QR Code, Badge, Telegram, Email)"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">QR &amp; Badge</span>
          </button>
        </div>
      </div>

      <ShareReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        report={report}
        token={token}
      />
    </>
  );
};
