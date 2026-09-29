import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SeoHead } from '../components/common/SeoHead';
import { AdSlot } from '../components/common/AdSlot';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'cookies' | 'how-it-works';
}

export const LegalPages: React.FC<LegalPageProps> = ({ type }) => {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      h1: 'Privacy Policy',
      lastUpdated: 'March 2026',
      body: (
        <>
          <p>
            Welcome to SEO Report Tools (seoreporttools.com). We respect your privacy and are committed to maintaining a secure, transparent platform. This Privacy Policy outlines our practices regarding data collection and usage.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">1. Anonymous Tool Usage</h2>
          <p>
            SEO Report Tools operates entirely without public user registration. Visitors are not required to create accounts, provide passwords, or submit personal credentials to access any of our 30+ SEO analysis tools.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">2. Temporary Website Crawl Data</h2>
          <p>
            When you enter a website URL into our diagnostic tools, our server-side crawler fetches the publicly accessible HTML source code and HTTP response headers for that URL. We do not inspect private or password-protected content. Scanned audit data is cached temporarily to minimize duplicate server loads and is automatically purged on a rolling basis.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">3. Cookies and Advertising</h2>
          <p>
            We use Google AdSense and standard third-party advertising partners to display non-intrusive advertisements that fund our free platform. These providers may use cookies, web beacons, or similar technologies to serve relevant ads based on prior visits to this or other websites across the Internet. You can manage or disable personalized advertising by visiting Google Ad Settings (adssettings.google.com).
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">4. Third-Party APIs &amp; External Integrations</h2>
          <p>
            When utilizing AI-assisted features (such as our AI SEO Advisor), structured technical findings (such as status codes, title lengths, and heading counts) are processed securely server-side via Google Gemini models. No user personally identifiable information (PII) is transmitted.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">5. Data Retention &amp; Security</h2>
          <p>
            We implement strict security measures, including Server-Side Request Forgery (SSRF) protections, rate limits, and SSL encryption. We do not sell, rent, or trade visitor data under any circumstances.
          </p>
        </>
      ),
    },
    terms: {
      title: 'Terms of Service',
      h1: 'Terms of Service',
      lastUpdated: 'March 2026',
      body: (
        <>
          <p>
            By accessing or using SEO Report Tools (seoreporttools.com), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">1. Permitted Use</h2>
          <p>
            All tools and reports provided on SEO Report Tools are for legitimate website auditing, diagnostics, educational, and optimization purposes. You agree not to use our crawler for abusive activities, including denial-of-service (DoS) attempts, internal network probing, or scanning unlawful materials.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">2. No Guarantee of Rankings</h2>
          <p>
            SEO Report Tools provides diagnostic benchmarks and educational recommendations based on established search engine guidelines and web standards. We make no representations, warranties, or guarantees regarding search engine rank positions, organic traffic increases, or search algorithmic updates.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">3. Disclaimer of Warranties</h2>
          <p>
            Our services and tools are provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">4. Limitation of Liability</h2>
          <p>
            In no event shall SEO Report Tools or its operators be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our tools.
          </p>
        </>
      ),
    },
    cookies: {
      title: 'Cookie Policy',
      h1: 'Cookie Policy',
      lastUpdated: 'March 2026',
      body: (
        <>
          <p>
            This Cookie Policy explains how SEO Report Tools uses cookies and similar tracking technologies to recognize you when you visit our website.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your computer or mobile device when you browse websites. They are widely used to make websites work efficiently and provide reporting metrics.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">2. Essential Cookies</h2>
          <p>
            These cookies are strictly necessary to enable core site navigation, security features, and cache management.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">3. Advertising &amp; Third-Party Cookies</h2>
          <p>
            We monetize our platform through display advertising via Google AdSense. Google and third-party advertising vendors use cookies to serve ads based on your visits to our site and other sites on the web.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">4. How to Manage Cookies</h2>
          <p>
            You have the right to accept or decline cookies through your browser settings. Most browsers provide instructions in their help menus for disabling or deleting cookies.
          </p>
        </>
      ),
    },
    'how-it-works': {
      title: 'How It Works',
      h1: 'How Our SEO Crawler & Diagnostics Work',
      lastUpdated: 'March 2026',
      body: (
        <>
          <p>
            SEO Report Tools operates a secure, high-performance web crawler and diagnostics engine designed to evaluate web pages exactly as modern search engine bots do.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">1. Server-Side Fetch &amp; Security Handshake</h2>
          <p>
            When a URL is submitted, our backend server performs strict Server-Side Request Forgery (SSRF) checks, blocking requests to private IP ranges (127.0.0.1, 10.0.0.0/8, 192.168.0.0/16, etc.) and cloud metadata endpoints. Once validated, our crawler connects via HTTPS, measures Time to First Byte (TTFB) latency, and verifies TLS certificates.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">2. Document Parsing &amp; Extraction</h2>
          <p>
            Our crawler downloads the HTML document (up to 5MB) and parses it using Cheerio. We extract title tags, meta descriptions, rel="canonical" attributes, robots directives, Open Graph cards, H1–H6 heading trees, image alt text, internal links, and Schema.org JSON-LD scripts.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">3. Scoring Engine &amp; AI Advisor</h2>
          <p>
            Extracted metrics are evaluated against 7 transparent weighted categories. Checks return PASS (100%), WARNING (50%), or FAIL (0%). The overall score (0–100) is calculated without penalizing unconfigured third-party metrics. When requested, structured audit findings are passed server-side to Gemini models to generate a prioritized 30-day action plan.
          </p>
        </>
      ),
    },
  }[type];

  const legalPaths: Record<string, string> = {
    privacy: '/privacy-policy',
    terms: '/terms',
    cookies: '/cookie-policy',
    'how-it-works': '/how-it-works',
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <SeoHead
        title={content.title}
        description={`${content.h1} for SEO Report Tools (seoreporttools.com).`}
        canonicalPath={legalPaths[type] || '/terms'}
      />

      <Breadcrumbs items={[{ label: content.title }]} />

      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {content.h1}
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Last Updated: {content.lastUpdated}
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
        {content.body}
      </div>

      <AdSlot format="horizontal" />
    </div>
  );
};
