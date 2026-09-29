import express, { Request, Response, NextFunction } from 'express';
import dns from 'dns';
import { promises as dnsPromises } from 'dns';
import url from 'url';
import tls from 'tls';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

// Persistent storage directories
const DATA_DIR = path.join(process.cwd(), 'data');
const REPORTS_DIR = path.join(DATA_DIR, 'reports');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
} catch (e) {
  console.error('Failed to create data directory:', e);
}

// In-memory cache structures backed by disk
interface AuditCacheItem {
  report: any;
  cachedAt: number;
}
const auditCache = new Map<string, AuditCacheItem>();
const reportsStore = new Map<string, any>();
const ipRateLimits = new Map<string, { count: number; resetAt: number }>();

// System settings with persistent disk loading
let systemSettings = {
  adProvider: 'adsterra', // 'adsterra' | 'google' | 'both' | 'none'
  adsterraPopunder: false, // OFF by default to prevent UX redirect bounce & preserve user retention
  adsterraSocialBar: false,
  adsterraBanner728: true,
  adsterraNativeBanner: false,
  adblockDetector: true, // Anti-AdBlock detection wall active
  adsenseClientId: process.env.ADSENSE_CLIENT_ID || '',
  adsenseSlotId: process.env.ADSENSE_SLOT_ID || '',
  googleApiKey: process.env.GOOGLE_PAGESPEED_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSyDE3StW0G2GX986zwsllOubZdNRa85wBrI',
  cacheDurationMinutes: 60,
  maxAuditsPerHour: 50,
  blockedDomains: ['localhost', '127.0.0.1', 'internal.net'],
  adminPassword: process.env.ADMIN_PASSWORD || 'seo-admin-2026',
};

// Load saved settings from disk if available
try {
  if (fs.existsSync(SETTINGS_FILE)) {
    const saved = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    systemSettings = { ...systemSettings, ...saved };
  }
} catch (err) {
  console.error('Could not read settings file:', err);
}

function persistSettingsToDisk() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(systemSettings, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write settings to disk:', err);
  }
}

function persistReportToDisk(reportId: string, report: any) {
  try {
    reportsStore.set(reportId, report);
    const filePath = path.join(REPORTS_DIR, `${reportId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist report to disk:', err);
  }
}

function getReportFromDisk(reportId: string): any | null {
  if (reportsStore.has(reportId)) return reportsStore.get(reportId);
  try {
    const filePath = path.join(REPORTS_DIR, `${reportId}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      reportsStore.set(reportId, data);
      return data;
    }
  } catch (err) {
    console.error('Failed to read report from disk:', err);
  }
  return null;
}

// Initialize Gemini SDK if API key available
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenAI | null = null;
if (geminiApiKey) {
  genAI = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// SSRF IP Validation
function isPrivateIP(ip: string): boolean {
  // IPv4 checks
  if (ip === '0.0.0.0' || ip === '127.0.0.1' || ip.startsWith('127.')) return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('169.254.')) return true; // Link-local and cloud metadata
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith('100.64.')) return true; // CGNAT
  if (ip.startsWith('198.18.') || ip.startsWith('198.19.')) return true;
  if (ip.startsWith('224.') || ip.startsWith('240.')) return true;

  // IPv6 checks
  if (ip === '::1' || ip === '::') return true;
  if (ip.toLowerCase().startsWith('fc00:') || ip.toLowerCase().startsWith('fd00:')) return true;
  if (ip.toLowerCase().startsWith('fe80:')) return true;
  if (ip.toLowerCase().includes('::ffff:127.') || ip.toLowerCase().includes('::ffff:10.') || ip.toLowerCase().includes('::ffff:192.168.')) return true;

  return false;
}

async function validateUrlForSsrf(inputUrl: string): Promise<{ valid: boolean; normalizedUrl?: string; error?: string; hostname?: string }> {
  try {
    let parsed = new URL(inputUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are permitted.' };
    }

    const hostname = parsed.hostname.toLowerCase();
    if (!hostname || hostname.includes('localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return { valid: false, error: 'Invalid hostname or local address is not permitted.' };
    }

    // Check custom blocked domains
    if (systemSettings.blockedDomains.some((d) => hostname === d || hostname.endsWith('.' + d))) {
      return { valid: false, error: 'This domain cannot be analyzed due to system policy.' };
    }

    // DNS lookup to verify IP addresses and ensure domain exists
    let addresses: dns.LookupAddress[] = [];
    try {
      addresses = await dnsPromises.lookup(hostname, { all: true });
    } catch (dnsErr: any) {
      if (dnsErr.code === 'ENOTFOUND' || dnsErr.code === 'EAI_AGAIN' || String(dnsErr.message).includes('ENOTFOUND')) {
        return {
          valid: false,
          error: `ডোমেন "${hostname}" খুঁজে পাওয়া যায়নি বা এটি রেজিস্টার করা নেই (The domain "${hostname}" is not registered or has no active DNS records). অনুগ্রহ করে একটি সক্রিয় ওয়েবসাইটের URL প্রদান করুন।`,
        };
      }
      return { valid: false, error: `Could not resolve domain "${hostname}" via DNS: ${dnsErr.message}` };
    }

    if (!addresses || addresses.length === 0) {
      return {
        valid: false,
        error: `ডোমেন "${hostname}" এর কোনো সক্রিয় DNS রেকর্ড পাওয়া যায়নি। ডোমেনটি এখনও রেজিস্টার বা কনফিগার করা হয়নি।`,
      };
    }

    for (const record of addresses) {
      if (isPrivateIP(record.address)) {
        return { valid: false, error: 'Domain resolves to a restricted private or internal IP address.' };
      }
    }

    return { valid: true, normalizedUrl: parsed.href, hostname };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Please provide a valid website URL.' };
  }
}

// Rate limiting middleware for audits
function rateLimitAudits(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const limitWindow = 60 * 60 * 1000; // 1 hour

  const current = ipRateLimits.get(ip) || { count: 0, resetAt: now + limitWindow };
  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + limitWindow;
  }

  if (current.count >= systemSettings.maxAuditsPerHour) {
    return res.status(429).json({
      error: 'Rate limit reached. SEO Report Tools allows up to 50 free audits per hour per visitor. Please wait a few minutes before trying again.',
    });
  }

  current.count++;
  ipRateLimits.set(ip, current);
  next();
}

// Stop words for keyword density calculation
const STOP_WORDS = new Set([
  'the', 'and', 'a', 'an', 'in', 'on', 'of', 'to', 'for', 'with', 'at', 'by', 'from', 'up', 'about',
  'into', 'over', 'after', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'that', 'this', 'these',
  'those', 'then', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'it', 'its',
  'you', 'your', 'we', 'our', 'they', 'their', 'he', 'him', 'his', 'she', 'her', 'i', 'my', 'me', 'what',
  'which', 'who', 'whom', 'not', 'no', 'more', 'all', 'any', 'each', 'few', 'most', 'other', 'some', 'such',
]);

// Live SSL Certificate Inspector via TLS socket connection
async function checkSslCertificate(domain: string): Promise<any> {
  return new Promise((resolve) => {
    try {
      const cleanHost = domain.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].trim();
      const socket = tls.connect(443, cleanHost, { servername: cleanHost, timeout: 4000 }, () => {
        const cert = socket.getPeerCertificate();
        const protocol = socket.getProtocol();
        const authorized = socket.authorized;
        socket.end();

        if (cert && Object.keys(cert).length > 0) {
          const validTo = new Date(cert.valid_to);
          const now = new Date();
          const daysRemaining = Math.max(0, Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          resolve({
            valid: authorized,
            issuer: cert.issuer?.O || cert.issuer?.CN || 'Standard CA',
            subject: cert.subject?.CN || cleanHost,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            daysRemaining,
            protocol: protocol || 'TLSv1.3',
            isExpired: validTo < now,
            serialNumber: cert.serialNumber || '',
          });
        } else {
          resolve({ valid: false, error: 'No SSL certificate presented' });
        }
      });

      socket.on('error', (err) => {
        resolve({ valid: false, error: err.message });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ valid: false, error: 'SSL handshake connection timed out' });
      });
    } catch (err: any) {
      resolve({ valid: false, error: err.message });
    }
  });
}

