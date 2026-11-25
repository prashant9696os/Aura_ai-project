import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Search,
  Sparkles,
  Send,
  RefreshCw,
  X,
  Bot,
  Mail,
  Kanban,
  Columns,
  Table,
  CheckCircle2,
  Clock,
  Filter,
  Zap,
} from 'lucide-react';

export default function Tickets() {
  const { tickets, updateTicketStatus, createTicket, addToast } = useApp();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'split' | 'table'
  const [selectedTicketId, setSelectedTicketId] = useState(tickets[0]?.id || null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [showSimulateDropdown, setShowSimulateDropdown] = useState(false);
  const [editableDraft, setEditableDraft] = useState(() => tickets[0]?.aiTriage?.suggestedDraft || '');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);

  // New ticket modal form state
  const [newTitle, setNewTitle] = useState('');
  const [newCustomer, setNewCustomer] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPriority, setNewPriority] = useState('Urgent');
  const [newDescription, setNewDescription] = useState('');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleSelectTicket = (t) => {
    setSelectedTicketId(t.id);
    setEditableDraft(t.aiTriage?.suggestedDraft || '');
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || ticket.priority === filterPriority;
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const openTickets = filteredTickets.filter((t) => t.status === 'Open');
  const inProgressTickets = filteredTickets.filter((t) => t.status === 'In Progress');
  const resolvedTickets = filteredTickets.filter((t) => t.status === 'Resolved');

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTicket({
      title: newTitle,
      customer: newCustomer || 'Enterprise Client',
      email: newEmail || 'client@enterprise.com',
      priority: newPriority,
      category: 'Inference Infrastructure',
      description: newDescription,
    });

    setIsCreatingModal(false);
    setNewTitle('');
    setNewCustomer('');
    setNewEmail('');
    setNewDescription('');
  };

  const handleSimulateIncident = (scenario) => {
    setShowSimulateDropdown(false);
    createTicket(scenario);
    addToast('Incident Simulated', `Inbound alert: ${scenario.title}`, 'info');
  };

  const handleSendDraft = () => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, 'Resolved');
    addToast('Resolution Dispatched', `AI resolution sent to ${selectedTicket.customer}.`, 'success');
  };

  const handleRegenerateDraft = () => {
    if (!selectedTicket) return;
    setIsGeneratingDraft(true);
    setTimeout(() => {
      setEditableDraft(
        `Hi ${selectedTicket.customer.split(' ')[0]},\n\nWe have completed our system diagnostic for incident ${selectedTicket.id}. Our autonomous cluster controller has rerouted traffic around the impacted shards and memory pressure is normalized to 32%.\n\nPlease verify that your API calls are responding normally, and let us know if we can assist further.\n\nBest regards,\nAURA Enterprise AI Operations`
      );
      setIsGeneratingDraft(false);
      addToast('Draft Regenerated', 'New resolution crafted with updated context.', 'info');
    }, 850);
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'badge-danger';
      case 'High':
        return 'badge-warning';
      case 'Medium':
        return 'badge-primary';
      default:
        return 'badge-cyan';
    }
  };

  const getSentimentEmoji = (score) => {
    if (score <= -0.5) return '🔥 Frustrated';
    if (score < 0) return '⚠️ Concerned';
    if (score === 0) return '😐 Neutral';
    return '🟢 Positive';
  };

  const SIMULATION_PRESETS = [
    {
      title: 'High latency spikes on Vector Search API cluster in us-east-1',
      customer: 'Sarah Jenkins (Apex FinTech)',
      email: 'sarah.j@apexfin.io',
      priority: 'Urgent',
      description: 'Production embedding queries taking >1400ms instead of 80ms. Multiple user timeouts.',
      category: 'Infrastructure',
    },
    {
      title: 'Okta SAML 2.0 Identity handshake certificate expired',
      customer: 'David Chen (BioGen Systems)',
      email: 'd.chen@biogen.org',
      priority: 'High',
      description: 'Single sign-on federation failing with error ADFS-401 for 1,200 research scientists.',
      category: 'Authentication',
    },
    {
      title: 'GPU Inference worker node memory exhaustion (Out of CUDA Memory)',
      customer: 'Alex Rivera (Krypton AI Labs)',
      email: 'alex@krypton.ai',
      priority: 'Urgent',
      description: 'DeepSeek R1 batch inference crashing with CUDA error 2 on node-worker-08.',
      category: 'Compute & GPU',
    },
    {
      title: 'Automated CSV ingestion parser truncating unicode characters',
      customer: 'Elena Rostova (Global Retail Inc)',
      email: 'elena@globalretail.de',
      priority: 'Medium',
      description: 'German umlauts (ä, ö, ü) corrupted during semantic chunking pass.',
      category: 'Data Pipeline',
    },
  ];

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1600px', margin: '0 auto', height: 'calc(100vh - var(--header-height))', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-primary">
              <Bot size={12} /> Autonomous Triage & Diagnostics
            </span>
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> 94.8% Auto-Resolved
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            AI Customer Ticket Intelligence
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Real-time sentiment scoring, automated root-cause detection, and instant resolution dispatch.
          </p>
        </div>

        {/* View Mode & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View Mode Switcher */}
          <div className="tab-switcher">
            <button
              onClick={() => setViewMode('kanban')}
              className={`tab-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              title="Kanban Board View"
            >
              <Kanban size={14} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`tab-btn ${viewMode === 'split' ? 'active' : ''}`}
              title="Split Inspector View"
            >
              <Columns size={14} />
              <span>Inspector</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`tab-btn ${viewMode === 'table' ? 'active' : ''}`}
              title="Data Table View"
            >
              <Table size={14} />
              <span>Table</span>
            </button>
          </div>

          {/* Simulate Alert Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSimulateDropdown(!showSimulateDropdown)}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '12.5px' }}
            >
              <Zap size={14} color="var(--accent-amber)" />
              <span>Simulate Incident</span>
            </button>

            {showSimulateDropdown && (
              <div
                className="glass-card animate-fade-in"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '340px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '12px',
                  zIndex: 80,
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Inject Realistic Telemetry Incident
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {SIMULATION_PRESETS.map((sim, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSimulateIncident(sim)}
                      style={{
                        padding: '10px',
                        textAlign: 'left',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-surface-hover)';
                        e.currentTarget.style.borderColor = 'var(--primary-500)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className={`badge ${getPriorityBadgeClass(sim.priority)}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                          {sim.priority}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{sim.category}</span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.3 }}>
                        {sim.title}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* New Incident Button */}
          <button
            onClick={() => setIsCreatingModal(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '12.5px' }}
          >
            <Plus size={15} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Stats & Telemetry Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
          marginBottom: '18px',
        }}
      >
        <div className="glass-card" style={{ padding: '14px 18px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Open Triage</span>
            <span className="badge badge-warning" style={{ fontSize: '10px' }}>Active</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '4px' }}>
            {openCount} tickets
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px 18px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>In Investigation</span>
            <span className="badge badge-primary" style={{ fontSize: '10px' }}>Assigned</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-400)', marginTop: '4px' }}>
            {inProgressCount} tickets
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px 18px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI Resolved</span>
            <span className="badge badge-success" style={{ fontSize: '10px' }}>Zero Touch</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
            {resolvedCount} tickets
          </div>
        </div>

        <div className="glass-card" style={{ padding: '14px 18px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SLA Compliance Rate</span>
            <span className="badge badge-cyan" style={{ fontSize: '10px' }}>Target &gt;99%</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            99.4%
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search ticket ID, title, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-text"
              style={{ paddingLeft: '34px', fontSize: '12.5px', padding: '8px 12px 8px 34px' }}
            />
          </div>

          {/* Priority Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={13} color="var(--text-muted)" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="select-input"
              style={{ width: 'auto', padding: '6px 28px 6px 10px', fontSize: '12px' }}
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent (P1)</option>
              <option value="High">High (P2)</option>
              <option value="Medium">Medium (P3)</option>
              <option value="Low">Low (P4)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs (Split & Table modes) */}
        {viewMode !== 'kanban' && (
          <div className="tab-switcher">
            {['All', 'Open', 'In Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`tab-btn ${filterStatus === st ? 'active' : ''}`}
                style={{ fontSize: '11.5px', padding: '5px 12px' }}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ====================================================================
          VIEW 1: KANBAN BOARD VIEW
          ==================================================================== */}
      {viewMode === 'kanban' && (
        <div style={{ flex: 1, display: 'flex', gap: '16px', overflowX: 'auto', minHeight: 0 }}>
          {/* Column 1: Open Triage */}
          <div className="kanban-col">
            <div className="kanban-col-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="glowing-dot" style={{ backgroundColor: 'var(--accent-amber)' }} />
                <span style={{ fontWeight: 700, fontSize: '13px' }}>Open Triage</span>
              </div>
              <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                {openTickets.length}
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
              {openTickets.map((t) => (
                <div
                  key={t.id}
                  className={`kanban-card ${selectedTicket?.id === t.id ? 'selected' : ''}`}
                  onClick={() => handleSelectTicket(t)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--primary-400)' }}>
                      {t.id}
                    </span>
                    <span className={`badge ${getPriorityBadgeClass(t.priority)}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                      {t.priority}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.4 }}>
                    {t.title}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    <span>{t.customer}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-amber)' }}>
                      <Clock size={11} />
                      {t.slaDue}
                    </span>
                  </div>

                  {/* Sentiment Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', marginBottom: '10px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Sentiment:</span>
                    <span style={{ fontSize: '10.5px', fontWeight: 600, color: t.sentimentScore < 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                      {getSentimentEmoji(t.sentimentScore)}
                    </span>
                  </div>

                  {/* Card Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTicketStatus(t.id, 'In Progress');
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '5px 8px', fontSize: '11px' }}
                    >
                      Assign Investigation
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTicket(t);
                        setViewMode('split');
                      }}
                      className="btn btn-primary"
                      style={{ padding: '5px 10px', fontSize: '11px' }}
                      title="Inspect & Auto-Resolve"
                    >
                      <Sparkles size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {openTickets.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No open tickets in queue.
                </div>
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="kanban-col">
            <div className="kanban-col-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="glowing-dot" style={{ backgroundColor: 'var(--primary-500)' }} />
                <span style={{ fontWeight: 700, fontSize: '13px' }}>In Investigation</span>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                {inProgressTickets.length}
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
              {inProgressTickets.map((t) => (
                <div
                  key={t.id}
                  className={`kanban-card ${selectedTicket?.id === t.id ? 'selected' : ''}`}
                  onClick={() => handleSelectTicket(t)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--primary-400)' }}>
                      {t.id}
                    </span>
                    <span className={`badge ${getPriorityBadgeClass(t.priority)}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                      {t.priority}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.4 }}>
                    {t.title}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    <span>{t.customer}</span>
                    <span className="badge badge-cyan" style={{ fontSize: '9px', padding: '1px 5px' }}>
                      Diagnostic Ready
                    </span>
                  </div>

                  {/* Card Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTicketStatus(t.id, 'Resolved');
                        addToast('Ticket Resolved', `${t.id} marked as resolved.`, 'success');
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '5px 8px', fontSize: '11px' }}
                    >
                      <CheckCircle2 size={12} />
                      <span>Approve & Resolve</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTicket(t);
                        setViewMode('split');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: '11px' }}
                      title="Inspect Details"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}

              {inProgressTickets.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No active investigations.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: AI Resolved */}
          <div className="kanban-col">
            <div className="kanban-col-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="glowing-dot online" />
                <span style={{ fontWeight: 700, fontSize: '13px' }}>AI Auto-Resolved</span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '10px' }}>
                {resolvedTickets.length}
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
              {resolvedTickets.map((t) => (
                <div
                  key={t.id}
                  className={`kanban-card ${selectedTicket?.id === t.id ? 'selected' : ''}`}
                  onClick={() => handleSelectTicket(t)}
                  style={{ opacity: 0.9 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      {t.id}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '9px', padding: '1px 6px' }}>
                      Resolved
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.4 }}>
                    {t.title}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{t.customer}</span>
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Zero SLA Breach</span>
                  </div>
                </div>
              ))}

              {resolvedTickets.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No resolved tickets yet today.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 2: SPLIT VIEW (List on Left + Detailed Inspector on Right)
          ==================================================================== */}
      {viewMode === 'split' && (
        <div style={{ flex: 1, display: 'flex', gap: '20px', minHeight: 0 }}>
          {/* Left Ticket Selector Column */}
          <div
            className="glass-card"
            style={{
              width: '400px',
              background: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px', borderBottom: '1px solid var(--border-subtle)', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Showing {filteredTickets.length} tickets
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredTickets.map((t) => {
                const isSelected = t.id === selectedTicket?.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface-elevated)',
                      border: isSelected ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {t.id}
                        </span>
                        <span className={`badge ${getPriorityBadgeClass(t.priority)}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                          {t.priority}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.createdAt}</span>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.4 }}>
                      {t.title}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>{t.customer}</span>
                      <span
                        style={{
                          color: t.status === 'Resolved' ? 'var(--accent-emerald)' : t.status === 'In Progress' ? 'var(--primary-400)' : 'var(--accent-amber)',
                          fontWeight: 600,
                        }}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detailed Inspector */}
          {selectedTicket ? (
            <div
              className="glass-card"
              style={{
                flex: 1,
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Inspector Top Bar */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: 'var(--primary-400)' }}>
                      {selectedTicket.id}
                    </span>
                    <span className={`badge ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                    <span className="badge badge-primary">{selectedTicket.category}</span>
                  </div>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedTicket.title}
                  </h2>
                </div>

                {/* Status Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status:</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                    className="select-input"
                    style={{ width: 'auto', padding: '6px 28px 6px 12px', fontSize: '12.5px', fontWeight: 600 }}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Inspector Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Customer Info Card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'var(--gradient-cyan-indigo)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    {selectedTicket.customer.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selectedTicket.customer}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {selectedTicket.email} • SLA: {selectedTicket.slaDue}
                    </div>
                  </div>

                  {/* Sentiment Bar Visualizer */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      Customer Sentiment
                    </div>
                    <div
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: selectedTicket.sentimentScore < 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                      }}
                    >
                      {selectedTicket.sentiment}
                    </div>
                  </div>
                </div>

                {/* Customer Incident Text */}
                <div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Client Inbound Statement
                  </div>
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-medium)',
                      fontSize: '13.5px',
                      lineHeight: 1.6,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {selectedTicket.messages?.[0]?.text || selectedTicket.title}
                  </div>
                </div>

                {/* AI Autonomous Triage Card */}
                {selectedTicket.aiTriage && (
                  <div
                    className="glass-card"
                    style={{
                      padding: '18px 20px',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(20, 29, 51, 0.7) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.35)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={16} color="var(--primary-400)" />
                        <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                          AI Autonomous Triage & Diagnostics
                        </span>
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                        {selectedTicket.aiTriage.confidence} Confidence
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Root Cause Hypothesis: </span>
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {selectedTicket.aiTriage.rootCauseHypothesis}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Recommended Runbook Action: </span>
                        <span style={{ color: 'var(--accent-cyan)' }}>
                          {selectedTicket.aiTriage.suggestedResolution}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Generated Resolution Reply Box */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} color="var(--primary-400)" />
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        AI Resolution Draft
                      </span>
                    </div>
                    <button
                      onClick={handleRegenerateDraft}
                      className="btn-ghost"
                      style={{ fontSize: '11.5px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      disabled={isGeneratingDraft}
                    >
                      <RefreshCw size={12} className={isGeneratingDraft ? 'spin' : ''} />
                      <span>Regenerate Draft</span>
                    </button>
                  </div>

                  <textarea
                    value={editableDraft}
                    onChange={(e) => setEditableDraft(e.target.value)}
                    rows={6}
                    className="textarea-input"
                    style={{
                      fontFamily: 'var(--font-main)',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      padding: '14px',
                    }}
                    placeholder="Draft resolution email response..."
                  />
                </div>
              </div>

              {/* Inspector Footer Actions */}
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <button
                  onClick={() => {
                    updateTicketStatus(selectedTicket.id, 'In Progress');
                    addToast('Ticket Escalated', 'Handed over to Senior Tier 3 Specialist.', 'info');
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '12.5px' }}
                >
                  Escalate to Tier 3
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleSendDraft}
                    className="btn btn-primary"
                    style={{ fontSize: '12.5px' }}
                  >
                    <Send size={14} />
                    <span>Approve & Dispatch AI Draft</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a ticket to inspect details.
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          VIEW 3: DATA TABLE VIEW
          ==================================================================== */}
      {viewMode === 'table' && (
        <div
          className="glass-card"
          style={{
            flex: 1,
            background: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 18px' }}>Ticket ID</th>
                  <th style={{ padding: '14px 18px' }}>Title & Description</th>
                  <th style={{ padding: '14px 18px' }}>Priority</th>
                  <th style={{ padding: '14px 18px' }}>Customer</th>
                  <th style={{ padding: '14px 18px' }}>Sentiment</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-400)' }}>
                      {t.id}
                    </td>
                    <td style={{ padding: '14px 18px', maxWidth: '380px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Category: {t.category}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className={`badge ${getPriorityBadgeClass(t.priority)}`} style={{ fontSize: '10px' }}>
                        {t.priority}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.customer}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.email}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: t.sentimentScore < 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                        {getSentimentEmoji(t.sentimentScore)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <select
                        value={t.status}
                        onChange={(e) => updateTicketStatus(t.id, e.target.value)}
                        className="select-input"
                        style={{ width: 'auto', padding: '4px 24px 4px 8px', fontSize: '11.5px' }}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          handleSelectTicket(t);
                          setViewMode('split');
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '5px 12px', fontSize: '11.5px' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Incident Ticket Modal */}
      {isCreatingModal && (
        <div className="modal-backdrop" onClick={() => setIsCreatingModal(false)}>
          <div
            className="glass-card animate-fade-scale"
            style={{
              width: '100%',
              maxWidth: '560px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              padding: '24px',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Log New Incident Ticket</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  AURA will immediately analyze sentiment & generate automated triage diagnostics.
                </p>
              </div>
              <button onClick={() => setIsCreatingModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Incident Title / Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory leak on GPU inference worker node #4"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-text"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Liam Roberts (HyperScale)"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    className="input-text"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Urgency Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="select-input"
                  >
                    <option value="Urgent">Urgent (P1 Critical)</option>
                    <option value="High">High (P2)</option>
                    <option value="Medium">Medium (P3)</option>
                    <option value="Low">Low (P4)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Problem Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide technical error traces, affected endpoints, or client context..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="textarea-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setIsCreatingModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Sparkles size={15} />
                  <span>Create & Auto-Triage</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
