export type CheckStatus = 'PASS' | 'WARNING' | 'FAIL' | 'NOT_AVAILABLE';

export interface AuditCheck {
  id: string;
  name: string;
  status: CheckStatus;
  category: 'technical' | 'onpage' | 'performance' | 'mobile' | 'security' | 'content' | 'links';
  score: number; // 0 to 100
  weight: number;
  value?: string | number | boolean;
  message: string;
  recommendation?: string;
  details?: Record<string, any>;
}

export interface CategoryScore {
  category: string;
  label: string;
  score: number;
  weight: number;
  passCount: number;
  warningCount: number;
  failCount: number;
  checks: AuditCheck[];
}

export interface AiRecommendationIssue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  explanation: string;
  recommendation: string;
  implementation_steps: string[];
}

export interface AiRecommendationResult {
  summary: string;
  priority: string;
  issues: AiRecommendationIssue[];
  quick_wins: string[];
  action_plan: {
    phase: string;
    timeline: string;
    tasks: string[];
  }[];
}

export interface GooglePageSpeedData {
  dataSource: 'google_official_api' | 'live_engine';
  lighthouseScores: {
    seo: number;
    performance: number;
    accessibility: number;
    bestPractices: number;
  };
  coreWebVitals: {
    fcp: { value: number; displayValue: string; status: 'good' | 'needs-improvement' | 'poor' };
    lcp: { value: number; displayValue: string; status: 'good' | 'needs-improvement' | 'poor' };
    cls: { value: number; displayValue: string; status: 'good' | 'needs-improvement' | 'poor' };
    tbt: { value: number; displayValue: string; status: 'good' | 'needs-improvement' | 'poor' };
    speedIndex: { value: number; displayValue: string; status: 'good' | 'needs-improvement' | 'poor' };
    inp?: { value: number; displayValue: string; status: 'good' | 'needs-improvement' | 'poor' };
  };
  googleAudits?: {
    titlePass: boolean;
    titleDescription?: string;
    descriptionPass: boolean;
    descriptionDetails?: string;
    crawlablePass: boolean;
    crawlableDetails?: string;
    robotsTxtPass: boolean;
    imageAltPass: boolean;
    canonicalPass: boolean;
    tapTargetsPass: boolean;
    structuredDataPass: boolean;
    httpsPass: boolean;
    httpStatusCodePass: boolean;
  };
  deviceTested: 'mobile' | 'desktop';
  inspectedAt: string;
}

export interface AuditReport {
  id: string;
  url: string;
  canonicalUrl: string;
  domain: string;
  timestamp: string;
  overallScore: number;
  statusSummary: {
    criticalCount: number;
    warningCount: number;
    passCount: number;
    totalChecks: number;
  };
  categories: {
    technical: CategoryScore;
    onpage: CategoryScore;
    performance: CategoryScore;
    mobile: CategoryScore;
    security: CategoryScore;
    content: CategoryScore;
    links: CategoryScore;
  };
  metadata: {
    title: string;
    titleLength: number;
    description: string;
    descriptionLength: number;
    canonical: string;
    robots: string;
    viewport: string;
    language: string;
    charset: string;
    favicon: string;
    themeColor?: string;
  };
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4Count: number;
    h5Count: number;
    h6Count: number;
  };
  content: {
    wordCount: number;
    characterCount: number;
    readingTimeMinutes: number;
    textToHtmlRatio: number;
    topKeywords: { word: string; count: number; density: number }[];
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    missingAltList: { src: string }[];
  };
  links: {
    total: number;
    internal: number;
    external: number;
    internalLinks: { href: string; text: string; isNofollow: boolean }[];
    externalLinks: { href: string; text: string; isNofollow: boolean }[];
  };
  technical: {
    statusCode: number;
    responseTimeMs: number;
    redirectCount: number;
    redirectChain: string[];
    isHttps: boolean;
    hasHttp2Or3: boolean;
    htmlSizeKb: number;
    isGzipOrBrotli: boolean;
    robotsTxtStatus: CheckStatus;
    robotsTxtFound: boolean;
    sitemapStatus: CheckStatus;
    sitemapFound: boolean;
    sitemapUrl?: string;
    sslCertificate?: {
      valid: boolean;
      issuer: string;
      subject: string;
      validFrom: string;
      validTo: string;
      daysRemaining: number;
      protocol: string;
      isExpired: boolean;
      error?: string;
    };
    dnsRecords?: {
      A?: string[];
      AAAA?: string[];
      MX?: any[];
      TXT?: string[];
      NS?: string[];
    };
    securityHeaders: {
      hsts: boolean;
      csp: boolean;
      xFrameOptions: string | null;
      xContentTypeOptions: string | null;
      referrerPolicy: string | null;
      permissionsPolicy: string | null;
    };
  };
  googlePageSpeed?: GooglePageSpeedData;
  openGraph: {
    hasOg: boolean;
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    twitterCard?: string;
  };
  schema: {
    hasSchema: boolean;
    typesFound: string[];
    itemsCount: number;
    schemas: any[];
  };
  aiRecommendations?: AiRecommendationResult;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  category: 'technical' | 'onpage' | 'performance' | 'backlinks' | 'keywords' | 'security' | 'structured-data' | 'ai';
  categoryLabel: string;
  shortDesc: string;
  seoTitle: string;
  seoMetaDesc: string;
  h1: string;
  intro: string;
  howToUse: string[];
  whyItMatters: string;
  examples: string[];
  limitations: string;
  faqs: { question: string; answer: string }[];
  relatedTools: string[]; // slugs
  icon: string;
  inputType: 'url' | 'text' | 'domain';
  inputPlaceholder: string;
  actionButtonText: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  date: string;
  author: string;
  seoTitle: string;
  seoMetaDesc: string;
  content: string[];
  faqs: { question: string; answer: string }[];
  relatedTools: string[];
}