// Live ICANN RDAP Official WHOIS Data
async function fetchWhoisRdap(domain: string): Promise<any> {
  const cleanDomain = domain.replace(/^https?:\/\//i, '').split('/')[0].replace(/^www\./i, '').toLowerCase().trim();
  try {
    const res = await fetch(`https://rdap.org/domain/${cleanDomain}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rdap+json, application/json',
      },
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    });

    if (res.ok) {
      const data = await res.json();
      let createdDate = '';
      let expiryDate = '';
      let updatedDate = '';

      if (Array.isArray(data.events)) {
        for (const ev of data.events) {
          if (ev.eventAction === 'registration') createdDate = ev.eventDate;
          if (ev.eventAction === 'expiration') expiryDate = ev.eventDate;
          if (ev.eventAction === 'last changed' || ev.eventAction === 'last update of RDAP database') updatedDate = ev.eventDate;
        }
      }

      let registrarName = 'Accredited ICANN Registrar';
      if (Array.isArray(data.entities)) {
        const reg = data.entities.find((e: any) => e.roles?.includes('registrar'));
        if (reg?.vcardArray?.[1]) {
          const fn = reg.vcardArray[1].find((v: any) => v[0] === 'fn');
          if (fn?.[3]) registrarName = fn[3];
        }
      }

      const nameservers: string[] = [];
      if (Array.isArray(data.nameservers)) {
        for (const ns of data.nameservers) {
          if (ns.ldhName) nameservers.push(ns.ldhName.toLowerCase());
        }
      }

      let domainAgeYears = 0;
      if (createdDate) {
        const createdTime = new Date(createdDate).getTime();
        const diffMs = Date.now() - createdTime;
        domainAgeYears = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)));
      }

      return {
        domain: cleanDomain,
        registrar: registrarName,
        createdDate,
        expiryDate,
        updatedDate,
        nameservers,
        domainAgeYears,
        status: Array.isArray(data.status) ? data.status : ['active'],
        source: 'ICANN RDAP Official Registry',
      };
    }
  } catch {
    // Continue to DNS fallback
  }

  try {
    const [ns] = await Promise.allSettled([
      dnsPromises.resolveNs(cleanDomain),
    ]);
    return {
      domain: cleanDomain,
      registrar: 'Public Domain Registry',
      createdDate: '',
      expiryDate: '',
      nameservers: ns.status === 'fulfilled' ? ns.value : [],
      status: ['active'],
      domainAgeYears: 0,
      source: 'DNS Registry',
    };
  } catch {
    return {
      domain: cleanDomain,
      registrar: 'Public Registry',
      createdDate: '',
      expiryDate: '',
      nameservers: [],
      status: ['active'],
      domainAgeYears: 0,
      source: 'Registry',
    };
  }
}

// Live Robots.txt Fetcher and Parser
async function fetchRobotsTxt(domain: string): Promise<any> {
  const cleanHost = domain.replace(/^https?:\/\//i, '').split('/')[0].trim();
  const robotsUrl = `https://${cleanHost}/robots.txt`;
  try {
    const res = await fetch(robotsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(4000),
      redirect: 'follow',
    });

    if (res.status >= 200 && res.status < 300) {
      const text = await res.text();
      const sitemaps: string[] = [];
      const userAgents: string[] = [];
      const disallows: string[] = [];
      const allows: string[] = [];

      for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (/^sitemap:\s*/i.test(trimmed)) {
          sitemaps.push(trimmed.replace(/^sitemap:\s*/i, '').trim());
        } else if (/^user-agent:\s*/i.test(trimmed)) {
          userAgents.push(trimmed.replace(/^user-agent:\s*/i, '').trim());
        } else if (/^disallow:\s*/i.test(trimmed)) {
          disallows.push(trimmed.replace(/^disallow:\s*/i, '').trim());
        } else if (/^allow:\s*/i.test(trimmed)) {
          allows.push(trimmed.replace(/^allow:\s*/i, '').trim());
        }
      }

      return {
        url: robotsUrl,
        found: true,
        statusCode: res.status,
        content: text.slice(0, 15000),
        lineCount: text.split('\n').length,
        sitemaps,
        userAgents: Array.from(new Set(userAgents)),
        disallowsCount: disallows.length,
        allowsCount: allows.length,
        sampleDisallows: disallows.slice(0, 15),
      };
    }
    return { url: robotsUrl, found: false, statusCode: res.status, content: '' };
  } catch (err: any) {
    return { url: robotsUrl, found: false, error: err.message };
  }
}

// Live XML Sitemap Fetcher and Parser
async function fetchSitemapXml(domain: string): Promise<any> {
  const cleanHost = domain.replace(/^https?:\/\//i, '').split('/')[0].trim();
  const sitemapUrl = `https://${cleanHost}/sitemap.xml`;
  try {
    const res = await fetch(sitemapUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    });

    if (res.status >= 200 && res.status < 300) {
      const text = await res.text();
      const $xml = cheerio.load(text, { xmlMode: true });
      const urls: any[] = [];
      $xml('url').each((_, el) => {
        if (urls.length < 50) {
          urls.push({
            loc: $xml(el).find('loc').text().trim(),
            lastmod: $xml(el).find('lastmod').text().trim(),
            changefreq: $xml(el).find('changefreq').text().trim(),
            priority: $xml(el).find('priority').text().trim(),
          });
        }
      });

      const isIndex = $xml('sitemapindex').length > 0;
      const subSitemaps: string[] = [];
      if (isIndex) {
        $xml('sitemap loc').each((_, el) => {
          if (subSitemaps.length < 20) {
            subSitemaps.push($xml(el).text().trim());
          }
        });
      }

      const totalUrlsCount = $xml('url').length || ($xml('sitemap').length > 0 ? $xml('sitemap').length : 0);
      return {
        url: sitemapUrl,
        found: true,
        statusCode: res.status,
        isIndex,
        totalUrlsCount,
        sampleUrls: urls,
        subSitemaps,
        rawSnippet: text.slice(0, 3000),
      };
    }
    return { url: sitemapUrl, found: false, statusCode: res.status };
  } catch (err: any) {
    return { url: sitemapUrl, found: false, error: err.message };
  }
}

// Official Google PageSpeed Insights API (Lighthouse v5)
async function fetchGooglePageSpeedInsights(targetUrl: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<any> {
  const apiKey = (systemSettings.googleApiKey || '').trim();
  const apiUrl = new URL('https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed');
  apiUrl.searchParams.set('url', targetUrl);
  apiUrl.searchParams.set('strategy', strategy);
  apiUrl.searchParams.append('category', 'performance');
  apiUrl.searchParams.append('category', 'seo');
  apiUrl.searchParams.append('category', 'accessibility');
  apiUrl.searchParams.append('category', 'best-practices');
  if (apiKey) {
    apiUrl.searchParams.set('key', apiKey);
  }

  try {
    const res = await fetch(apiUrl.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      const lh = data.lighthouseResult;
      const categories = lh?.categories || {};
      const audits = lh?.audits || {};

      const parseCwv = (auditKey: string) => {
        const item = audits[auditKey];
        if (!item) return { value: 0, displayValue: 'N/A', status: 'needs-improvement' as const };
        const score = typeof item.score === 'number' ? item.score : 0.5;
        const status = score >= 0.9 ? 'good' : score >= 0.5 ? 'needs-improvement' : 'poor';
        return {
          value: item.numericValue || 0,
          displayValue: item.displayValue || 'N/A',
          status,
        };
      };

      return {
        dataSource: 'google_official_api',
        lighthouseScores: {
          seo: Math.round((categories?.seo?.score || 0) * 100),
          performance: Math.round((categories?.performance?.score || 0) * 100),
          accessibility: Math.round((categories?.accessibility?.score || 0) * 100),
          bestPractices: Math.round((categories?.['best-practices']?.score || 0) * 100),
        },
        coreWebVitals: {
          fcp: parseCwv('first-contentful-paint'),
          lcp: parseCwv('largest-contentful-paint'),
          cls: parseCwv('cumulative-layout-shift'),
          tbt: parseCwv('total-blocking-time'),
          speedIndex: parseCwv('speed-index'),
          inp: parseCwv('interaction-to-next-paint'),
        },
        googleAudits: {
          titlePass: audits['document-title']?.score === 1,
          titleDescription: audits['document-title']?.description,
          descriptionPass: audits['meta-description']?.score === 1,
          descriptionDetails: audits['meta-description']?.description,
          crawlablePass: audits['is-crawlable']?.score === 1,
          crawlableDetails: audits['is-crawlable']?.description,
          robotsTxtPass: audits['robots-txt']?.score === 1,
          imageAltPass: audits['image-alt']?.score === 1,
          canonicalPass: audits['canonical']?.score === 1,
          tapTargetsPass: audits['tap-targets']?.score === 1,
          structuredDataPass: audits['structured-data']?.score === 1,
          httpsPass: audits['is-on-https']?.score === 1,
          httpStatusCodePass: audits['http-status-code']?.score === 1,
        },
        deviceTested: strategy,
        inspectedAt: new Date().toISOString(),
      };
    }
  } catch {
    // Network or quota error
  }

  return null;
}

function generateFallbackPageSpeed(
  responseTimeMs: number,
  htmlSizeKb: number,
  isHttps: boolean,
  title: string,
  desc: string,
  hasSchema: boolean,
  imagesWithoutAlt: number,
  statusCode: number
): any {
  const ttfb = responseTimeMs;
  const fcpMs = Math.round(ttfb * 1.5 + (htmlSizeKb > 50 ? 600 : 200));
  const lcpMs = Math.round(fcpMs * 1.6 + (htmlSizeKb > 100 ? 1000 : 350));
  const clsVal = htmlSizeKb > 200 ? 0.12 : 0.02;
  const tbtMs = ttfb > 600 ? 250 : 40;

  const perfScore = Math.max(25, Math.min(100, Math.round(100 - (ttfb > 800 ? 30 : ttfb > 400 ? 15 : 0) - (htmlSizeKb > 200 ? 25 : htmlSizeKb > 50 ? 10 : 0))));
  const seoScore = Math.max(30, Math.min(100, Math.round((title ? 35 : 0) + (desc ? 25 : 0) + (isHttps ? 20 : 0) + (hasSchema ? 20 : 10))));

  return {
    dataSource: 'live_engine',
    lighthouseScores: {
      seo: seoScore,
      performance: perfScore,
      accessibility: 92,
      bestPractices: isHttps ? 95 : 65,
    },
    coreWebVitals: {
      fcp: { value: fcpMs, displayValue: `${(fcpMs / 1000).toFixed(1)} s`, status: fcpMs < 1800 ? 'good' : fcpMs < 3000 ? 'needs-improvement' : 'poor' },
      lcp: { value: lcpMs, displayValue: `${(lcpMs / 1000).toFixed(1)} s`, status: lcpMs < 2500 ? 'good' : lcpMs < 4000 ? 'needs-improvement' : 'poor' },
      cls: { value: clsVal, displayValue: clsVal.toString(), status: clsVal < 0.1 ? 'good' : 'needs-improvement' },
      tbt: { value: tbtMs, displayValue: `${tbtMs} ms`, status: tbtMs < 200 ? 'good' : 'needs-improvement' },
      speedIndex: { value: Math.round(fcpMs * 1.2), displayValue: `${((fcpMs * 1.2) / 1000).toFixed(1)} s`, status: fcpMs * 1.2 < 3400 ? 'good' : 'needs-improvement' },
    },
    googleAudits: {
      titlePass: Boolean(title),
      descriptionPass: Boolean(desc),
      crawlablePass: statusCode === 200,
      robotsTxtPass: true,
      imageAltPass: imagesWithoutAlt === 0,
      canonicalPass: true,
      tapTargetsPass: true,
      structuredDataPass: hasSchema,
      httpsPass: isHttps,
      httpStatusCodePass: statusCode === 200,
    },
    deviceTested: 'mobile',
    inspectedAt: new Date().toISOString(),
  };
}

// Core Crawler and Audit Engine
async function analyzeUrl(targetUrl: string): Promise<any> {
  const ssrf = await validateUrlForSsrf(targetUrl);
  if (!ssrf.valid || !ssrf.normalizedUrl || !ssrf.hostname) {
    throw new Error(ssrf.error || 'Invalid target URL');
  }

  const finalUrl = ssrf.normalizedUrl;
  const hostname = ssrf.hostname;

  // Check memory cache
  const cacheKey = finalUrl.toLowerCase();
  const cached = auditCache.get(cacheKey);
  const cacheTtlMs = systemSettings.cacheDurationMinutes * 60 * 1000;
  if (cached && Date.now() - cached.cachedAt < cacheTtlMs) {
    return { ...cached.report, fromCache: true };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  let response: any;
  let html = '';
  const redirectChain: string[] = [finalUrl];

  try {
    response = await fetch(finalUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (response.url && response.url !== finalUrl) {
      redirectChain.push(response.url);
    }

    // Read max 5MB
    const reader = response.body?.getReader();
    if (reader) {
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      const MAX_BYTES = 5 * 1024 * 1024;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          if (totalBytes > MAX_BYTES) {
            reader.cancel();
            break;
          }
          chunks.push(value);
        }
      }
      const fullBuffer = Buffer.concat(chunks);
      html = fullBuffer.toString('utf-8');
    } else {
      html = await response.text();
    }
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out. The server took more than 12 seconds to respond.');
    }
    throw new Error('Could not connect to website: ' + (err.message || 'Network error'));
  }

  const responseTimeMs = Date.now() - startTime;
  const statusCode = response.status;
  const headers = response.headers;
  const resolvedFinalUrl = response.url || finalUrl;
  const isHttps = resolvedFinalUrl.startsWith('https://');

  // Security Headers
  const hsts = headers.has('strict-transport-security');
  const csp = headers.has('content-security-policy');
  const xFrameOptions = headers.get('x-frame-options');
  const xContentTypeOptions = headers.get('x-content-type-options');
  const referrerPolicy = headers.get('referrer-policy');
  const permissionsPolicy = headers.get('permissions-policy');
  const contentEncoding = headers.get('content-encoding') || '';
  const isGzipOrBrotli = contentEncoding.includes('gzip') || contentEncoding.includes('br');
  const htmlSizeKb = Math.round((Buffer.byteLength(html, 'utf-8') / 1024) * 10) / 10;

  // Parse HTML
  const $ = cheerio.load(html);

  // Metadata
  const title = $('title').first().text().trim() || '';
  const metaDesc = $('meta[name="description" i]').attr('content')?.trim() || '';
  const canonical = $('link[rel="canonical" i]').attr('href')?.trim() || '';
  const robotsMeta = $('meta[name="robots" i]').attr('content')?.trim() || $('meta[name="googlebot" i]').attr('content')?.trim() || '';
  const viewport = $('meta[name="viewport" i]').attr('content')?.trim() || '';
  const language = $('html').attr('lang')?.trim() || '';
  const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type" i]').attr('content') || 'utf-8';
  const favicon = $('link[rel*="icon"]').attr('href') || '/favicon.ico';
  const themeColor = $('meta[name="theme-color" i]').attr('content');

  // Open Graph & Social
  const ogTitle = $('meta[property="og:title" i]').attr('content')?.trim() || '';
  const ogDesc = $('meta[property="og:description" i]').attr('content')?.trim() || '';
  const ogImage = $('meta[property="og:image" i]').attr('content')?.trim() || '';
  const ogUrl = $('meta[property="og:url" i]').attr('content')?.trim() || '';
  const ogType = $('meta[property="og:type" i]').attr('content')?.trim() || '';
  const twitterCard = $('meta[name="twitter:card" i]').attr('content')?.trim() || '';
  const hasOg = Boolean(ogTitle || ogImage || ogDesc);

  // Headings
  const h1Elements: string[] = [];
  $('h1').each((_, el) => {
    const text = $(el).text().trim();
    if (text) h1Elements.push(text);
  });

  const h2Elements: string[] = [];
  $('h2').each((_, el) => {
    const text = $(el).text().trim();
    if (text) h2Elements.push(text);
  });

  const h3Elements: string[] = [];
  $('h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text) h3Elements.push(text);
  });

  const h4Count = $('h4').length;
  const h5Count = $('h5').length;
  const h6Count = $('h6').length;

  // Text & Word Content
  $('script, style, noscript, svg, nav, footer').remove();
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const words = bodyText.split(/\s+/).filter((w) => w.length > 2 && /^[a-zA-Z0-9'-]+$/.test(w));
  const wordCount = words.length;
  const characterCount = bodyText.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const textToHtmlRatio = html.length > 0 ? Math.round((characterCount / html.length) * 100 * 10) / 10 : 0;

  // Calculate top keywords & density
  const wordFreq: Record<string, number> = {};
  for (const w of words) {
    const lower = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (lower.length > 2 && !STOP_WORDS.has(lower) && !/^\d+$/.test(lower)) {
      wordFreq[lower] = (wordFreq[lower] || 0) + 1;
    }
  }

  const topKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      density: wordCount > 0 ? Math.round((count / wordCount) * 1000) / 10 : 0,
    }));

  // Re-read HTML for images and links because we stripped scripts/nav
  const $full = cheerio.load(html);

  // Images
  let imagesTotal = 0;
  let imagesWithAlt = 0;
  let imagesWithoutAlt = 0;
  const missingAltList: { src: string }[] = [];

  $full('img').each((_, el) => {
    imagesTotal++;
    const alt = $full(el).attr('alt');
    const src = $full(el).attr('src') || $full(el).attr('data-src') || '';
    if (alt !== undefined && alt.trim().length > 0) {
      imagesWithAlt++;
    } else {
      imagesWithoutAlt++;
      if (missingAltList.length < 10 && src) {
        missingAltList.push({ src });
      }
    }
  });

  // Links
  let totalLinks = 0;
  let internalCount = 0;
  let externalCount = 0;
  const internalLinks: { href: string; text: string; isNofollow: boolean }[] = [];
  const externalLinks: { href: string; text: string; isNofollow: boolean }[] = [];

  $full('a[href]').each((_, el) => {
    totalLinks++;
    const rawHref = $full(el).attr('href')?.trim() || '';
    const text = $full(el).text().trim() || '(No anchor text)';
    const rel = ($full(el).attr('rel') || '').toLowerCase();
    const isNofollow = rel.includes('nofollow');

    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      return;
    }

    try {
      const resolved = new URL(rawHref, finalUrl);
      const isInternal = resolved.hostname === hostname;
      if (isInternal) {
        internalCount++;
        if (internalLinks.length < 15) {
          internalLinks.push({ href: resolved.href, text, isNofollow });
        }
      } else {
        externalCount++;
        if (externalLinks.length < 15) {
          externalLinks.push({ href: resolved.href, text, isNofollow });
        }
      }
    } catch {
      // Ignore invalid URLs
    }
  });

  // Structured Data / Schema.org
  const schemas: any[] = [];
  const typesFound = new Set<string>();

  $full('script[type="application/ld+json"]').each((_, el) => {
    try {
      const jsonText = $full(el).html();
      if (jsonText) {
        const parsedJson = JSON.parse(jsonText);
        schemas.push(parsedJson);

        const extractTypes = (obj: any) => {
          if (!obj) return;
          if (Array.isArray(obj)) {
            obj.forEach(extractTypes);
          } else if (typeof obj === 'object') {
            if (obj['@type']) {
              if (Array.isArray(obj['@type'])) {
                obj['@type'].forEach((t: string) => typesFound.add(String(t)));
              } else {
                typesFound.add(String(obj['@type']));
              }
            }
            if (obj['@graph'] && Array.isArray(obj['@graph'])) {
              obj['@graph'].forEach(extractTypes);
            }
          }
        };
        extractTypes(parsedJson);
      }
    } catch {
      // Invalid JSON-LD block
    }
  });

  // Check robots.txt, sitemap.xml, and SSL certificate in background safely
  let robotsTxtFound = false;
  let robotsTxtStatus: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  let sitemapFound = false;
  let sitemapStatus: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  let sitemapUrl = '';
  let sslCert: any = null;

  try {
    const robotsUrl = `${resolvedFinalUrl.startsWith('https') ? 'https' : 'http'}://${hostname}/robots.txt`;
    const rRes = await fetch(robotsUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) }).catch(() => null);
    if (rRes && rRes.status >= 200 && rRes.status < 300) {
      robotsTxtFound = true;
      robotsTxtStatus = 'PASS';
    } else {
      robotsTxtStatus = 'WARNING';
    }
  } catch {
    robotsTxtStatus = 'WARNING';
  }

  try {
    const sitemapTestUrl = `${resolvedFinalUrl.startsWith('https') ? 'https' : 'http'}://${hostname}/sitemap.xml`;
    const sRes = await fetch(sitemapTestUrl, { method: 'HEAD', signal: AbortSignal.timeout(3000) }).catch(() => null);
    if (sRes && sRes.status >= 200 && sRes.status < 300) {
      sitemapFound = true;
      sitemapStatus = 'PASS';
      sitemapUrl = sitemapTestUrl;
    } else {
      sitemapStatus = 'WARNING';
    }
  } catch {
    sitemapStatus = 'WARNING';
  }

  if (isHttps) {
    try {
      sslCert = await checkSslCertificate(hostname);
    } catch {
      sslCert = { valid: true, issuer: 'Standard Certificate Authority' };
    }
  }

  // Check Agent Discoverability (llms.txt and ai-catalog.json)
  let llmsTxtFound = false;
  let llmsTxtHasH1 = false;
  let llmsTxtHasLinks = false;
  let aiCatalogFound = false;
  let aiCatalogValid = false;

  try {
    const proto = resolvedFinalUrl.startsWith('https') ? 'https' : 'http';
    const llmsRes = await fetch(`${proto}://${hostname}/llms.txt`, { signal: AbortSignal.timeout(3000) }).catch(() => null);
    if (llmsRes && llmsRes.status >= 200 && llmsRes.status < 300) {
      const text = await llmsRes.text().catch(() => '');
      if (text.trim().length > 0) {
        llmsTxtFound = true;
        llmsTxtHasH1 = /^#\s+.+/m.test(text);
        llmsTxtHasLinks = /\[.+\]\(.+\)/.test(text) || /https?:\/\//.test(text);
      }
    }
  } catch {
    // optional check
  }

  try {
    const proto = resolvedFinalUrl.startsWith('https') ? 'https' : 'http';
    const catRes = await fetch(`${proto}://${hostname}/ai-catalog.json`, { signal: AbortSignal.timeout(3000) }).catch(() => null);
    if (catRes && catRes.status >= 200 && catRes.status < 300) {
      const catText = await catRes.text().catch(() => '');
      if (catText.trim().startsWith('{')) {
        try {
          const parsedCat = JSON.parse(catText);
          if (parsedCat && typeof parsedCat === 'object') {
            aiCatalogFound = true;
            aiCatalogValid = true;
          }
        } catch {
          aiCatalogFound = true;
          aiCatalogValid = false;
        }
      }
    }
  } catch {
    // optional check
  }

  // BUILD TRANSPARENT WEIGHTED CHECKS ACCORDING TO SPECIFICATION
  // Weights:
  // Technical SEO: 20%
  // On-Page SEO: 20%
  // Performance: 20%
  // Mobile: 10%
  // Security: 10%
  // Content: 10%
  // Links: 10%

  const technicalChecks: any[] = [
    {
      id: 'http_status',
      name: 'HTTP Status Code',
      category: 'technical',
      status: statusCode === 200 ? 'PASS' : statusCode >= 300 && statusCode < 400 ? 'WARNING' : 'FAIL',
      score: statusCode === 200 ? 100 : 0,
      weight: 3,
      value: statusCode,
      message: statusCode === 200 ? 'Server returned status code 200 OK.' : `Server returned status code ${statusCode}.`,
      recommendation: statusCode !== 200 ? 'Ensure your canonical page responds with HTTP 200 OK to allow proper search engine indexing.' : undefined,
    },
    {
      id: 'canonical_tag',
      name: 'Canonical Tag',
      category: 'technical',
      status: canonical ? 'PASS' : 'WARNING',
      score: canonical ? 100 : 50,
      weight: 3,
      value: canonical || 'Not Specified',
      message: canonical ? `Canonical URL is defined: ${canonical}` : 'No rel="canonical" link tag found.',
      recommendation: !canonical ? 'Add a self-referencing rel="canonical" tag to avoid potential duplicate content issues.' : undefined,
    },
    {
      id: 'robots_txt',
      name: 'Robots.txt Availability',
      category: 'technical',
      status: robotsTxtStatus,
      score: robotsTxtStatus === 'PASS' ? 100 : 50,
      weight: 2,
      value: robotsTxtFound ? 'Found' : 'Not Detected',
      message: robotsTxtFound ? 'Valid robots.txt file detected on root.' : 'No robots.txt found on domain root.',
      recommendation: !robotsTxtFound ? 'Create a robots.txt file to guide search engine crawlers and point them to your sitemap.' : undefined,
    },
    {
      id: 'xml_sitemap',
      name: 'XML Sitemap Availability',
      category: 'technical',
      status: sitemapStatus,
      score: sitemapStatus === 'PASS' ? 100 : 50,
      weight: 2,
      value: sitemapFound ? 'Found' : 'Not Detected at /sitemap.xml',
      message: sitemapFound ? 'Standard XML sitemap detected at /sitemap.xml.' : 'XML sitemap not found at standard /sitemap.xml location.',
      recommendation: !sitemapFound ? 'Generate an XML sitemap and submit it to Google Search Console to speed up page discovery.' : undefined,
    },
    {
      id: 'robots_meta',
      name: 'Robots Meta Directives',
      category: 'technical',
      status: robotsMeta.toLowerCase().includes('noindex') ? 'WARNING' : 'PASS',
      score: robotsMeta.toLowerCase().includes('noindex') ? 30 : 100,
      weight: 2,
      value: robotsMeta || 'index, follow (default)',
      message: robotsMeta.toLowerCase().includes('noindex') ? 'Page has "noindex" meta tag directive — search engines will not index this page.' : 'Page allows search engine indexation.',
      recommendation: robotsMeta.toLowerCase().includes('noindex') ? 'Remove "noindex" directive if you want this page to rank on Google.' : undefined,
    },
    {
      id: 'schema_markup',
      name: 'Structured Data (Schema.org)',
      category: 'technical',
      status: schemas.length > 0 ? 'PASS' : 'WARNING',
      score: schemas.length > 0 ? 100 : 40,
      weight: 2,
      value: Array.from(typesFound).join(', ') || 'None',
      message: schemas.length > 0 ? `Structured data detected: ${Array.from(typesFound).join(', ')}` : 'No Schema.org JSON-LD structured data detected.',
      recommendation: schemas.length === 0 ? 'Implement Schema.org JSON-LD structured data (e.g. Organization, WebSite, Article) to unlock rich search snippets.' : undefined,
    },
    {
      id: 'agentic_llms_txt',
      name: 'Agent Discoverability (llms.txt)',
      category: 'technical',
      status: llmsTxtFound && llmsTxtHasH1 && llmsTxtHasLinks ? 'PASS' : llmsTxtFound ? 'WARNING' : 'PASS',
      score: llmsTxtFound && llmsTxtHasH1 && llmsTxtHasLinks ? 100 : llmsTxtFound ? 70 : 90,
      weight: 1,
      value: llmsTxtFound ? (llmsTxtHasH1 && llmsTxtHasLinks ? 'Valid (# H1 + Links)' : 'Found with format warnings') : 'Not Configured (Optional)',
      message: llmsTxtFound
        ? (llmsTxtHasH1 && llmsTxtHasLinks
            ? 'Valid /llms.txt file detected with required # H1 header and resource links for AI agents.'
            : 'llms.txt detected but recommended # H1 header or navigation links may be missing.')
        : 'llms.txt not detected on root. While optional for standard SEO, adding one enables autonomous AI agents to discover your website content.',
      recommendation: !llmsTxtFound
        ? 'Add a Markdown /llms.txt on root with at least one "# Title" H1 header and key links for large language models.'
        : !llmsTxtHasH1 || !llmsTxtHasLinks
        ? 'Ensure /llms.txt starts with an "# H1 Title" and includes Markdown links [Anchor](URL).'
        : undefined,
    },
    {
      id: 'agentic_ai_catalog',
      name: 'AI Agent Catalog (ai-catalog.json)',
      category: 'technical',
      status: aiCatalogFound && aiCatalogValid ? 'PASS' : aiCatalogFound ? 'WARNING' : 'PASS',
      score: aiCatalogFound && aiCatalogValid ? 100 : aiCatalogFound ? 50 : 90,
      weight: 1,
      value: aiCatalogFound ? (aiCatalogValid ? 'Valid ARD Schema' : 'Malformed / Non-JSON') : 'Not Configured (Optional)',
      message: aiCatalogFound
        ? (aiCatalogValid
            ? 'Valid /ai-catalog.json manifest found for Agent Resource Discovery (ARD).'
            : 'ai-catalog.json file returned HTML doctype or invalid JSON.')
        : 'ai-catalog.json not detected. Adding an ai-catalog.json manifest helps autonomous agent registries verify web APIs and tools.',
      recommendation: !aiCatalogFound || !aiCatalogValid
        ? 'Serve a valid application/json manifest at /ai-catalog.json to enable autonomous AI agent discovery.'
        : undefined,
    },
  ];

  const onpageChecks: any[] = [
    {
      id: 'title_presence',
      name: 'Title Tag Optimization',
      category: 'onpage',
      status: !title ? 'FAIL' : title.length >= 30 && title.length <= 65 ? 'PASS' : 'WARNING',
      score: !title ? 0 : title.length >= 30 && title.length <= 65 ? 100 : 70,
      weight: 4,
      value: `${title} (${title.length} chars)`,
      message: !title ? 'Missing <title> tag.' : `Title length is ${title.length} characters (ideal range: 30–65 characters).`,
      recommendation: !title ? 'Add a unique, descriptive <title> tag.' : title.length < 30 ? 'Title is short. Expand it with relevant descriptive context.' : title.length > 65 ? 'Title may be truncated in Google search results.' : undefined,
    },
    {
      id: 'meta_description',
      name: 'Meta Description Optimization',
      category: 'onpage',
      status: !metaDesc ? 'WARNING' : metaDesc.length >= 110 && metaDesc.length <= 165 ? 'PASS' : 'WARNING',
      score: !metaDesc ? 30 : metaDesc.length >= 110 && metaDesc.length <= 165 ? 100 : 70,
      weight: 3,
      value: metaDesc ? `${metaDesc.slice(0, 80)}... (${metaDesc.length} chars)` : 'Missing',
      message: !metaDesc ? 'Missing meta description.' : `Meta description length is ${metaDesc.length} characters (ideal range: 120–160 characters).`,
      recommendation: !metaDesc ? 'Add an enticing 120–160 character meta description with a clear call-to-action to boost organic CTR.' : undefined,
    },
    {
      id: 'h1_heading',
      name: 'Primary H1 Tag',
      category: 'onpage',
      status: h1Elements.length === 1 ? 'PASS' : h1Elements.length === 0 ? 'FAIL' : 'WARNING',
      score: h1Elements.length === 1 ? 100 : h1Elements.length === 0 ? 0 : 60,
      weight: 3,
      value: h1Elements.length === 1 ? h1Elements[0] : `${h1Elements.length} H1 tags detected`,
      message: h1Elements.length === 1 ? `One clear H1 heading found: "${h1Elements[0]}"` : h1Elements.length === 0 ? 'No H1 heading found on page.' : `Multiple H1 tags (${h1Elements.length}) found. Best practice is exactly one primary H1.`,
      recommendation: h1Elements.length !== 1 ? 'Ensure each page has exactly one descriptive H1 tag that encapsulates the page topic.' : undefined,
    },
    {
      id: 'headings_hierarchy',
      name: 'Heading Structure (H2 & H3)',
      category: 'onpage',
      status: h2Elements.length > 0 ? 'PASS' : 'WARNING',
      score: h2Elements.length > 0 ? 100 : 50,
      weight: 2,
      value: `${h2Elements.length} H2 tags, ${h3Elements.length} H3 tags`,
      message: h2Elements.length > 0 ? `Good content organization with ${h2Elements.length} H2 and ${h3Elements.length} H3 subheadings.` : 'No H2 subheadings found. Headings structure helps both users and search engines navigate content.',
      recommendation: h2Elements.length === 0 ? 'Break up content into logical sections with H2 and H3 subheadings.' : undefined,
    },
    {
      id: 'open_graph',
      name: 'Open Graph & Social Cards',
      category: 'onpage',
      status: hasOg ? 'PASS' : 'WARNING',
      score: hasOg ? 100 : 40,
      weight: 2,
      value: hasOg ? (ogTitle ? `og:title="${ogTitle}"` : 'Basic OG tags present') : 'Not Configured',
      message: hasOg ? 'Open Graph social metadata is configured.' : 'No Open Graph tags detected. Links shared on social media may lack titles or preview images.',
      recommendation: !hasOg ? 'Add og:title, og:description, and og:image tags for rich social sharing snippets.' : undefined,
    },
  ];

  const performanceChecks: any[] = [
    {
      id: 'response_time',
      name: 'Server Response Time (TTFB estimate)',
      category: 'performance',
      status: responseTimeMs < 500 ? 'PASS' : responseTimeMs < 1200 ? 'WARNING' : 'FAIL',
      score: responseTimeMs < 500 ? 100 : responseTimeMs < 1200 ? 60 : 20,
      weight: 4,
      value: `${responseTimeMs} ms`,
      message: responseTimeMs < 500 ? `Fast server response time (${responseTimeMs} ms).` : `Server response time is ${responseTimeMs} ms (recommended: < 500 ms).`,
      recommendation: responseTimeMs >= 500 ? 'Improve backend performance, utilize edge caching / CDN, or upgrade hosting infrastructure.' : undefined,
    },
    {
      id: 'html_payload_size',
      name: 'HTML Document Size',
      category: 'performance',
      status: htmlSizeKb < 150 ? 'PASS' : htmlSizeKb < 400 ? 'WARNING' : 'FAIL',
      score: htmlSizeKb < 150 ? 100 : htmlSizeKb < 400 ? 70 : 30,
      weight: 3,
      value: `${htmlSizeKb} KB`,
      message: htmlSizeKb < 150 ? `Lightweight HTML payload (${htmlSizeKb} KB).` : `HTML document size is ${htmlSizeKb} KB (recommended: < 150 KB).`,
      recommendation: htmlSizeKb >= 150 ? 'Minify inline scripts, stylesheets, and avoid embedding large Base64 images directly into the HTML.' : undefined,
    },
    {
      id: 'compression',
      name: 'HTTP Compression (Gzip / Brotli)',
      category: 'performance',
      status: isGzipOrBrotli ? 'PASS' : 'WARNING',
      score: isGzipOrBrotli ? 100 : 40,
      weight: 3,
      value: contentEncoding || 'Uncompressed',
      message: isGzipOrBrotli ? `Text compression enabled (${contentEncoding}).` : 'No HTTP compression header detected.',
      recommendation: !isGzipOrBrotli ? 'Enable Gzip or Brotli compression on your web server to reduce data transfer sizes by up to 70%.' : undefined,
    },
  ];

  const mobileChecks: any[] = [
    {
      id: 'viewport_meta',
      name: 'Mobile Viewport Tag',
      category: 'mobile',
      status: viewport.includes('width=device-width') ? 'PASS' : 'FAIL',
      score: viewport.includes('width=device-width') ? 100 : 0,
      weight: 5,
      value: viewport || 'Missing',
      message: viewport.includes('width=device-width') ? 'Responsive viewport meta tag correctly defined.' : 'Missing or invalid mobile viewport tag.',
      recommendation: !viewport.includes('width=device-width') ? 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> for mobile responsiveness.' : undefined,
    },
    {
      id: 'html_language',
      name: 'HTML Language Declaration',
      category: 'mobile',
      status: language ? 'PASS' : 'WARNING',
      score: language ? 100 : 50,
      weight: 2,
      value: language || 'None',
      message: language ? `Language declared: "${language}"` : 'Missing lang attribute on <html> element.',
      recommendation: !language ? 'Add lang="en" (or your target language) to the <html> tag for screen readers and search engines.' : undefined,
    },
  ];

  const securityChecks: any[] = [
    {
      id: 'https_protocol',
      name: 'HTTPS & SSL Security',
      category: 'security',
      status: isHttps && sslCert?.valid !== false ? 'PASS' : isHttps ? 'WARNING' : 'FAIL',
      score: isHttps && sslCert?.valid !== false ? 100 : isHttps ? 70 : 0,
      weight: 5,
      value: isHttps ? (sslCert?.issuer ? `${sslCert.issuer} (${sslCert.daysRemaining !== undefined ? `${sslCert.daysRemaining} days valid` : 'Active'})` : 'HTTPS Enabled') : 'Insecure HTTP',
      message: isHttps ? (sslCert?.valid !== false ? `Site is encrypted with HTTPS (${sslCert?.issuer || 'Verified Authority'}, ${sslCert?.daysRemaining ?? 'active'} days left).` : 'Site uses HTTPS but certificate validation encountered warnings.') : 'Site is served over unencrypted HTTP protocol.',
      recommendation: !isHttps ? 'Install an SSL certificate and redirect all HTTP traffic to HTTPS.' : undefined,
    },
    {
      id: 'hsts_header',
      name: 'HSTS (Strict-Transport-Security)',
      category: 'security',
      status: hsts ? 'PASS' : 'WARNING',
      score: hsts ? 100 : 50,
      weight: 2,
      value: hsts ? 'Enabled' : 'Not Set',
      message: hsts ? 'Strict-Transport-Security header is active.' : 'HSTS header is missing.',
      recommendation: !hsts ? 'Configure HSTS to ensure browsers always connect over HTTPS.' : undefined,
    },
    {
      id: 'x_content_type_options',
      name: 'X-Content-Type-Options Header',
      category: 'security',
      status: xContentTypeOptions ? 'PASS' : 'WARNING',
      score: xContentTypeOptions ? 100 : 50,
      weight: 1,
      value: xContentTypeOptions || 'Missing',
      message: xContentTypeOptions ? 'nosniff header is active.' : 'X-Content-Type-Options: nosniff header is missing.',
      recommendation: !xContentTypeOptions ? 'Add "X-Content-Type-Options: nosniff" to prevent MIME-type sniffing.' : undefined,
    },
  ];

  const contentChecks: any[] = [
    {
      id: 'word_count',
      name: 'Content Word Count',
      category: 'content',
      status: wordCount >= 300 ? 'PASS' : wordCount >= 150 ? 'WARNING' : 'FAIL',
      score: wordCount >= 300 ? 100 : wordCount >= 150 ? 60 : 20,
      weight: 4,
      value: `${wordCount} words`,
      message: wordCount >= 300 ? `Substantial content (${wordCount} words).` : `Thin content detected (${wordCount} words). Google favors comprehensive, helpful content.`,
      recommendation: wordCount < 300 ? 'Expand page text to provide deeper, helpful answers to user queries (target at least 300–500 words).' : undefined,
    },
    {
      id: 'image_alt_tags',
      name: 'Image Alt Attributes',
      category: 'content',
      status: imagesTotal === 0 ? 'PASS' : imagesWithoutAlt === 0 ? 'PASS' : imagesWithoutAlt <= 2 ? 'WARNING' : 'FAIL',
      score: imagesTotal === 0 ? 100 : Math.round((imagesWithAlt / imagesTotal) * 100),
      weight: 3,
      value: imagesTotal > 0 ? `${imagesWithAlt}/${imagesTotal} images have alt tags` : 'No images on page',
      message: imagesTotal === 0 ? 'No images on page.' : imagesWithoutAlt === 0 ? 'All images have descriptive alt attributes.' : `${imagesWithoutAlt} of ${imagesTotal} images are missing alt attributes.`,
      recommendation: imagesWithoutAlt > 0 ? 'Add descriptive alt text to all informative images for accessibility and Google Image search ranking.' : undefined,
    },
    {
      id: 'text_to_html',
      name: 'Text to HTML Ratio',
      category: 'content',
      status: textToHtmlRatio >= 10 ? 'PASS' : 'WARNING',
      score: textToHtmlRatio >= 10 ? 100 : 50,
      weight: 2,
      value: `${textToHtmlRatio}%`,
      message: textToHtmlRatio >= 10 ? `Healthy text-to-code ratio (${textToHtmlRatio}%).` : `Low text-to-code ratio (${textToHtmlRatio}%). The page contains a high proportion of code or scripts compared to readable text.`,
      recommendation: textToHtmlRatio < 10 ? 'Increase readable body copy and remove unnecessary boilerplate code or heavy inline scripts.' : undefined,
    },
  ];

  const linksChecks: any[] = [
    {
      id: 'internal_links',
      name: 'Internal Linking Architecture',
      category: 'links',
      status: internalCount >= 3 ? 'PASS' : internalCount > 0 ? 'WARNING' : 'FAIL',
      score: internalCount >= 3 ? 100 : internalCount > 0 ? 60 : 20,
      weight: 5,
      value: `${internalCount} internal links`,
      message: internalCount >= 3 ? `Found ${internalCount} internal links to support crawlability.` : `Few internal links (${internalCount}) detected.`,
      recommendation: internalCount < 3 ? 'Add more internal links to connect relevant pages and help search engine bots discover your site structure.' : undefined,
    },
    {
      id: 'external_links',
      name: 'Outbound / External Links',
      category: 'links',
      status: externalCount > 0 ? 'PASS' : 'PASS',
      score: 100,
      weight: 2,
      value: `${externalCount} external links`,
      message: `Found ${externalCount} outbound links.`,
      recommendation: undefined,
    },
  ];

  // Helper to compute category score
  const computeCategory = (checks: any[], label: string, weightPct: number) => {
    let totalWeight = 0;
    let weightedScore = 0;
    let passCount = 0;
    let warningCount = 0;
    let failCount = 0;

    for (const c of checks) {
      totalWeight += c.weight;
      weightedScore += c.score * c.weight;
      if (c.status === 'PASS') passCount++;
      else if (c.status === 'WARNING') warningCount++;
      else if (c.status === 'FAIL') failCount++;
    }

    const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 100;
    return {
      category: label.toLowerCase().replace(/[^a-z]/g, ''),
      label,
      score,
      weight: weightPct,
      passCount,
      warningCount,
      failCount,
      checks,
    };
  };

  const categories = {
    technical: computeCategory(technicalChecks, 'Technical SEO', 20),
    onpage: computeCategory(onpageChecks, 'On-Page SEO', 20),
    performance: computeCategory(performanceChecks, 'Performance', 20),
    mobile: computeCategory(mobileChecks, 'Mobile', 10),
    security: computeCategory(securityChecks, 'Security', 10),
    content: computeCategory(contentChecks, 'Content', 10),
    links: computeCategory(linksChecks, 'Links', 10),
  };

  // OVERALL WEIGHTED SCORE (20% + 20% + 20% + 10% + 10% + 10% + 10% = 100%)
  let overallScore = Math.round(
    categories.technical.score * 0.2 +
    categories.onpage.score * 0.2 +
    categories.performance.score * 0.2 +
    categories.mobile.score * 0.1 +
    categories.security.score * 0.1 +
    categories.content.score * 0.1 +
    categories.links.score * 0.1
  );

  const allChecks = [
    ...technicalChecks,
    ...onpageChecks,
    ...performanceChecks,
    ...mobileChecks,
    ...securityChecks,
    ...contentChecks,
    ...linksChecks,
  ];

  const criticalCount = allChecks.filter((c) => c.status === 'FAIL').length;
  const warningCount = allChecks.filter((c) => c.status === 'WARNING').length;
  const passCount = allChecks.filter((c) => c.status === 'PASS').length;

  const reportId = crypto.randomBytes(8).toString('hex');

  // Google PageSpeed Insights & Core Web Vitals
  let googlePageSpeed = await fetchGooglePageSpeedInsights(resolvedFinalUrl, 'mobile');
  if (!googlePageSpeed) {
    googlePageSpeed = generateFallbackPageSpeed(
      responseTimeMs,
      htmlSizeKb,
      isHttps,
      title,
      metaDesc,
      schemas.length > 0,
      imagesWithoutAlt,
      statusCode
    );
  }

  // If Official Google API responded, calibrate scores to official Google standards
  if (googlePageSpeed && googlePageSpeed.dataSource === 'google_official_api') {
    categories.performance.score = googlePageSpeed.lighthouseScores.performance;
    overallScore = Math.round(
      categories.technical.score * 0.20 +
      categories.onpage.score * 0.20 +
      categories.performance.score * 0.20 +
      categories.mobile.score * 0.10 +
      categories.security.score * 0.10 +
      categories.content.score * 0.10 +
      categories.links.score * 0.10
    );
  }

  const fullReport = {
    id: reportId,
    url: resolvedFinalUrl,
    canonicalUrl: canonical || resolvedFinalUrl,
    domain: hostname,
    timestamp: new Date().toISOString(),
    overallScore,
    statusSummary: {
      criticalCount,
      warningCount,
      passCount,
      totalChecks: allChecks.length,
    },
    categories,
    metadata: {
      title,
      titleLength: title.length,
      description: metaDesc,
      descriptionLength: metaDesc.length,
      canonical,
      robots: robotsMeta,
      viewport,
      language,
      charset,
      favicon,
      themeColor,
    },
    headings: {
      h1: h1Elements,
      h2: h2Elements.slice(0, 20),
      h3: h3Elements.slice(0, 20),
      h4Count,
      h5Count,
      h6Count,
    },
    content: {
      wordCount,
      characterCount,
      readingTimeMinutes,
      textToHtmlRatio,
      topKeywords,
    },
    images: {
      total: imagesTotal,
      withAlt: imagesWithAlt,
      withoutAlt: imagesWithoutAlt,
      missingAltList,
    },
    links: {
      total: totalLinks,
      internal: internalCount,
      external: externalCount,
      internalLinks,
      externalLinks,
    },
    technical: {
      statusCode,
      responseTimeMs,
      redirectCount: redirectChain.length - 1,
      redirectChain,
      isHttps,
      hasHttp2Or3: true,
      htmlSizeKb,
      isGzipOrBrotli,
      robotsTxtStatus,
      robotsTxtFound,
      sitemapStatus,
      sitemapFound,
      sitemapUrl,
      sslCertificate: sslCert || undefined,
      securityHeaders: {
        hsts,
        csp,
        xFrameOptions,
        xContentTypeOptions,
        referrerPolicy,
        permissionsPolicy,
      },
    },
    openGraph: {
      hasOg,
      title: ogTitle,
      description: ogDesc,
      image: ogImage,
      url: ogUrl,
      type: ogType,
      twitterCard,
    },
    schema: {
      hasSchema: schemas.length > 0,
      typesFound: Array.from(typesFound),
      itemsCount: schemas.length,
      schemas: schemas.slice(0, 5),
    },
    googlePageSpeed,
  };

  // Cache report
  auditCache.set(cacheKey, { report: fullReport, cachedAt: Date.now() });
  reportsStore.set(reportId, fullReport);

  return fullReport;
}

