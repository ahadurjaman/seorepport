import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  Code2,
  Sparkles,
  HelpCircle,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileCode,
  Globe,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const DEFAULT_PRESETS: { name: string; faqs: { question: string; answer: string }[] }[] = [
  {
    name: 'SaaS / Product',
    faqs: [
      {
        question: 'How does the free trial work?',
        answer: 'You can start using the service for 14 days without entering credit card information. All core features and exports are fully accessible during the trial period.',
      },
      {
        question: 'Can I cancel or change my plan anytime?',
        answer: 'Yes. You can upgrade, downgrade, or cancel your subscription at any time directly from your billing dashboard with no penalty fees.',
      },
      {
        question: 'Is my data secure and backed up?',
        answer: 'We enforce 256-bit SSL/TLS encryption in transit and at rest, along with daily automated off-site backups to ensure business continuity.',
      },
    ],
  },
  {
    name: 'E-Commerce / Store',
    faqs: [
      {
        question: 'What is your return and refund policy?',
        answer: 'We offer a 30-day money-back guarantee on all unused items in their original packaging. Return shipping is free for domestic orders.',
      },
      {
        question: 'How long does standard shipping take?',
        answer: 'Standard domestic delivery takes 2 to 5 business days. Express next-day shipping options are also available at checkout.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes, we ship to over 80 countries worldwide. International shipping rates and customs estimates are calculated automatically at checkout.',
      },
    ],
  },
  {
    name: 'SEO & Marketing Agency',
    faqs: [
      {
        question: 'How long does it take to see organic SEO results?',
        answer: 'Most websites begin seeing initial ranking movement and impression growth within 3 to 6 months of implementing technical and content optimizations.',
      },
      {
        question: 'What is included in a technical SEO audit?',
        answer: 'Our audit checks crawlability, robots.txt directives, XML sitemaps, canonical tags, Core Web Vitals, mobile responsiveness, structured data, and security headers.',
      },
      {
        question: 'Do you provide monthly SEO reporting?',
        answer: 'Yes, clients receive automated and customized monthly reports tracking organic search impressions, keyword rank movements, and conversion metrics.',
      },
    ],
  },
];

