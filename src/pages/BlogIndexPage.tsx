import React, { useState } from 'react';
import { BLOG_POSTS } from '../data/blogData';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { AdSlot } from '../components/common/AdSlot';
import { Clock, Search, ArrowRight, BookOpen } from 'lucide-react';

export const BlogIndexPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const categories = [
    'all',
    'SEO Audits',
    'Technical SEO',
    'On-Page SEO',
    'Performance',
    'Authority & Links',
    'Structured Data',
    'Security',
  ];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'all' || post.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const blogIndexJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'SEO Guides & Knowledge Hub',
    description: 'Expert SEO tutorials and guides on technical audits, meta tag optimization, Core Web Vitals, and keyword research.',
    url: 'https://seoreporttools.com/blog',
    blogPost: BLOG_POSTS.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.excerpt,
      datePublished: p.date,
      url: `https://seoreporttools.com/blog/${p.slug}`,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <SeoHead
        title="SEO Guides, Tutorials & Best Practices Blog"
        description="Master search engine optimization with in-depth guides on technical SEO, on-page optimization, Core Web Vitals, backlink audits, and meta tags."
        canonicalPath="/blog"
        jsonLd={blogIndexJsonLd}
      />

      <Breadcrumbs items={[{ label: 'SEO Guides & Knowledge Hub' }]} />

      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          Expert SEO Guides
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          SEO Guides, Tutorials &amp; Research
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Genuinely helpful, practical guides on technical SEO, on-page optimization, Core Web Vitals, and search engine best practices.
        </p>
      </div>

      <AdSlot format="horizontal" />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors capitalize ${
                selectedCat === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Post Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-600 hover:shadow-md transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold text-indigo-600 uppercase tracking-wider">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readingTime}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">{post.date}</span>
              <span className="font-bold text-indigo-600 flex items-center gap-1">
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </a>
        ))}
      </div>

      <AdSlot format="horizontal" />
    </div>
  );
};