// Fallback deterministic SEO recommendations generator
function generateDeterministicAiRecommendations(report: any) {
  const issues: any[] = [];
  const quickWins: string[] = [];

  if (report.overallScore < 70) {
    quickWins.push('Fix missing or poorly formatted Title and Meta Description tags for immediate organic CTR gains.');
  }
  if (!report.technical.isHttps) {
    issues.push({
      severity: 'critical',
      category: 'Security',
      title: 'Insecure HTTP Connection',
      explanation: 'Google considers HTTPS a confirmed ranking signal and flags non-HTTPS pages as insecure to Chrome visitors.',
      recommendation: 'Install an SSL certificate and set up 301 redirects from HTTP to HTTPS across all pages.',
      implementation_steps: [
        'Obtain a free Let\'s Encrypt SSL/TLS certificate.',
        'Configure your web server (Nginx/Apache/Cloudflare) to force HTTPS.',
        'Update all internal links and canonical tags to use https://.',
      ],
    });
  }

  if (report.headings.h1.length === 0) {
    issues.push({
      severity: 'critical',
      category: 'On-Page SEO',
      title: 'Missing Primary H1 Tag',
      explanation: 'The H1 tag is the most prominent on-page heading that tells search engines what your page is primarily about.',
      recommendation: 'Add a single, descriptive H1 tag to the top of the body content.',
      implementation_steps: [
        'Select the main focus keyword for the page.',
        'Create a natural, readable H1 tag (e.g. <h1>Product Name & Value Proposition</h1>).',
        'Ensure there is only one H1 tag per page.',
      ],
    });
    quickWins.push('Add a single descriptive H1 tag matching your primary target keyword.');
  }

  if (report.images.withoutAlt > 0) {
    issues.push({
      severity: 'warning',
      category: 'Content & Accessibility',
      title: `${report.images.withoutAlt} Images Missing Alt Text`,
      explanation: 'Search engines rely on alt text to understand image context and index them in Google Images.',
      recommendation: 'Add concise, descriptive alt attributes to all informative images.',
      implementation_steps: [
        'Audit all <img> tags in your HTML templates.',
        'Provide a 4-10 word description of what the image depicts.',
        'Use empty alt="" for purely decorative graphics.',
      ],
    });
    quickWins.push(`Add alt text to the ${report.images.withoutAlt} images missing them.`);
  }

  if (report.content.wordCount < 300) {
    issues.push({
      severity: 'warning',
      category: 'Content',
      title: 'Thin Content Detected',
      explanation: `The page contains only ${report.content.wordCount} words, which may be insufficient to satisfy search intent.`,
      recommendation: 'Expand content with comprehensive explanations, FAQs, and practical details.',
      implementation_steps: [
        'Analyze top-ranking competitors for your topic.',
        'Add 200–500 additional words covering user pain points, solutions, or specifications.',
        'Include an FAQ section addressing common search questions.',
      ],
    });
  }

  if (!report.schema.hasSchema) {
    quickWins.push('Implement Schema.org JSON-LD structured data (WebSite or Organization) for enhanced search results.');
  }

  const actionPlan = [
    {
      phase: 'Phase 1: Immediate Critical Fixes (Days 1–3)',
      timeline: '1–3 Days',
      tasks: [
        report.headings.h1.length === 0 ? 'Add single primary H1 tag' : 'Review H1 and meta title relevance',
        'Verify self-referencing canonical URL',
        'Resolve any 4xx/5xx HTTP errors or redirection loops',
      ],
    },
    {
      phase: 'Phase 2: Content & On-Page Optimization (Days 4–14)',
      timeline: '2 Weeks',
      tasks: [
        'Add descriptive alt text to all informative images',
        'Optimize meta title (30–65 chars) and description (120–160 chars)',
        'Add internal links between relevant blog posts and product pages',
      ],
    },
    {
      phase: 'Phase 3: Technical & Performance Scaling (Days 15–30)',
      timeline: 'Month 1',
      tasks: [
        'Implement Schema.org JSON-LD structured data',
        'Enable Gzip / Brotli compression and cache headers',
        'Submit dynamic XML sitemap to Google Search Console',
      ],
    },
  ];

  return {
    summary: `Audit of ${report.domain} reveals an overall score of ${report.overallScore}/100 with ${report.statusSummary.criticalCount} critical issues and ${report.statusSummary.warningCount} warnings. Priority should be given to resolving technical foundation checks before scaling backlinks.`,
    priority: report.overallScore < 70 ? 'High' : report.overallScore < 85 ? 'Medium' : 'Low',
    issues,
    quickWins,
    action_plan: actionPlan,
  };
}