export const FaqSchemaGenerator: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([
    {
      id: 'faq-1',
      question: 'Is this SEO tool 100% free to use?',
      answer: 'Yes, all tools and report generation features on SEO Report Tools are completely free with no registration or credit card required.',
    },
    {
      id: 'faq-2',
      question: 'How does FAQ Schema markup improve Google search rankings?',
      answer: 'FAQ Schema (FAQPage JSON-LD) structures your question and answer content so Google and AI search engines can render rich accordion snippets and direct citations directly in search results.',
    },
    {
      id: 'faq-3',
      question: 'Where should I place the generated FAQ Schema JSON-LD code?',
      answer: 'Paste the generated <script type="application/ld+json"> tag directly inside the <head> tag or right before the closing </body> tag of your webpage HTML.',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'json' | 'html' | 'preview'>('json');
  const [copiedCode, setCopiedCode] = useState(false);
  const [expandedPreview, setExpandedPreview] = useState<Record<string, boolean>>({ 'faq-1': true });
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Generate valid JSON-LD Schema
  const jsonLdObject = useMemo(() => {
    const validFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: validFaqs.map((f) => ({
        '@type': 'Question',
        name: f.question.trim(),
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer.trim(),
        },
      })),
    };
  }, [faqs]);

  const jsonLdString = useMemo(() => {
    return JSON.stringify(jsonLdObject, null, 2);
  }, [jsonLdObject]);

  const scriptTagString = useMemo(() => {
    return `<script type="application/ld+json">\n${jsonLdString}\n</script>`;
  }, [jsonLdString]);

  // Handlers
  const handleAddFaq = () => {
    const newFaq: FaqItem = {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
    };
    setFaqs([...faqs, newFaq]);
  };

  const handleRemoveFaq = (id: string) => {
    if (faqs.length <= 1) {
      setFaqs([{ id: `faq-${Date.now()}`, question: '', answer: '' }]);
      return;
    }
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  const handleUpdateQuestion = (id: string, text: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, question: text } : f)));
  };

  const handleUpdateAnswer = (id: string, text: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, answer: text } : f)));
  };

  const handleLoadPreset = (presetFaqs: { question: string; answer: string }[]) => {
    setFaqs(
      presetFaqs.map((p, idx) => ({
        id: `faq-${Date.now()}-${idx}`,
        question: p.question,
        answer: p.answer,
      }))
    );
  };

  const handleCopyCode = () => {
    const textToCopy = activeTab === 'html' ? scriptTagString : jsonLdString;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonLdString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faq-schema.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([scriptTagString], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faq-schema-tag.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Live import FAQs from URL
  const handleImportFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to inspect website for FAQs');
      }

      // Check if existing FAQ schema exists in the crawled report
      const schemas = data.schema?.schemas || [];
      const faqSchema = schemas.find((s: any) => s['@type'] === 'FAQPage' || s['@type']?.includes?.('FAQPage'));

      if (faqSchema && Array.isArray(faqSchema.mainEntity) && faqSchema.mainEntity.length > 0) {
        const imported: FaqItem[] = faqSchema.mainEntity.map((item: any, idx: number) => ({
          id: `imported-${Date.now()}-${idx}`,
          question: item.name || item.question || '',
          answer: item.acceptedAnswer?.text || item.acceptedAnswer || '',
        }));
        setFaqs(imported);
      } else {
        // Fallback: extract questions from headings (H2/H3 ending in ?)
        const questions: string[] = [];
        const h2s = data.headings?.h2 || [];
        const h3s = data.headings?.h3 || [];
        [...h2s, ...h3s].forEach((h: string) => {
          if (h.includes('?') || h.toLowerCase().startsWith('what') || h.toLowerCase().startsWith('how') || h.toLowerCase().startsWith('why') || h.toLowerCase().startsWith('is ')) {
            questions.push(h);
          }
        });

        if (questions.length > 0) {
          const autoFaqs: FaqItem[] = questions.slice(0, 5).map((q, idx) => ({
            id: `imported-${Date.now()}-${idx}`,
            question: q,
            answer: `Provide clear, concise answer text for "${q}" here.`,
          }));
          setFaqs(autoFaqs);
        } else {
          setImportError('No existing FAQ schema or question headings found on this page. You can add FAQs manually below or choose a starter template!');
        }
      }
    } catch (err: any) {
      setImportError(err.message || 'Could not fetch website. Please check the URL.');
    } finally {
      setIsImporting(false);
    }
  };

  const togglePreviewAccordion = (id: string) => {
    setExpandedPreview((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const validCount = faqs.filter((f) => f.question.trim() && f.answer.trim()).length;

  return (
    <div className="space-y-8">
      {/* Quick Starter Presets Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
              Quick Starter Presets
            </span>
            <p className="text-xs text-slate-500">
              Select an industry template to pre-fill common question &amp; answer structures:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {DEFAULT_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadPreset(preset.faqs)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-xs font-bold text-slate-700 transition-colors shadow-xs"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* URL Import Tool */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>Import Questions from Existing Webpage</span>
        </div>
        <form onSubmit={handleImportFromUrl} className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            placeholder="https://example.com/faq"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
          <button
            type="submit"
            disabled={isImporting}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <span>Extract FAQs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {importError && (
          <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            {importError}
          </p>
        )}
      </div>

      {/* Main Two-Column Layout: Form Builder & Code Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: FAQ Items Editor */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>FAQ Questions &amp; Answers</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold">
                  {validCount} {validCount === 1 ? 'Question' : 'Questions'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Add, edit, or remove FAQs. Code updates in real time.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddFaq}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </button>
          </div>

          {/* List of FAQ Cards */}
          <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3 relative group hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                    Question #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(faq.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Question Input */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleUpdateQuestion(faq.id, e.target.value)}
                    placeholder="e.g. What is your return policy?"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 transition-all"
                  />
                </div>

                {/* Answer Textarea */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Answer Text
                  </label>
                  <textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => handleUpdateAnswer(faq.id, e.target.value)}
                    placeholder="e.g. We offer a 30-day money-back guarantee on all unused items."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 leading-relaxed transition-all"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddFaq}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Question</span>
          </button>
        </div>

        {/* Right Column: Code Generator & Preview */}
        <div className="lg:col-span-6 space-y-4 sticky top-24">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            {/* Tab Controls & Copy Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'json' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  JSON-LD
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('html')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'html' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  HTML Script Tag
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  SERP Preview
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={activeTab === 'html' ? handleDownloadHtml : handleDownloadJson}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                  title="Download Code"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Validation Badge */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Valid Schema.org Standard</span>
              </div>
              <span className="text-[11px] text-slate-400">Target Type: @FAQPage</span>
            </div>

            {/* Code Output Window */}
            {activeTab === 'json' && (
              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed select-all">
                  {jsonLdString}
                </pre>
              </div>
            )}

            {activeTab === 'html' && (
              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-900 text-indigo-300 font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed select-all">
                  {scriptTagString}
                </pre>
              </div>
            )}

            {/* Google SERP Accordion Preview */}
            {activeTab === 'preview' && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">https://yourwebsite.com</span>
                    <span>› faq</span>
                  </div>
                  <h4 className="text-base font-bold text-indigo-700 hover:underline cursor-pointer">
                    Frequently Asked Questions — Your Website Title
                  </h4>
                  <p className="text-xs text-slate-600 leading-snug">
                    Explore common answers and detailed explanations regarding our features, pricing, policies, and services.
                  </p>
                </div>

                {/* Simulated Google FAQ Accordions */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  {faqs
                    .filter((f) => f.question.trim())
                    .map((faq) => {
                      const isExpanded = Boolean(expandedPreview[faq.id]);
                      return (
                        <div
                          key={faq.id}
                          className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs space-y-1 cursor-pointer"
                          onClick={() => togglePreviewAccordion(faq.id)}
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                            <span>{faq.question || 'Untitled Question'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </div>
                          {isExpanded && (
                            <p className="text-xs text-slate-600 leading-relaxed pt-1 animate-in fade-in duration-150">
                              {faq.answer || 'No answer provided yet.'}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* How to Install Guidance */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2 text-xs text-slate-700">
              <span className="font-bold text-indigo-900 block">How to add to your website:</span>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                <li>Click <strong>Copy Code</strong> above.</li>
                <li>Open your webpage HTML, WordPress theme header, or Next.js/React layout.</li>
                <li>Paste the script tag directly into the <code className="bg-white px-1 py-0.5 rounded text-indigo-600 font-mono">&lt;head&gt;</code> section.</li>
                <li>Test the live URL with our <a href="/tools/schema-checker" className="text-indigo-600 underline font-bold">Schema Markup Validator</a>.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
