import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        maxWidth: '380px',
        width: '100%',
      }}
    >
      {toasts.map((toast) => {
        let Icon = Info;
        let borderColor = 'var(--primary-500)';
        let iconColor = 'var(--primary-500)';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderColor = 'var(--accent-emerald)';
          iconColor = 'var(--accent-emerald)';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderColor = 'var(--accent-rose)';
          iconColor = 'var(--accent-rose)';
        }

        return (
          <div
            key={toast.id}
            className="glass-card animate-fade-in"
            style={{
              pointerEvents: 'auto',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              borderLeft: `4px solid ${borderColor}`,
              boxShadow: 'var(--shadow-lg)',
              background: 'var(--bg-surface-elevated)',
            }}
          >
            <Icon size={20} color={iconColor} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                {toast.title}
              </div>
              {toast.message && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