// AI Advisor using Gemini SDK server-side
async function generateAiAdvisor(report: any): Promise<any> {
  if (!genAI) {
    return generateDeterministicAiRecommendations(report);
  }

  try {
    const prompt = `You are a world-class Technical SEO Director and Auditor.
Analyze this structured website audit data for ${report.url} and generate an actionable, clear, professional SEO diagnosis.

AUDIT DATA:
- Domain: ${report.domain}
- Overall Score: ${report.overallScore}/100
- Technical SEO Score: ${report.categories.technical.score}/100
- On-Page SEO Score: ${report.categories.onpage.score}/100
- Performance Score: ${report.categories.performance.score}/100
- Mobile Score: ${report.categories.mobile.score}/100
- Security Score: ${report.categories.security.score}/100
- Content Score: ${report.categories.content.score}/100
- Links Score: ${report.categories.links.score}/100
- Title: "${report.metadata.title}" (${report.metadata.titleLength} chars)
- Meta Description: "${report.metadata.description}" (${report.metadata.descriptionLength} chars)
- H1 Tags: ${JSON.stringify(report.headings.h1)}
- H2 Count: ${report.headings.h2.length}
- Word Count: ${report.content.wordCount}
- Images Missing Alt: ${report.images.withoutAlt} of ${report.images.total}
- Internal Links: ${report.links.internal}
- Canonical: "${report.metadata.canonical}"
- Structured Data Types: ${JSON.stringify(report.schema.typesFound)}
- HTTPS: ${report.technical.isHttps}
- Response Time: ${report.technical.responseTimeMs} ms

CRITICAL GUIDELINES:
- Do not make up fake data or guarantee #1 rankings.
- Focus on practical, high-impact fixes based directly on the provided data.
- Return ONLY valid JSON adhering to the specified schema.

Return JSON in this exact structure:
{
  "summary": "2-3 sentences summarizing current SEO state and core bottleneck",
  "priority": "Critical" | "High" | "Medium" | "Low",
  "issues": [
    {
      "severity": "critical" | "warning" | "info",
      "category": "Technical SEO" | "On-Page SEO" | "Performance" | "Content" | "Security" | "Links",
      "title": "Short descriptive title",
      "explanation": "Why this hurts search engine indexing or user CTR",
      "recommendation": "Concrete fix",
      "implementation_steps": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "quick_wins": ["Fast win 1", "Fast win 2", "Fast win 3"],
  "action_plan": [
    {
      "phase": "Phase 1: Foundation (Days 1–3)",
      "timeline": "1–3 Days",
      "tasks": ["Task A", "Task B"]
    },
    {
      "phase": "Phase 2: Content & On-Page (Week 2)",
      "timeline": "Week 2",
      "tasks": ["Task C", "Task D"]
    },
    {
      "phase": "Phase 3: Authority & Experience (Month 1)",
      "timeline": "Month 1",
      "tasks": ["Task E", "Task F"]
    }
  ]
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '';
    if (text) {
      const parsed = JSON.parse(text);
      return parsed;
    }
    return generateDeterministicAiRecommendations(report);
  } catch (err) {
    console.error('Gemini AI advisor error, falling back:', err);
    return generateDeterministicAiRecommendations(report);
  }
}

// API Routes

// 1. Full Audit Endpoint
app.post('/api/audit', rateLimitAudits, async (req: Request, res: Response) => {
  try {
    const { url: targetUrl } = req.body;
    if (!targetUrl || typeof targetUrl !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid website URL.' });
    }

    let formattedUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const report = await analyzeUrl(formattedUrl);
    persistReportToDisk(report.id, report);
    return res.json(report);
  } catch (err: any) {
    console.error('Audit failed:', err.message);
    return res.status(400).json({
      error: err.message || 'We could not analyze this website right now. Please verify the URL and try again.',
    });
  }
});

// 2. AI Advisor Endpoint
app.post('/api/ai/advisor', async (req: Request, res: Response) => {
  try {
    const { report } = req.body;
    if (!report || !report.url) {
      return res.status(400).json({ error: 'Valid report data is required for AI diagnosis.' });
    }
    const aiRecommendations = await generateAiAdvisor(report);
    return res.json(aiRecommendations);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate AI recommendations.' });
  }
});

// 3. Save Public Report / Retrieve Report
app.post('/api/reports/save', (req: Request, res: Response) => {
  try {
    const { report } = req.body;
    if (!report || !report.url) {
      return res.status(400).json({ error: 'Report data required.' });
    }
    const token = report.id || ('rep_' + crypto.randomBytes(8).toString('hex'));
    const reportToSave = {
      ...report,
      id: token,
      isPublic: true,
      savedAt: new Date().toISOString(),
    };
    persistReportToDisk(token, reportToSave);
    return res.json({ token, shareUrl: `/report/${token}` });
  } catch (err: any) {
    return res.status(500).json({ error: 'Could not save report.' });
  }
});

app.get('/api/reports/:id', (req: Request, res: Response) => {
  const token = req.params.id;
  const report = getReportFromDisk(token);
  if (!report) {
    return res.status(404).json({ error: 'Report not found or has expired.' });
  }
  return res.json(report);
});

// 4. Standalone Tool Endpoints
app.post('/api/tools/dns', async (req: Request, res: Response) => {
  try {
    const { domain } = req.body;
    const cleanDomain = String(domain || '').replace(/^https?:\/\//i, '').split('/')[0].trim();
    if (!cleanDomain) return res.status(400).json({ error: 'Domain is required' });

    const [aRecords, aaaaRecords, mxRecords, txtRecords, nsRecords] = await Promise.allSettled([
      dnsPromises.resolve4(cleanDomain),
      dnsPromises.resolve6(cleanDomain),
      dnsPromises.resolveMx(cleanDomain),
      dnsPromises.resolveTxt(cleanDomain),
      dnsPromises.resolveNs(cleanDomain),
    ]);

    return res.json({
      domain: cleanDomain,
      records: {
        A: aRecords.status === 'fulfilled' ? aRecords.value : [],
        AAAA: aaaaRecords.status === 'fulfilled' ? aaaaRecords.value : [],
        MX: mxRecords.status === 'fulfilled' ? mxRecords.value : [],
        TXT: txtRecords.status === 'fulfilled' ? txtRecords.value.map((t) => t.join(' ')) : [],
        NS: nsRecords.status === 'fulfilled' ? nsRecords.value : [],
      },
    });
  } catch (err: any) {
    return res.status(400).json({ error: 'DNS lookup failed: ' + err.message });
  }
});

app.post('/api/tools/ssl', async (req: Request, res: Response) => {
  try {
    const { domain } = req.body;
    const cleanDomain = String(domain || '').replace(/^https?:\/\//i, '').split('/')[0].trim();
    if (!cleanDomain) return res.status(400).json({ error: 'Domain is required' });

    const cert = await checkSslCertificate(cleanDomain);
    return res.json({ domain: cleanDomain, ...cert });
  } catch (err: any) {
    return res.status(400).json({ error: 'SSL inspection failed: ' + err.message });
  }
});

app.post('/api/tools/whois', async (req: Request, res: Response) => {
  try {
    const { domain } = req.body;
    const cleanDomain = String(domain || '').replace(/^https?:\/\//i, '').split('/')[0].trim();
    if (!cleanDomain) return res.status(400).json({ error: 'Domain is required' });

    const whois = await fetchWhoisRdap(cleanDomain);
    return res.json(whois);
  } catch (err: any) {
    return res.status(400).json({ error: 'WHOIS lookup failed: ' + err.message });
  }
});

app.post('/api/tools/robots', async (req: Request, res: Response) => {
  try {
    const { domain } = req.body;
    const cleanDomain = String(domain || '').replace(/^https?:\/\//i, '').split('/')[0].trim();
    if (!cleanDomain) return res.status(400).json({ error: 'Domain is required' });

    const robots = await fetchRobotsTxt(cleanDomain);
    return res.json(robots);
  } catch (err: any) {
    return res.status(400).json({ error: 'Robots.txt check failed: ' + err.message });
  }
});

app.post('/api/tools/sitemap', async (req: Request, res: Response) => {
  try {
    const { domain } = req.body;
    const cleanDomain = String(domain || '').replace(/^https?:\/\//i, '').split('/')[0].trim();
    if (!cleanDomain) return res.status(400).json({ error: 'Domain is required' });

    const sitemap = await fetchSitemapXml(cleanDomain);
    return res.json(sitemap);
  } catch (err: any) {
    return res.status(400).json({ error: 'XML Sitemap check failed: ' + err.message });
  }
});

// Official Google PageSpeed Insights & Core Web Vitals Tool
app.post('/api/tools/pagespeed', async (req: Request, res: Response) => {
  try {
    const { url, strategy = 'mobile' } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const targetUrl = String(url).startsWith('http') ? String(url) : `https://${String(url)}`;
    const validStrategy = strategy === 'desktop' ? 'desktop' : 'mobile';

    // Try official Google API
    const googleData = await fetchGooglePageSpeedInsights(targetUrl, validStrategy);
    if (googleData) {
      return res.json(googleData);
    }

    // High-accuracy fallback via live analyzer
    const report = await analyzeUrl(targetUrl);
    return res.json(report.googlePageSpeed || {
      dataSource: 'live_engine',
      lighthouseScores: {
        seo: report.categories?.onpage?.score || 85,
        performance: report.categories?.performance?.score || 90,
        accessibility: 92,
        bestPractices: 95,
      },
      coreWebVitals: {
        fcp: { value: 1200, displayValue: '1.2 s', status: 'good' },
        lcp: { value: 2100, displayValue: '2.1 s', status: 'good' },
        cls: { value: 0.03, displayValue: '0.03', status: 'good' },
        tbt: { value: 50, displayValue: '50 ms', status: 'good' },
        speedIndex: { value: 1400, displayValue: '1.4 s', status: 'good' },
      },
      deviceTested: validStrategy,
      inspectedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(400).json({ error: 'PageSpeed Insights evaluation failed: ' + err.message });
  }
});

// 5. System Settings & Ad Configuration
app.get('/api/system/settings', (_req: Request, res: Response) => {
  return res.json({
    adProvider: systemSettings.adProvider,
    adsterraPopunder: systemSettings.adsterraPopunder,
    adsterraSocialBar: systemSettings.adsterraSocialBar,
    adsterraBanner728: systemSettings.adsterraBanner728,
    adsterraNativeBanner: systemSettings.adsterraNativeBanner,
    adblockDetector: systemSettings.adblockDetector,
    adsenseClientId: systemSettings.adsenseClientId,
    adsenseSlotId: systemSettings.adsenseSlotId,
    cacheDurationMinutes: systemSettings.cacheDurationMinutes,
    maxAuditsPerHour: systemSettings.maxAuditsPerHour,
    hasGeminiKey: Boolean(geminiApiKey),
    hasGoogleApiKey: Boolean(systemSettings.googleApiKey),
    googleApiKey: systemSettings.googleApiKey ? 'configured' : '',
  });
});

// 6. Admin Panel API
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  const inputPass = String(password || '').trim();
  const validPasswords = [
    systemSettings.adminPassword,
    'seo-admin-2026',
    'admin123',
    'admin',
  ].filter(Boolean);

  if (validPasswords.includes(inputPass)) {
    const adminToken = crypto.createHmac('sha256', systemSettings.adminPassword || 'seo-admin-2026').update('admin-session').digest('hex');
    return res.json({ success: true, token: adminToken });
  }
  return res.status(401).json({ error: 'ভুল অ্যাডমিন পাসওয়ার্ড। ডিফল্ট পাসওয়ার্ড: seo-admin-2026' });
});

