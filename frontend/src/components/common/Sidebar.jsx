import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Bot,
  FileText,
  LifeBuoy,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Database,
} from 'lucide-react';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    theme,
    toggleTheme,
    tickets,
    documents,
  } = useApp();

  const openTicketsCount = tickets.filter((t) => t.status !== 'Resolved').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Assistant', icon: Bot, badge: 'Pro' },
    { id: 'documents', label: 'Knowledge Base', icon: FileText, count: documents.length },
    { id: 'tickets', label: 'AI Tickets', icon: LifeBuoy, count: openTicketsCount, alert: openTicketsCount > 0 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: sidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
        height: '100vh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width var(--transition-smooth)',
        position: 'relative',
        zIndex: 50,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Top: Logo & Platform Identity */}
      <div>
        <div
          style={{
            height: 'var(--header-height)',
            padding: sidebarCollapsed ? '0 16px' : '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {!sidebarCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <Sparkles size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                    AURA
                  </span>
                  <span className="badge badge-primary" style={{ padding: '2px 6px', fontSize: '10px' }}>
                    AI
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
                  ENTERPRISE PLATFORM
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <Sparkles size={20} color="#ffffff" />
            </div>
          )}

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              position: 'absolute',
              right: '-12px',
              top: '24px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              zIndex: 60,
              transition: 'all var(--transition-fast)',
            }}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: sidebarCollapsed ? '16px 8px' : '20px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                  width: '100%',
                  padding: sidebarCollapsed ? '12px 0' : '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive
                    ? 'rgba(99, 102, 241, 0.12)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(99, 102, 241, 0.3)'
                    : '1px solid transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  outline: 'none',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon
                    size={19}
                    color={isActive ? 'var(--primary-500)' : 'currentColor'}
                    style={{ flexShrink: 0 }}
                  />
                  {!sidebarCollapsed && (
                    <span style={{ fontSize: '13.5px', fontWeight: isActive ? 600 : 500 }}>
                      {item.label}
                    </span>
                  )}
                </div>

                {!sidebarCollapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.badge && (
                      <span className="badge badge-cyan" style={{ fontSize: '10px', padding: '1px 6px' }}>
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && (
                      <span
                        className="badge"
                        style={{
                          fontSize: '11px',
                          padding: '1px 7px',
                          background: item.alert ? 'rgba(244, 63, 94, 0.18)' : 'rgba(255, 255, 255, 0.08)',
                          color: item.alert ? 'var(--accent-rose)' : 'var(--text-muted)',
                          border: item.alert ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-subtle)',
                        }}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Vector Capacity & Theme Switcher */}
      <div style={{ padding: sidebarCollapsed ? '16px 8px' : '18px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        {!sidebarCollapsed && (
          <div
            className="glass-card"
            style={{
              padding: '12px 14px',
              marginBottom: '14px',
              background: 'var(--bg-surface-elevated)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={13} color="var(--accent-cyan)" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Vector Cluster
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                68% Used
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '5px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '68%',
                  height: '100%',
                  background: 'var(--gradient-cyan-indigo)',
                  borderRadius: 'var(--radius-full)',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>1.36M / 2.0M tokens</span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>Healthy</span>
            </div>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            width: '100%',
            padding: sidebarCollapsed ? '10px 0' : '9px 12px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {theme === 'dark' ? (
              <Sun size={16} color="var(--accent-amber)" />
            ) : (
              <Moon size={16} color="var(--primary-500)" />
            )}
            {!sidebarCollapsed && (
              <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </div>
          {!sidebarCollapsed && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {theme === 'dark' ? 'Switch' : 'Switch'}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
