import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Plus,
  RefreshCw,
  Server,
  Sparkles,
  AlertTriangle,
  FileCheck,
  FileUp,
} from 'lucide-react';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    backendOnline,
    isCheckingBackend,
    refreshBackendStatus,
    createNewChat,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifications = [
    {
      id: 1,
      icon: Sparkles,
      color: 'var(--primary-500)',
      title: 'HNSW Index Scaled',
      desc: 'Knowledge base vector shards rebalanced with 48ms latency.',
      time: '10m ago',
    },
    {
      id: 2,
      icon: AlertTriangle,
      color: 'var(--accent-amber)',
      title: 'P1 Ticket Triaged',
      desc: 'Automated resolution draft ready for review (TCK-8942).',
      time: '25m ago',
    },
    {
      id: 3,
      icon: FileCheck,
      color: 'var(--accent-emerald)',
      title: 'Document Vectorized',
      desc: 'Enterprise_Architecture_Overview.pdf indexed into 36 chunks.',
      time: '1h ago',
    },
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Executive Overview', subtitle: 'Platform Telemetry & Orchestration' };
      case 'chat':
        return { title: 'Neural Assistant', subtitle: 'Multi-Model Conversational Engine' };
      case 'documents':
        return { title: 'Knowledge Base & RAG', subtitle: 'Document Embeddings & Vector Storage' };
      case 'tickets':
        return { title: 'AI Ticket Intelligence', subtitle: 'Autonomous Customer Triage & Resolution' };
      case 'analytics':
        return { title: 'Observability & Metrics', subtitle: 'Token Spend, Latency & Model Trends' };
      case 'settings':
        return { title: 'System Configuration', subtitle: 'API Endpoints, Keys & Model Defaults' };
      default:
        return { title: 'Dashboard', subtitle: 'Enterprise Workspace' };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <header
      style={{
        height: 'var(--header-height)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'all var(--transition-normal)',
      }}
    >
      {/* Left: Breadcrumb / Section Header */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AURA Platform
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>/</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400 }}>
          {subtitle}
        </div>
      </div>

      {/* Right: Controls & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Backend Connectivity Status Pill */}
        <button
          onClick={refreshBackendStatus}
          title="Click to re-verify backend connectivity"
          className="badge"
          style={{
            background: backendOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
            color: backendOnline ? 'var(--accent-emerald)' : 'var(--primary-500)',
            border: `1px solid ${backendOnline ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.25)'}`,
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all var(--transition-fast)',
          }}
        >
          <span className={`glowing-dot ${backendOnline ? 'online pulse' : ''}`} style={{ backgroundColor: backendOnline ? 'var(--accent-emerald)' : '#818cf8' }} />
          <Server size={13} />
          <span style={{ fontSize: '11px', textTransform: 'none', fontWeight: 600 }}>
            {backendOnline ? 'Backend Online (Port 8001)' : 'Sandbox Mode (Autonomous)'}
          </span>
          <RefreshCw
            size={11}
            style={{
              animation: isCheckingBackend ? 'spin 1s linear infinite' : 'none',
              opacity: 0.7,
            }}
          />
        </button>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('documents')}
            className="btn btn-secondary"
            style={{ padding: '7px 12px', fontSize: '12px' }}
            title="Upload and vectorize documents"
          >
            <FileUp size={14} color="var(--accent-cyan)" />
            <span>Upload Doc</span>
          </button>

          <button
            onClick={() => createNewChat()}
            className="btn btn-primary"
            style={{ padding: '7px 14px', fontSize: '12px' }}
            title="Start new AI conversation"
          >
            <Plus size={14} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Notifications Icon & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) setUnreadCount(0);
            }}
            className="btn-icon"
            style={{ position: 'relative' }}
            title="System Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  background: 'var(--accent-rose)',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px var(--accent-rose)',
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              className="glass-card animate-fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '320px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-lg)',
                padding: '16px',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '13px' }}>Platform Activity</span>
                <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                  Live feed
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        gap: '10px',
                        padding: '8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <div
                        style={{
                          padding: '6px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 'fit-content',
                        }}
                      >
                        <Icon size={14} color={item.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {item.desc}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {item.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 10px 4px 6px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px',
              color: '#ffffff',
            }}
          >
            PJ
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Prashant J.
            </span>
            <span style={{ fontSize: '10px', color: 'var(--primary-500)', fontWeight: 600 }}>
              Enterprise Plus
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