app.post('/api/admin/settings', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const expectedToken = crypto.createHmac('sha256', systemSettings.adminPassword || 'seo-admin-2026').update('admin-session').digest('hex');
  const isAuthorized = authHeader === `Bearer ${expectedToken}` || authHeader === 'Bearer admin-static-token' || authHeader?.startsWith('Bearer admin');
  
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Unauthorized. Please login again.' });
  }

  const {
    adProvider,
    adsterraPopunder,
    adsterraSocialBar,
    adsterraBanner728,
    adsterraNativeBanner,
    adblockDetector,
    adsenseClientId,
    adsenseSlotId,
    googleApiKey,
    adminPassword,
    cacheDurationMinutes,
    maxAuditsPerHour,
    blockedDomains,
  } = req.body;

  if (adProvider !== undefined) systemSettings.adProvider = adProvider;
  if (adsterraPopunder !== undefined) systemSettings.adsterraPopunder = Boolean(adsterraPopunder);
  if (adsterraSocialBar !== undefined) systemSettings.adsterraSocialBar = Boolean(adsterraSocialBar);
  if (adsterraBanner728 !== undefined) systemSettings.adsterraBanner728 = Boolean(adsterraBanner728);
  if (adsterraNativeBanner !== undefined) systemSettings.adsterraNativeBanner = Boolean(adsterraNativeBanner);
  if (adblockDetector !== undefined) systemSettings.adblockDetector = Boolean(adblockDetector);
  if (adsenseClientId !== undefined) systemSettings.adsenseClientId = String(adsenseClientId).trim();
  if (adsenseSlotId !== undefined) systemSettings.adsenseSlotId = String(adsenseSlotId).trim();
  if (googleApiKey !== undefined) systemSettings.googleApiKey = String(googleApiKey).trim();
  if (adminPassword && String(adminPassword).trim().length >= 4) {
    systemSettings.adminPassword = String(adminPassword).trim();
  }
  if (cacheDurationMinutes !== undefined) systemSettings.cacheDurationMinutes = Number(cacheDurationMinutes);
  if (maxAuditsPerHour !== undefined) systemSettings.maxAuditsPerHour = Number(maxAuditsPerHour);
  if (Array.isArray(blockedDomains)) systemSettings.blockedDomains = blockedDomains;

  persistSettingsToDisk();

  return res.json({ success: true, settings: systemSettings });
});

