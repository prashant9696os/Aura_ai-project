import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { analyticsService } from '../../services/api';
import {
  Download,
  Zap,
  Clock,
  DollarSign,
  Activity,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const INITIAL_TOKEN_TRENDS = [
  { day: 'Mon', tokens: 32000, queries: 1420 },
  { day: 'Tue', tokens: 45000, queries: 1980 },
  { day: 'Wed', tokens: 38000, queries: 1650 },
  { day: 'Thu', tokens: 52000, queries: 2340 },
  { day: 'Fri', tokens: 68000, queries: 3120 },
  { day: 'Sat', tokens: 28000, queries: 1190 },
  { day: 'Sun', tokens: 42000, queries: 1890 },
];

const INITIAL_MODEL_COSTS = [
  { name: 'GPT-4o Omni', cost: '$142.50', percentage: 42, color: 'var(--accent-emerald)', queries: 6120 },
  { name: 'Claude 3.5 Sonnet', cost: '$98.20', percentage: 29, color: 'var(--accent-purple)', queries: 3940 },
  { name: 'DeepSeek R1', cost: '$54.00', percentage: 16, color: 'var(--primary-400)', queries: 2180 },
  { name: 'Gemini 1.5 Pro', cost: '$44.10', percentage: 13, color: 'var(--accent-cyan)', queries: 1350 },
];

const INITIAL_LATENCY_BUCKETS = [
  { range: '< 20ms (Edge Cache Hit)', pct: 64, color: 'var(--accent-emerald)', count: '8,697 reqs' },
  { range: '20 - 50ms (Direct Node Inference)', pct: 26, color: 'var(--primary-400)', count: '3,533 reqs' },
  { range: '50 - 100ms (Heavy Vector RAG)', pct: 8, color: 'var(--accent-amber)', count: '1,087 reqs' },
  { range: '> 100ms (Complex Multi-Hop Re-rank)', pct: 2, color: 'var(--accent-rose)', count: '273 reqs' },
];

const INITIAL_TOP_TOPICS = [
  { topic: 'Vector Search & HNSW Indexing Tuning', queries: 842, share: '34%', category: 'Infrastructure' },
  { topic: 'Customer SLA Incident Automated Triage', queries: 512, share: '21%', category: 'Support' },
  { topic: 'Distributed React 19 Microservice Blueprint', queries: 430, share: '17%', category: 'Architecture' },
  { topic: 'Zero-Trust SOC2 & PII Data Scrubbing', queries: 380, share: '15%', category: 'Security' },
  { topic: 'API Token Quota & Cost Optimization', queries: 320, share: '13%', category: 'Billing' },
];

export default function AnalyticsView() {
  const { addToast } = useApp();
  const [timeRange, setTimeRange] = useState('7d');
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);

  // Dynamic telemetry states
  const [tokenTrends, setTokenTrends] = useState(INITIAL_TOKEN_TRENDS);
  const [modelCosts, setModelCosts] = useState(INITIAL_MODEL_COSTS);
  const [latencyBuckets, setLatencyBuckets] = useState(INITIAL_LATENCY_BUCKETS);
  const [topTopics, setTopTopics] = useState(INITIAL_TOP_TOPICS);
  const [totalQueries, setTotalQueries] = useState(13590);
  const [totalTokens, setTotalTokens] = useState(305000);
  const [slaRate, setSlaRate] = useState('99.4%');

  useEffect(() => {
    let isMounted = true;
    const loadBackendAnalytics = async () => {
      const data = await analyticsService.fetchAnalytics();
      if (!isMounted || !data) return;
      if (data.tokenTrends) setTokenTrends(data.tokenTrends);
      if (data.modelCosts) setModelCosts(data.modelCosts);
      if (data.latencyBuckets) setLatencyBuckets(data.latencyBuckets);
      if (data.topTopics) setTopTopics(data.topTopics);
      if (data.totalQueries) setTotalQueries(data.totalQueries);
      if (data.totalTokens) setTotalTokens(data.totalTokens);
      if (data.slaComplianceRate) setSlaRate(data.slaComplianceRate);
    };
    loadBackendAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleExportCSV = () => {
    let csv = 'Day,Tokens,Queries\n';
    tokenTrends.forEach((t) => {
      csv += `${t.day},${t.tokens},${t.queries}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_analytics_${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Telemetry Exported', 'CSV report downloaded successfully.', 'success');
  };

  const maxTokens = Math.max(...tokenTrends.map((t) => t.tokens), 70000);

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1600px', margin: '0 auto', overflowY: 'auto', height: 'calc(100vh - var(--header-height))' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">
              <Activity size={12} /> Enterprise Observability
            </span>
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> Edge CDN Direct Ingress
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Analytics & System Observability
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Full visibility into multi-model token velocity, cost allocation, latency curves, and sentiment trajectories.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="tab-switcher">
            {['24h', '7d', '30d', '90d'].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setTimeRange(r);
                  addToast('Timeframe Filtered', `Observability scope adjusted to ${r.toUpperCase()}`, 'info');
                }}
                className={`tab-btn ${timeRange === r ? 'active' : ''}`}
                style={{ padding: '5px 12px', fontSize: '11.5px', textTransform: 'uppercase' }}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '12.5px' }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metric Highlights Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '22px',
        }}
      >
        <div className="glass-card-interactive" style={{ padding: '18px 20px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px' }}>
            <span>Total Token Spend</span>
            <DollarSign size={16} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary)' }}>
            $338.80
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '4px', fontWeight: 600 }}>
            {(totalTokens / 1000).toFixed(0)}k tokens • under ceiling
          </div>
        </div>

        <div className="glass-card-interactive" style={{ padding: '18px 20px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px' }}>
            <span>Inference Invocations</span>
            <Zap size={16} color="var(--primary-400)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary)' }}>
            {totalQueries.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '4px', fontWeight: 600 }}>
            +24.6% vs previous week
          </div>
        </div>

        <div className="glass-card-interactive" style={{ padding: '18px 20px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px' }}>
            <span>p95 Global Latency</span>
            <Clock size={16} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary)' }}>
            28ms
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '4px', fontWeight: 600 }}>
            {slaRate} SLA target met
          </div>
        </div>

        <div className="glass-card-interactive" style={{ padding: '18px 20px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px' }}>
            <span>Vector Cache Hit Rate</span>
            <ShieldCheck size={16} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary)' }}>
            78.4%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '4px', fontWeight: 600 }}>
            1.36M token shards warm
          </div>
        </div>
      </div>

      {/* Main Charts: Interactive Area Chart + Cost Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '20px',
          marginBottom: '22px',
        }}
      >
        {/* Token Inferences Trend SVG Chart */}
        <div className="glass-card" style={{ padding: '22px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Token Velocity & Query Volume</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Daily tokens processed across foundational LLMs</p>
            </div>
            {hoveredDataPoint && (
              <span className="badge badge-primary animate-fade-in" style={{ fontSize: '11px' }}>
                {hoveredDataPoint.day}: {hoveredDataPoint.tokens.toLocaleString()} tokens ({hoveredDataPoint.queries} queries)
              </span>
            )}
          </div>

          {/* SVG Area Chart */}
          <div style={{ width: '100%', height: '220px', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-500)" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="var(--primary-500)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="var(--border-subtle)" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="var(--border-subtle)" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="var(--border-subtle)" strokeDasharray="4 4" />

              {/* Filled Area */}
              <path
                d={`M 0,200 ${tokenTrends
                  .map((t, idx) => `L ${(idx / (tokenTrends.length - 1)) * 500},${190 - (t.tokens / maxTokens) * 150}`)
                  .join(' ')} L 500,200 Z`}
                fill="url(#areaGradient)"
              />

              {/* Primary Stroke Line */}
              <path
                d={`M 0,${190 - (tokenTrends[0].tokens / maxTokens) * 150} ${tokenTrends
                  .map((t, idx) => `L ${(idx / (tokenTrends.length - 1)) * 500},${190 - (t.tokens / maxTokens) * 150}`)
                  .join(' ')}`}
                fill="none"
                stroke="var(--primary-400)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {tokenTrends.map((t, idx) => {
                const cx = (idx / (tokenTrends.length - 1)) * 500;
                const cy = 190 - (t.tokens / maxTokens) * 150;
                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r={hoveredDataPoint?.day === t.day ? '7' : '5'}
                    fill="var(--bg-surface)"
                    stroke="var(--primary-400)"
                    strokeWidth="3"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredDataPoint(t)}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  />
                );
              })}
            </svg>

            {/* X-Axis labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
              {tokenTrends.map((t) => (
                <span key={t.day} style={{ fontWeight: hoveredDataPoint?.day === t.day ? 700 : 500, color: hoveredDataPoint?.day === t.day ? 'var(--text-primary)' : 'inherit' }}>
                  {t.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Model Cost & Efficiency Distribution */}
        <div className="glass-card" style={{ padding: '22px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Model Spend & Efficiency</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cost allocation by foundational AI model</p>
            </div>
            <span className="badge badge-success">Budget Optimal</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {modelCosts.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{item.cost}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{item.percentage}%</strong>
                  </div>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: '100%',
                      background: item.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row: Response Latency Percentiles + Top Query Topics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Latency Distribution */}
        <div className="glass-card" style={{ padding: '22px', background: 'var(--bg-surface-elevated)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Edge Response Latency Breakdown</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Percentile response distribution across global CDN edge gateways
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {latencyBuckets.map((bucket, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{bucket.range}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{bucket.count}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{bucket.pct}%</strong>
                  </div>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${bucket.pct}%`, height: '100%', background: bucket.color, borderRadius: 'var(--radius-full)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Query Topics */}
        <div className="glass-card" style={{ padding: '22px', background: 'var(--bg-surface-elevated)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Top Inquiry Topics</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Most frequent organizational reasoning clusters
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topTopics.map((top, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-400)', width: '20px' }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {top.topic}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      {top.category}
                    </div>
                  </div>
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '10.5px' }}>
                  {top.queries} queries ({top.share})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
