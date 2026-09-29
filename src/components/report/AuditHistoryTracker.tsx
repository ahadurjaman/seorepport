import React, { useState, useEffect, useMemo } from 'react';
import {
  AuditHistoryItem,
  getAuditHistory,
  clearAuditHistory,
  deleteAuditHistoryItem,
} from '../../utils/auditHistory';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  History,
  TrendingUp,
  TrendingDown,
  Trash2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface AuditHistoryTrackerProps {
  onSelectAudit?: (url: string) => void;
  currentDomain?: string;
}

export const AuditHistoryTracker: React.FC<AuditHistoryTrackerProps> = ({
  onSelectAudit,
  currentDomain,
}) => {
  const [history, setHistory] = useState<AuditHistoryItem[]>([]);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [chartMetric, setChartMetric] = useState<'overall' | 'technical' | 'performance' | 'onpage'>('overall');

  // Load history on mount and subscribe to update events
  useEffect(() => {
    setHistory(getAuditHistory());

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setHistory(e.detail);
      } else {
        setHistory(getAuditHistory());
      }
    };

    window.addEventListener('seotools_history_updated', handleUpdate);
    return () => {
      window.removeEventListener('seotools_history_updated', handleUpdate);
    };
  }, []);

  // Update selected domain filter if prop changes
  useEffect(() => {
    if (currentDomain) {
      setSelectedDomainFilter(currentDomain);
    }
  }, [currentDomain]);

  // Unique domains in history
  const uniqueDomains = useMemo(() => {
    const set = new Set<string>();
    history.forEach((h) => set.add(h.domain));
    return Array.from(set);
  }, [history]);

  // Filter history based on domain selection
  const filteredHistory = useMemo(() => {
    if (selectedDomainFilter === 'all') return history;
    return history.filter((h) => h.domain.toLowerCase() === selectedDomainFilter.toLowerCase());
  }, [history, selectedDomainFilter]);

  // Format data chronologically (oldest to newest) for line/area chart progression
  const chartData = useMemo(() => {
    // History is stored newest-first; sort oldest first for trend line
    const sorted = [...filteredHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return sorted.map((item, index) => {
      const date = new Date(item.timestamp);
      const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

      return {
        id: item.id,
        url: item.url,
        domain: item.domain,
        label: `${dateLabel} ${timeLabel}`,
        dateStr: dateLabel,
        index: index + 1,
        overallScore: item.overallScore,
        technical: item.categories.technical,
        performance: item.categories.performance,
        onpage: item.categories.onpage,
        mobile: item.categories.mobile,
        security: item.categories.security,
      };
    });
  }, [filteredHistory]);

  // Compute trends
  const scoreTrend = useMemo(() => {
    if (chartData.length < 2) return null;
    const latest = chartData[chartData.length - 1].overallScore;
    const previous = chartData[chartData.length - 2].overallScore;
    const diff = latest - previous;
    return {
      diff,
      improved: diff > 0,
      declined: diff < 0,
      equal: diff === 0,
    };
  }, [chartData]);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your local SEO audit history?')) {
      clearAuditHistory();
      setHistory([]);
    }
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteAuditHistoryItem(id);
    setHistory(updated);
  };

  if (history.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-sm text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <History className="w-6 h-6" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-900">No Past Audits Recorded Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Run an audit on any website above and your scores will automatically be tracked here in your browser's private local storage. You'll see score trends and historical progress charts over time!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
            <History className="w-3.5 h-3.5" />
            <span>Local History Tracker</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>SEO Score History &amp; Progress</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredHistory.length} {filteredHistory.length === 1 ? 'Audit' : 'Audits'}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Stored privately in your browser. Track improvements and regressions across your site audits.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {uniqueDomains.length > 1 && (
            <select
              value={selectedDomainFilter}
              onChange={(e) => setSelectedDomainFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Domains ({history.length})</option>
              {uniqueDomains.map((dom) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
            title="Clear all audit history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Metric Selector & Trends Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Metric:</span>
          {(
            [
              { id: 'overall', label: 'Overall Score' },
              { id: 'technical', label: 'Technical' },
              { id: 'performance', label: 'Performance' },
              { id: 'onpage', label: 'On-Page' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setChartMetric(m.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                chartMetric === m.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {scoreTrend && (
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="text-slate-500">Latest Trend:</span>
            {scoreTrend.improved && (
              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <TrendingUp className="w-3.5 h-3.5" />
                +{scoreTrend.diff} pts improvement!
              </span>
            )}
            {scoreTrend.declined && (
              <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                <TrendingDown className="w-3.5 h-3.5" />
                {scoreTrend.diff} pts
              </span>
            )}
            {scoreTrend.equal && (
              <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                Score Unchanged
              </span>
            )}
          </div>
        )}
      </div>

      {/* Recharts Score Progression Visualization */}
      <div className="space-y-2">
        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const val = payload[0].value;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl space-y-1 text-xs">
                        <div className="font-bold text-slate-900 truncate max-w-[200px]">{data.domain}</div>
                        <div className="text-[11px] text-slate-400">{data.label}</div>
                        <div className="pt-1 flex items-center justify-between gap-4 font-bold">
                          <span className="capitalize text-indigo-600">{chartMetric} Score:</span>
                          <span className="text-base text-slate-900">{val} / 100</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={
                  chartMetric === 'overall'
                    ? 'overallScore'
                    : chartMetric
                }
                stroke="#4f46e5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#scoreColor)"
                activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Logs List */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Past Audits Log
        </h3>
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden max-h-72 overflow-y-auto">
          {filteredHistory.map((item) => {
            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const formattedTime = date.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            // Score badge color
            const scoreColor =
              item.overallScore >= 80
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : item.overallScore >= 50
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-rose-100 text-rose-800 border-rose-200';

            return (
              <div
                key={item.id}
                onClick={() => onSelectAudit?.(item.url)}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-white transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm border shrink-0 ${scoreColor}`}
                  >
                    {item.overallScore}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {item.domain}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formattedDate} at {formattedTime}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-600 font-medium">{item.checksSummary.pass} Pass</span>
                      <span>•</span>
                      <span className="text-rose-600 font-medium">{item.checksSummary.fail} Fail</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAudit?.(item.url);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
                  >
                    Re-Audit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