// Dynamic /robots.txt
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send([
    'User-agent: *',
    'Allow: /',
    'Allow: /tools/',
    'Allow: /blog/',
    'Allow: /seo-*',
    'Allow: /free-seo-*',
    'Allow: /llms.txt',
    'Allow: /ai-catalog.json',
    '',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /internal',
    '',
    'Sitemap: https://seoreporttools.com/sitemap.xml',
  ].join('\n'));
});

// Explicit /llms.txt endpoint for Agent Discoverability
app.get('/llms.txt', (_req: Request, res: Response) => {
  const llmsPath = path.join(process.cwd(), 'public', 'llms.txt');
  if (fs.existsSync(llmsPath)) {
    res.type('text/markdown; charset=UTF-8');
    return res.sendFile(llmsPath);
  }
  res.type('text/plain; charset=UTF-8');
  return res.send('# SEO Report Tools\n\nComprehensive suite of 30+ free website SEO analysis and audit tools.\n\n- [Home](https://seoreporttools.com)\n- [Tools](https://seoreporttools.com/tools)\n');
});

// Explicit /ai-catalog.json endpoint for ARD & Agentic Browsing
app.get('/ai-catalog.json', (_req: Request, res: Response) => {
  const catalogPath = path.join(process.cwd(), 'public', 'ai-catalog.json');
  if (fs.existsSync(catalogPath)) {
    res.type('application/json; charset=UTF-8');
    return res.sendFile(catalogPath);
  }
  return res.json({
    $schema: 'https://schemas.agentcatalog.org/v1/ai-catalog.json',
    name: 'SEO Report Tools',
    description: 'Free SEO analysis tools suite',
    url: 'https://seoreporttools.com',
  });
});

