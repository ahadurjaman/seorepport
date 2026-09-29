import React from 'react';
import { BlogPost } from '../types/seo';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { AdSlot } from '../components/common/AdSlot';
import { TOOLS } from '../data/toolsData';
import { Clock, Calendar, User, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

interface BlogPostPageProps {
  post: BlogPost;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ post }) => {
  // Find related tools objects
  const relatedTools = post.relatedTools
    .map((slug) => TOOLS.find((t) => t.slug === slug))
    .filter(Boolean);

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.seoMetaDesc,
        datePublished: post.date,
        dateModified: post.date,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://seoreporttools.com/blog/${post.slug}`,
        },
        author: {
          '@type': 'Organization',
          name: post.author || 'SEO Report Tools Team',
          url: 'https://seoreporttools.com',
        },
        publisher: {
          '@type': 'Organization',
          name: 'SEO Report Tools',
          url: 'https://seoreporttools.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://seoreporttools.com/og-image.png',
          },
        },
      },
      ...(post.faqs && post.faqs.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: post.faqs.map((f) => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: f.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 100% SEO Meta & Schema */}
      <SeoHead
        title={post.seoTitle}
        description={post.seoMetaDesc}
        canonicalPath={`/blog/${post.slug}`}
        ogType="article"
        jsonLd={blogJsonLd}
      />

      <Breadcrumbs
        items={[
          { label: 'Guides', href: '/blog' },
          { label: post.category, href: `/blog#${post.category}` },
          { label: post.title },
        ]}
      />

      {/* Article Header */}
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <User className="w-3.5 h-3.5" /> {post.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> {post.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {post.readingTime}
          </span>
        </div>
      </div>

      <AdSlot format="horizontal" />

      {/* Article Body */}
      <article className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 space-y-6">
        {post.content.map((paragraph, idx) => (
          <p key={idx} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </article>

      <AdSlot format="horizontal" />

      {/* FAQs */}
      {post.faqs.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {post.faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 pl-6 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relevant Tools Callout */}
      {relatedTools.length > 0 && (
        <div className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <Sparkles className="w-4 h-4" /> Recommended Free Tools for This Topic
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedTools.map((t: any) => (
              <a
                key={t.id}
                href={`/tools/${t.slug}`}
                className="rounded-2xl border border-indigo-100 bg-white p-4 hover:border-indigo-600 hover:shadow-sm transition-all group"
              >
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {t.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {t.shortDesc}
                </p>
                <span className="text-[11px] font-bold text-indigo-600 mt-2 block">
                  Run Free Check →
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      <AdSlot format="horizontal" />
    </div>
  );
};
