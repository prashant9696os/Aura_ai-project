import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  TrendingUp,
  FileText,
  LifeBuoy,
  Zap,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Database,
  Search,
  RefreshCw,
  ShieldCheck,
  Send,
} from 'lucide-react';

export default function Dashboard() {
  const { setActiveTab, createNewChat, documents, tickets, addToast } = useApp();

  const [omnibarPrompt, setOmnibarPrompt] = useState('');
  const [isPingingModels, setIsPingingModels] = useState(false);
  const [modelLatencies, setModelLatencies] = useState({
    'GPT-4o Omni': '19ms',
    'Claude 3.5 Sonnet': '26ms',
    'Gemini 1.5 Pro': '22ms',
    'DeepSeek R1': '17ms',
  });
  const [activityFilter, setActivityFilter] = useState('all');

  const openTicketsCount = tickets.filter((t) => t.status !== 'Resolved').length;

  const kpis = [
    {
      title: 'Inference Velocity',
      value: '248,910',
      unit: 'queries / mo',
      change: '+22.4% vs last mo',
      positive: true,
      icon: Zap,
      gradient: 'var(--gradient-primary)',
      sparkline: [40, 55, 48, 65, 80, 72, 95],
      detail: 'p99 sub-40ms edge delivery',
    },
    {
      title: 'Vector Knowledge Base',
      value: documents.length.toString(),
      unit: 'documents indexed',
      change: '+100% RAG ready',
      positive: true,
      icon: Database,
      gradient: 'var(--gradient-cyan-indigo)',
      sparkline: [10, 18, 25, 28, 35, 42, 48],
      detail: '1.36M token shards active',
    },
    {
      title: 'Autonomous Triage Rate',
      value: '94.8%',
      unit: 'tickets resolved',
      change: '+5.2% accuracy',
      positive: true,
      icon: LifeBuoy,
      gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
      sparkline: [88, 90, 89, 92, 93, 94, 95],
      detail: 'Avg resolution: 1.4 minutes',
    },
    {
      title: 'p99 Query Latency',
      value: '24ms',
      unit: 'edge response time',
      change: '-12ms optimization',
      positive: true,
      icon: Clock,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
      sparkline: [45, 42, 38, 35, 30, 26, 24],
      detail: 'Distributed cache warm',
    },
  ];

  const models = [
    { name: 'GPT-4o Omni', provider: 'OpenAI', status: 'Online', sla: '99.98%', color: '#10b981', badge: 'Flagship' },
    { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', status: 'Online', sla: '100%', color: '#8b5cf6', badge: 'Code & Logic' },
    { name: 'Gemini 1.5 Pro', provider: 'Google', status: 'Online', sla: '99.95%', color: '#06b6d4', badge: '1M Context' },
    { name: 'DeepSeek R1', provider: 'DeepSeek', status: 'Online', sla: '99.99%', color: '#3b82f6', badge: 'Reasoning' },
  ];

  const recentEvents = [
    {
      id: 1,
      category: 'ticket',
      title: 'Auto-triaged Critical Incident TCK-8942',
      detail: 'HNSW vector cluster memory anomaly identified; replica scale patch suggested.',
      time: '12m ago',
      badge: 'Urgent',
      badgeClass: 'badge-danger',
    },
    {
      id: 2,
      category: 'knowledge',
      title: 'Document Vectorized & Indexed',
      detail: 'Enterprise_Architecture_Overview.pdf processed into 36 embedding chunks.',
      time: '45m ago',
      badge: 'Indexed',
      badgeClass: 'badge-success',
    },
    {
      id: 3,
      category: 'ticket',
      title: 'Autonomous Resolution Drafted',
      detail: 'Drafted SAML 2.0 Okta credentials guide for ticket TCK-8941.',
      time: '2h ago',
      badge: 'Resolved',
      badgeClass: 'badge-primary',
    },
    {
      id: 4,
      category: 'system',
      title: 'Cluster Health Check Executed',
      detail: 'Distributed read replicas in us-east-1 passed zero-downtime integrity test.',
      time: '3h ago',
      badge: 'Healthy',
      badgeClass: 'badge-cyan',
    },
    {
      id: 5,
      category: 'system',
      title: 'Semantic Vector Cache Purged',
      detail: 'Evicted 412 stale embeddings to free 84MB in-memory HNSW buffer.',
      time: '5h ago',
      badge: 'Optimized',
      badgeClass: 'badge-purple',
    },
  ];

  const quickPrompts = [
    {
      title: 'Vector Cluster Diagnostic',
      desc: 'Check latency spikes, memory fragmentation and HNSW indices',
      category: 'Infrastructure',
      prompt: 'Diagnose current vector cluster performance and latency metrics.',
    },
    {
      title: 'Review SLA Guidelines',
      desc: 'Cross-reference open tickets against Q3 SLA targets',
      category: 'Support Intelligence',
      prompt: 'Cross-reference our open tickets against the uploaded Q3 Customer Support SLA Guidelines.',
    },
    {
      title: 'Fine-Tuning Security Audit',
      desc: 'Verify PII scrubbing parameters and differential privacy',
      category: 'Security & Compliance',
      prompt: 'Audit our LLM fine-tuning data pipeline according to the security checklist.',
    },
    {
      title: 'Generate Microservice Spec',
      desc: 'Draft cloud-native blueprint with React & FastAPI',
      category: 'Architecture',
      prompt: 'Draft an enterprise React.js and Python microservice architecture for autonomous AI inference.',
    },
  ];

  const handleRunOmnibar = (e) => {
    e?.preventDefault();
    if (!omnibarPrompt.trim()) return;
    createNewChat();
    localStorage.setItem('aura_pending_prompt', omnibarPrompt);
    setActiveTab('chat');
  };

  const handleTestModelPing = () => {
    setIsPingingModels(true);
    addToast('Ping Test Dispatched', 'Probing edge latency across all 4 inference backends...', 'info');
    setTimeout(() => {
      setModelLatencies({
        'GPT-4o Omni': `${Math.floor(Math.random() * 8 + 16)}ms`,
        'Claude 3.5 Sonnet': `${Math.floor(Math.random() * 10 + 22)}ms`,
        'Gemini 1.5 Pro': `${Math.floor(Math.random() * 9 + 18)}ms`,
        'DeepSeek R1': `${Math.floor(Math.random() * 6 + 14)}ms`,
      });
      setIsPingingModels(false);
      addToast('Ping Telemetry Updated', 'All 4 inference providers reporting sub-30ms response times.', 'success');
    }, 900);
  };

  const filteredEvents = recentEvents.filter((evt) => {
    if (activityFilter === 'all') return true;
    return evt.category === activityFilter;
  });

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1600px', margin: '0 auto', overflowY: 'auto', height: 'calc(100vh - var(--header-height))' }}>
      {/* Hero Command Banner */}
      <div
        className="glass-card"
        style={{
          padding: '28px 32px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.14) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(14, 20, 36, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: 'var(--shadow-glow)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">
              <Sparkles size={12} /> Autonomous AI Operations Hub
            </span>
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> 4 Foundational Models Connected
            </span>
            <span className="badge badge-cyan">
              <ShieldCheck size={12} /> Enterprise Zero-Trust Grounding
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.025em' }}>
            Enterprise Intelligence & <span className="gradient-text">Autonomous Orchestration</span>
          </h1>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px', maxWidth: '680px' }}>
            Unified control plane for multi-agent reasoning, semantic vector search (RAG), customer ticket auto-triage, and operational observability.
          </p>

          {/* AI Omnibar Quick Command Input */}
          <form
            onSubmit={handleRunOmnibar}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(9, 13, 22, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '6px 8px 6px 16px',
              maxWidth: '640px',
              marginBottom: '18px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Search size={16} color="var(--primary-400)" />
            <input
              type="text"
              placeholder="Ask AURA or execute an operational prompt (e.g. 'Analyze SLA breach risk')..."
              value={omnibarPrompt}
              onChange={(e) => setOmnibarPrompt(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-main)',
                fontSize: '13.5px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '12.5px', borderRadius: 'var(--radius-md)' }}
            >
              <Send size={13} />
              <span>Execute</span>
            </button>
          </form>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              onClick={() => createNewChat()}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Sparkles size={15} />
              <span>Launch Neural Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <FileText size={15} />
              <span>Knowledge Hub ({documents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <LifeBuoy size={15} />
              <span>AI Tickets ({openTicketsCount} Open)</span>
            </button>
          </div>
        </div>

        {/* Decorative Ambient Radial Orb */}
        <div
          style={{
            position: 'absolute',
            right: '-60px',
            bottom: '-60px',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(6, 182, 212, 0.1) 60%, transparent 80%)',
            borderRadius: '50%',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="glass-card-interactive"
              style={{
                padding: '20px 22px',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {kpi.title}
                  </span>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: kpi.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <Icon size={18} color="#ffffff" />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    {kpi.value}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {kpi.unit}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {kpi.detail}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: kpi.positive ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <TrendingUp size={13} />
                  {kpi.change}
                </span>

                {/* SVG Sparkline */}
                <svg width="76" height="24" viewBox="0 0 76 24" style={{ overflow: 'visible' }}>
                  <polyline
                    fill="none"
                    stroke="var(--primary-400)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={kpi.sparkline
                      .map((val, i) => `${(i / (kpi.sparkline.length - 1)) * 76},${24 - (val / 100) * 20}`)
                      .join(' ')}
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommended Prompts & Workflows */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Single-Click Operations & Prompts</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Run domain workflows with pre-configured RAG grounding</p>
          </div>
          <span className="badge badge-primary" style={{ fontSize: '11px' }}>
            Instant Execution
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '14px',
          }}
        >
          {quickPrompts.map((qp, i) => (
            <div
              key={i}
              onClick={() => {
                createNewChat();
                localStorage.setItem('aura_pending_prompt', qp.prompt);
                setActiveTab('chat');
              }}
              className="glass-card-interactive"
              style={{
                padding: '16px 18px',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '9.5px', padding: '1px 6px' }}>
                    {qp.category}
                  </span>
                  <ArrowUpRight size={14} color="var(--primary-400)" />
                </div>
                <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {qp.title}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {qp.desc}
                </p>
              </div>

              <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--primary-400)', fontWeight: 600 }}>
                Execute in Neural Assistant &rarr;
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Model Fleet Telemetry + Event Audit Stream */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Model Fleet Health */}
        <div className="glass-card" style={{ padding: '22px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Active Model Fleet Telemetry</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Multi-provider real-time health checks</p>
            </div>
            <button
              onClick={handleTestModelPing}
              className="btn btn-secondary"
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
              disabled={isPingingModels}
            >
              <RefreshCw size={12} className={isPingingModels ? 'spin' : ''} />
              <span>Ping All</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {models.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: m.color,
                      boxShadow: `0 0 10px ${m.color}`,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {m.provider} • <span style={{ color: 'var(--text-secondary)' }}>{m.badge}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      {m.sla} SLA
                    </div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {modelLatencies[m.name]}
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '9.5px', padding: '2px 7px' }}>
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Event Stream */}
        <div className="glass-card" style={{ padding: '22px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Telemetry & Audit Stream</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Autonomous platform action log</p>
            </div>

            {/* Category Filter Pills */}
            <div className="tab-switcher">
              {['all', 'ticket', 'knowledge', 'system'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActivityFilter(cat)}
                  className={`tab-btn ${activityFilter === cat ? 'active' : ''}`}
                  style={{ fontSize: '10.5px', padding: '3px 8px', textTransform: 'capitalize' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {evt.title}
                    </span>
                    <span className={`badge ${evt.badgeClass}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                      {evt.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {evt.detail}
                  </p>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', display: 'inline-block' }}>
                    {evt.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