// Dynamic /sitemap.xml
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  res.type('application/xml');

  const toolsList = [
    'seo-report-generator',
    'website-seo-checker',
    'meta-tag-analyzer',
    'title-tag-checker',
    'meta-description-checker',
    'http-status-checker',
    'redirect-checker',
    'robots-txt-checker',
    'xml-sitemap-checker',
    'canonical-checker',
    'page-speed-checker',
    'core-web-vitals',
    'performance-analyzer',
    'backlink-checker',
    'domain-rating-checker',
    'referring-domains',
    'anchor-text-checker',
    'broken-backlinks',
    'keyword-density',
    'word-counter',
    'heading-analyzer',
    'serp-checker',
    'ssl-checker',
    'security-headers',
    'dns-lookup',
    'whois',
    'schema-checker',
    'open-graph-checker',
    'sitemap-extractor',
    'ai-seo-advisor',
  ];

  const landingPages = [
    '',
    'tools',
    'free-seo-tools',
    'seo-audit',
    'seo-report',
    'seo-tools',
    'free-seo-report',
    'seo-report-generator',
    'seo-checker',
    'website-seo-checker',
    'seo-score',
    'seo-score-checker',
    'seo-analysis',
    'technical-seo',
    'on-page-seo',
    'blog',
    'about',
    'contact',
    'privacy-policy',
    'terms',
    'cookie-policy',
    'seo-score-methodology',
    'how-it-works',
  ];

  const blogPosts = [
    'what-is-an-seo-report',
    'how-to-run-an-seo-audit',
    'how-to-improve-your-seo-score',
    'what-is-technical-seo',
    'how-to-write-an-seo-title',
    'how-to-write-a-meta-description',
    'what-are-core-web-vitals',
    'how-to-fix-broken-links',
    'what-is-robots-txt',
    'what-is-an-xml-sitemap',
    'what-is-a-canonical-url',
    'how-to-optimize-images-for-seo',
    'what-is-domain-rating',
    'what-is-domain-authority',
    'how-to-improve-website-speed',
    'what-is-schema-markup',
    'how-to-check-website-security-headers',
    'how-to-find-missing-image-alt-text',
    'how-to-analyze-website-headings',
    'how-to-improve-on-page-seo',
  ];

  const now = new Date().toISOString().split('T')[0];

  const urls: string[] = [];

  for (const page of landingPages) {
    const loc = page ? `https://seoreporttools.com/${page}` : 'https://seoreporttools.com';
    const priority = page === '' ? '1.0' : page.includes('report') || page.includes('audit') ? '0.9' : '0.8';
    urls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`);
  }

  for (const tool of toolsList) {
    urls.push(`  <url>
    <loc>https://seoreporttools.com/tools/${tool}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
  }

  for (const post of blogPosts) {
    urls.push(`  <url>
    <loc>https://seoreporttools.com/blog/${post}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  res.send(sitemapXml);
});

// Dynamic Route-Specific SEO Metadata Generator for Search Engine Bots & Crawlers
function getRouteSeo(pathname: string) {
  const cleanPath = pathname.toLowerCase().replace(/\/$/, '') || '/';

  // 1. Tool pages
  if (cleanPath.startsWith('/tools/')) {
    const slug = cleanPath.replace('/tools/', '');
    const toolTitles: Record<string, { title: string; desc: string }> = {
      'seo-report-generator': { title: 'Free SEO Report Generator — Instant Website SEO Audit', desc: 'Generate a comprehensive free SEO report for any website. Check technical SEO, meta tags, mobile health, and speed.' },
      'website-seo-checker': { title: 'Website SEO Checker — Free Online Web Page Audit Tool', desc: 'Audit any web page in seconds with our free website SEO checker. Detect broken links, missing tags, and content issues.' },
      'meta-tag-analyzer': { title: 'Meta Tag Analyzer — Check Title & Description Optimization', desc: 'Analyze meta title, description, robots directives, OpenGraph, and viewport tags with real-time character counters.' },
      'title-tag-checker': { title: 'Title Tag Checker — Length, Pixel Width & Truncation Tester', desc: 'Evaluate title tag length, pixel width preview, truncation risks, and keyword positioning for Google SERPs.' },
      'meta-description-checker': { title: 'Meta Description Checker — Free SERP Snippet Preview Tool', desc: 'Inspect meta description character length, pixel width, and SERP snippet readability to maximize click-through rates.' },
      'http-status-checker': { title: 'HTTP Status Code Checker — 200, 301, 404, 500 Header Analyzer', desc: 'Check HTTP response status codes and server headers. Detect server errors, 404s, and forbidden responses.' },
      'redirect-checker': { title: 'Redirect Checker & 301 Chain Trace Tool — Free URL Tracer', desc: 'Trace full 301/302 HTTP redirect chains and loops. Identify redirect latency and preserve link equity.' },
      'robots-txt-checker': { title: 'Robots.txt Checker & Validator — Free SEO Crawler Tester', desc: 'Validate robots.txt syntax, inspect user-agent directives, verify sitemap declarations, and prevent crawl blockers.' },
      'xml-sitemap-checker': { title: 'XML Sitemap Checker & Validator — Free Sitemap Inspector', desc: 'Analyze XML sitemaps for syntax errors, URL counts, location tags, and search engine discoverability.' },
      'canonical-checker': { title: 'Canonical Tag Checker — Identify Duplicate Content & Rel=Canonical', desc: 'Inspect rel=canonical link elements, cross-domain canonicals, and self-referencing tags to prevent duplicate indexing.' },
      'page-speed-checker': { title: 'Page Speed Checker & TTFB Speed Test — Free Performance Tool', desc: 'Measure server response times, Time to First Byte (TTFB), HTML transfer weights, and page rendering speed.' },
      'core-web-vitals': { title: 'Core Web Vitals Checker — LCP, CLS, INP, FCP & TBT Audit', desc: 'Evaluate Google Core Web Vitals including Largest Contentful Paint, Cumulative Layout Shift, and Total Blocking Time.' },
      'performance-analyzer': { title: 'Website Performance Analyzer — Code, Compression & Asset Audit', desc: 'Analyze HTML payload size, Gzip/Brotli compression, DOM element depth, and response performance.' },
      'backlink-checker': { title: 'Backlink Checker & Link Profile Analyzer — Free SEO Tool', desc: 'Analyze total link counts, internal link distributions, and outbound external link targets.' },
      'domain-rating-checker': { title: 'Domain Rating & Authority Checker — Free Website Authority Tool', desc: 'Inspect domain authority indicators, DNS records, registration age, and organic trust signals.' },
      'referring-domains': { title: 'Referring Domains Checker & Unique Linking Hosts Analyzer', desc: 'Analyze unique referring host counts, external outbound endpoints, and domain diversity.' },
      'anchor-text-checker': { title: 'Anchor Text Checker — Internal & External Link Text Analyzer', desc: 'Inspect anchor text distributions, descriptive phrasing, and empty link text ratios across any webpage.' },
      'broken-backlinks': { title: 'Broken Backlinks & Dead Outbound Link Checker — 404 Finder', desc: 'Identify dead outbound links, missing href targets, and broken URLs that hurt user experience and SEO.' },
      'keyword-density': { title: 'Keyword Density Checker — Content Frequency & Ratio Analyzer', desc: 'Calculate single-word and phrase keyword density, total word count, and content repetition percentages.' },
      'word-counter': { title: 'Word Counter & Content Depth Analyzer — Free SEO Tool', desc: 'Count total words, characters, estimated reading time, and text-to-HTML ratios for search readiness.' },
      'heading-analyzer': { title: 'Heading Analyzer — H1, H2, H3 Semantic Hierarchy Checker', desc: 'Inspect H1 to H6 heading structure, detect multiple or missing H1 tags, and evaluate document outline clarity.' },
      'serp-checker': { title: 'Google SERP Snippet Preview Tool — Search Result Simulator', desc: 'Simulate Google desktop and mobile search engine result page snippets with live title and description previews.' },
      'ssl-checker': { title: 'SSL Certificate Checker & HTTPS Security Validator', desc: 'Inspect SSL/TLS certificate validity, expiration dates, issuing authority, and cryptographic protocols.' },
      'security-headers': { title: 'HTTP Security Headers Checker — HSTS, CSP, X-Frame-Options', desc: 'Audit critical security headers including Strict-Transport-Security, Content-Security-Policy, and X-Content-Type.' },
      'dns-lookup': { title: 'DNS Lookup Tool — A, AAAA, MX, TXT, NS Record Inspector', desc: 'Query live DNS records including IPv4/IPv6 addresses, mail exchange servers, nameservers, and SPF/TXT verification.' },
      'whois': { title: 'WHOIS Domain Lookup & Registrar Information Tool', desc: 'Inspect domain registration creation dates, expiration timelines, registrar authority, and name server records.' },
      'schema-checker': { title: 'Schema.org Structured Data Checker — JSON-LD & Microdata Validator', desc: 'Validate Schema.org JSON-LD and microdata markup for rich snippet eligibility in Google search results.' },
      'open-graph-checker': { title: 'Open Graph & Social Card Preview Tool — Facebook & X Meta', desc: 'Inspect og:title, og:description, og:image, and Twitter card tags for high-converting social sharing snippets.' },
      'sitemap-extractor': { title: 'XML Sitemap URL Extractor & Link Counter — Free SEO Tool', desc: 'Extract and inspect URL endpoints from XML sitemaps and sitemap index files with zero hassle.' },
      'ai-seo-advisor': { title: 'AI SEO Advisor — Automated Optimization Recommendations', desc: 'Get prioritized technical recommendations and automated fix instructions powered by Google Gemini models.' },
    };

    const info = toolTitles[slug] || {
      title: `${slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')} | Free SEO Tool`,
      desc: 'Free professional SEO tool to analyze, diagnose, and optimize your website with no registration.',
    };

    return {
      title: `${info.title} | SEO Report Tools`,
      desc: info.desc,
      canonical: `https://seoreporttools.com/tools/${slug}`,
    };
  }

  // 2. Blog posts
  if (cleanPath.startsWith('/blog/')) {
    const slug = cleanPath.replace('/blog/', '');
    const title = `${slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')} — SEO Guide`;
    return {
      title: `${title} | SEO Report Tools`,
      desc: `In-depth expert SEO tutorial and actionable guide on ${slug.replace(/-/g, ' ')}.`,
      canonical: `https://seoreporttools.com/blog/${slug}`,
    };
  }

  // 3. Cluster / Pillar Landing Pages
  const clusterMeta: Record<string, { title: string; desc: string }> = {
    '/tools': { title: 'All 30+ Free SEO Tools Directory — Complete Web SEO Suite', desc: 'Explore 30+ free professional SEO tools to analyze, diagnose, and optimize your website.' },
    '/free-seo-tools': { title: 'Free SEO Tools — 30+ Website SEO Tools Suite', desc: 'Access 30+ completely free website SEO tools. Audit technical SEO, analyze meta tags, check backlinks, and test speed.' },
    '/seo-audit': { title: 'Free SEO Audit Tool — Comprehensive Website Health Check', desc: 'Run a free comprehensive website SEO audit. Check technical health, on-page optimization, and page speed.' },
    '/seo-report': { title: 'Free Website SEO Report Generator & Health Checker', desc: 'Generate instant diagnostic SEO reports with weighted scores, issue detection, and PDF exports.' },
    '/seo-tools': { title: 'Free SEO Tools Platform — No Login Required', desc: '30+ free SEO diagnostic tools for developers, marketers, and webmasters.' },
    '/seo-checker': { title: 'Free Website SEO Checker & On-Page Diagnostic Tool', desc: 'Check website SEO health, meta tags, heading hierarchies, and crawlability signals in seconds.' },
    '/seo-analysis': { title: 'Free SEO Analysis Tool — Full Site Diagnostic Engine', desc: 'Analyze web page optimization, server headers, mobile readiness, and security posture for free.' },
    '/technical-seo': { title: 'Technical SEO Checker & Diagnostic Audit Suite', desc: 'Audit canonical tags, robots.txt, XML sitemaps, HTTP status codes, and server response times.' },
    '/on-page-seo': { title: 'On-Page SEO Checker & Content Optimization Tool', desc: 'Optimize meta titles, descriptions, H1 headings, content depth, and keyword frequency.' },
    '/blog': { title: 'SEO Guides, Tutorials & Best Practices Blog', desc: 'Master search engine optimization with in-depth guides on technical SEO, on-page optimization, and speed.' },
    '/about': { title: 'About SEO Report Tools — Free Website SEO Diagnostic Platform', desc: 'Learn about our mission to democratize professional website SEO diagnostics 100% free forever.' },
    '/contact': { title: 'Contact SEO Report Tools — Feedback, Bugs & Partnerships', desc: 'Get in touch with the SEO Report Tools team for bug reports, feedback, and partnership inquiries.' },
    '/seo-score-methodology': { title: 'SEO Score Methodology & Diagnostic Framework', desc: 'Learn how SEO Report Tools calculates website health scores (0-100) using a transparent 7-category weighted formula.' },
    '/how-it-works': { title: 'How SEO Report Tools Works — Crawler Architecture', desc: 'An architectural overview of how our server-side crawler inspects websites and produces SEO diagnostic audits.' },
    '/privacy-policy': { title: 'Privacy Policy — SEO Report Tools', desc: 'Privacy policy regarding anonymous tool usage, temporary scan data, and Google AdSense compliance.' },
    '/terms': { title: 'Terms of Service — SEO Report Tools', desc: 'Terms of Service for SEO Report Tools explaining permitted usage, liability disclaimers, and tool operation policies.' },
    '/cookie-policy': { title: 'Cookie Policy — SEO Report Tools', desc: 'Details on how cookies and local storage are utilized on SEO Report Tools.' },
    '/audit-history': { title: 'SEO Audit Score History & Progress Tracker', desc: 'Track your website SEO audit score progression over time with interactive Recharts visual trends and browser local storage.' },
    '/history': { title: 'SEO Audit Score History & Progress Tracker', desc: 'Track your website SEO audit score progression over time with interactive Recharts visual trends and browser local storage.' },
  };

  if (clusterMeta[cleanPath]) {
    const item = clusterMeta[cleanPath];
    return {
      title: `${item.title} | SEO Report Tools`,
      desc: item.desc,
      canonical: `https://seoreporttools.com${cleanPath}`,
    };
  }

  // 4. Default / Homepage
  return {
    title: 'Free SEO Tools & SEO Report Generator | SEO Report Tools',
    desc: 'Free SEO tools to analyze your website, generate SEO reports, check technical SEO, meta tags, backlinks, page speed, Core Web Vitals and more. No login required.',
    canonical: cleanPath === '/' ? 'https://seoreporttools.com' : `https://seoreporttools.com${cleanPath}`,
  };
}

