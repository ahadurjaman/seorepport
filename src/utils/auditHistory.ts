import { AuditReport } from '../types/seo';

export interface AuditHistoryItem {
  id: string;
  url: string;
  domain: string;
  timestamp: string; // ISO date string
  overallScore: number;
  categories: {
    technical: number;
    onpage: number;
    performance: number;
    mobile: number;
    security: number;
    content: number;
    links: number;
  };
  checksSummary: {
    pass: number;
    warning: number;
    fail: number;
  };
}

const STORAGE_KEY = 'seotools_audit_history_v1';
const MAX_HISTORY_ITEMS = 50;

export function getAuditHistory(): AuditHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAuditToHistory(report: AuditReport): AuditHistoryItem[] {
  if (typeof window === 'undefined' || !report) return [];
  try {
    const history = getAuditHistory();
    const item: AuditHistoryItem = {
      id: report.id || `audit_${Date.now()}`,
      url: report.url,
      domain: report.domain || (new URL(report.url).hostname),
      timestamp: report.timestamp || new Date().toISOString(),
      overallScore: Math.round(report.overallScore),
      categories: {
        technical: Math.round(report.categories?.technical?.score ?? 0),
        onpage: Math.round(report.categories?.onpage?.score ?? 0),
        performance: Math.round(report.categories?.performance?.score ?? 0),
        mobile: Math.round(report.categories?.mobile?.score ?? 0),
        security: Math.round(report.categories?.security?.score ?? 0),
        content: Math.round(report.categories?.content?.score ?? 0),
        links: Math.round(report.categories?.links?.score ?? 0),
      },
      checksSummary: {
        pass: report.statusSummary?.passCount ?? 0,
        warning: report.statusSummary?.warningCount ?? 0,
        fail: report.statusSummary?.criticalCount ?? 0,
      },
    };

    // Prepend new item, remove duplicates if exactly identical timestamp or keep unique entries
    const updated = [item, ...history.filter((h) => h.id !== item.id && !(h.url === item.url && h.timestamp === item.timestamp))].slice(
      0,
      MAX_HISTORY_ITEMS
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('seotools_history_updated', { detail: updated }));
    return updated;
  } catch (err) {
    console.warn('Could not save audit to local history:', err);
    return getAuditHistory();
  }
}

export function clearAuditHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('seotools_history_updated', { detail: [] }));
  } catch (err) {
    console.warn('Could not clear history:', err);
  }
}

export function deleteAuditHistoryItem(id: string): AuditHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const history = getAuditHistory().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    window.dispatchEvent(new CustomEvent('seotools_history_updated', { detail: history }));
    return history;
  } catch {
    return getAuditHistory();
  }
}
