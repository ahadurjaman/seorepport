import React, { useState } from 'react';
import { TOOLS } from '../data/toolsData';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { AdSlot } from '../components/common/AdSlot';
import { Search, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ToolsDirectoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All 30 Tools' },
    { id: 'technical', label: 'Technical SEO' },
    { id: 'onpage', label: 'On-Page SEO' },
    { id: 'performance', label: 'Performance & Speed' },
    { id: 'backlinks', label: 'Authority & Backlinks' },
    { id: 'keywords', label: 'Content & Keywords' },
    { id: 'security', label: 'Security & Protocol' },
    { id: 'structured-data', label: 'Structured Data' },
    { id: 'ai', label: 'AI SEO' },
  ];

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const directoryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Complete Free SEO Tools Directory',
    description: 'Explore 30+ free professional SEO tools for website audits, meta tags, page speed, backlinks, and schema verification.',
    url: 'https://seoreporttools.com/tools',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: TOOLS.map((t, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: t.name,
        url: `https://seoreporttools.com/tools/${t.slug}`,
        description: t.shortDesc,
      })),
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <SeoHead
        title="All 30+ Free SEO Tools Directory — Complete Web SEO Suite"
        description="Explore 30+ free professional SEO tools to analyze, diagnose, and optimize your website. Check technical SEO, meta tags, speed, backlinks, and security with zero signup."
        canonicalPath="/tools"
        jsonLd={directoryJsonLd}
      />

      <Breadcrumbs items={[{ label: 'Free SEO Tools Directory' }]} />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          100% Free Forever
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Complete Free SEO Tools Directory
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Explore 30 dedicated single-purpose and full-suite SEO tools to audit, diagnose, and optimize your website with no login, no subscription, and no paywalls.
        </p>
      </div>

      {/* AdSlot Above Grid */}
      <AdSlot format="horizontal" />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by tool name or function..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <a
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-600 hover:shadow-md transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  {tool.categoryLabel}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Free
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {tool.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {tool.shortDesc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Instant Access</span>
              <span className="font-bold text-indigo-600 flex items-center gap-1">
                Open Tool <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* AdSlot Below Grid */}
      <AdSlot format="horizontal" />
    </div>
  );
};