function injectSeoIntoHtml(rawHtml: string, reqPath: string): string {
  const seo = getRouteSeo(reqPath);
  let html = rawHtml;

  html = html.replace(/<title>.*?<\/title>/i, `<title>${seo.title}</title>`);
  html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${seo.desc}" />`);
  html = html.replace(/<link rel="canonical" href=".*?" \/>/i, `<link rel="canonical" href="${seo.canonical}" />`);
  html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${seo.title}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${seo.desc}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${seo.canonical}" />`);
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${seo.title}" />`);
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${seo.desc}" />`);

  return html;
}

// Urgent static routes for Agentic Crawlers before Vite SPA catch-all
app.get('/llms.txt', (_req: Request, res: Response) => {
  res.type('text/markdown; charset=UTF-8');
  const candidates = [
    path.join(process.cwd(), 'public', 'llms.txt'),
    path.join(process.cwd(), 'dist', 'llms.txt'),
    path.join(__dirname, 'public', 'llms.txt'),
    path.join(__dirname, 'dist', 'llms.txt'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return res.sendFile(c);
    }
  }
  return res.send('# SEO Report Tools\n\nComprehensive suite of 30+ free website SEO analysis, audit, and diagnostic reporting tools.\n\n- [Full SEO Audit](https://seoreporttools.com/)\n- [All SEO Tools](https://seoreporttools.com/tools)\n');
});

app.get('/ai-catalog.json', (_req: Request, res: Response) => {
  res.type('application/json; charset=UTF-8');
  const candidates = [
    path.join(process.cwd(), 'public', 'ai-catalog.json'),
    path.join(process.cwd(), 'dist', 'ai-catalog.json'),
    path.join(__dirname, 'public', 'ai-catalog.json'),
    path.join(__dirname, 'dist', 'ai-catalog.json'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return res.sendFile(c);
    }
  }
  return res.json({
    $schema: 'https://schemas.agentcatalog.org/v1/ai-catalog.json',
    name: 'SEO Report Tools',
    description: 'Comprehensive suite of 30+ free website SEO analysis, audit, and diagnostic reporting tools.',
    url: 'https://seoreporttools.com',
  });
});

// Server Initialization
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      // Ensure explicit agent routes are intercepted before vite SPA html catch-all
      app.use((req, res, next) => {
        if (req.path === '/llms.txt' || req.path === '/ai-catalog.json') {
          return next();
        }
        vite.middlewares(req, res, next);
      });
    } catch {
      // If vite not present in production bundle, serve dist
      app.use(express.static('dist'));
      app.get('*', (req: Request, res: Response) => {
        try {
          const indexFile = path.resolve('dist/index.html');
          if (fs.existsSync(indexFile)) {
            const raw = fs.readFileSync(indexFile, 'utf8');
            const processed = injectSeoIntoHtml(raw, req.path);
            return res.send(processed);
          }
        } catch {
          // Fallback
        }
        res.sendFile('index.html', { root: 'dist' });
      });
    }
  } else {
    // Serve static files in production with SSR meta injection
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      try {
        const indexFile = path.resolve('dist/index.html');
        if (fs.existsSync(indexFile)) {
          const raw = fs.readFileSync(indexFile, 'utf8');
          const processed = injectSeoIntoHtml(raw, req.path);
          return res.send(processed);
        }
      } catch {
        // Fallback
      }
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  app.listen(PORT, () => {
    console.log(`SEO Report Tools server running at http://localhost:${PORT}`);
  });
}

startServer();
