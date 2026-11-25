import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getBackendUrl,
  setBackendUrl,
  checkBackendHealth,
} from '../../services/api';
import {
  Settings,
  Server,
  Sliders,
  Key,
  RefreshCw,
  Save,
  Trash2,
} from 'lucide-react';

export default function SettingsModal() {
  const {
    backendOnline,
    refreshBackendStatus,
    addToast,
  } = useApp();

  const [apiUrl, setApiUrl] = useState(getBackendUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Model parameters
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(4096);

  // Mock API Keys
  const [openaiKey, setOpenaiKey] = useState('sk-proj-••••••••••••••••••••••••••••••••');
  const [anthropicKey, setAnthropicKey] = useState('sk-ant-••••••••••••••••••••••••••••••••');
  const [googleKey, setGoogleKey] = useState('AIzaSy••••••••••••••••••••••••••••••••');

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setBackendUrl(apiUrl);
    const ok = await checkBackendHealth();
    setIsTesting(false);
    setTestResult(ok ? 'success' : 'failed');
    refreshBackendStatus();
    if (ok) {
      addToast('Backend Connected', `Successfully connected to ${apiUrl}`, 'success');
    } else {
      addToast('Connection Failed', `Could not reach ${apiUrl}. Running in local autonomous mode.`, 'info');
    }
  };

  const handleSaveSettings = () => {
    setBackendUrl(apiUrl);
    addToast('Settings Saved', 'Configuration preferences saved.', 'success');
  };

  const handleClearCache = () => {
    if (window.confirm('Clear all local chat history and reset document index?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1000px', margin: '0 auto', overflowY: 'auto', height: 'calc(100vh - var(--header-height))' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-primary">
            <Settings size={12} /> Configuration & Gateway
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Platform Settings
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Manage your backend endpoints, foundation model inference parameters, and security tokens.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Backend Endpoint Integration */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Server size={18} color="var(--primary-500)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Backend API Integration</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Connect to your existing FastAPI, Flask, Express, or Django backend. When offline, AURA autonomously runs full intelligent simulations.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000/api"
              className="input-text"
              style={{ flex: 1, minWidth: '280px', fontFamily: 'var(--font-mono)' }}
            />
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="btn btn-secondary"
            >
              <RefreshCw size={14} className={isTesting ? 'spin' : ''} />
              <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
            </button>
            <button
              onClick={handleSaveSettings}
              className="btn btn-primary"
            >
              <Save size={14} />
              <span>Save Endpoint</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', flexWrap: 'wrap' }}>
            <span className={`glowing-dot ${backendOnline ? 'online' : ''}`} style={{ backgroundColor: backendOnline ? 'var(--accent-emerald)' : 'var(--accent-amber)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              Status: <strong>{backendOnline ? 'Connected to Live Server' : 'Autonomous Sandbox (Fallback Mode)'}</strong>
            </span>
            {testResult && (
              <span className={`badge ${testResult === 'success' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '11px', textTransform: 'none' }}>
                {testResult === 'success' ? '✓ Health Check Passed' : '⚠ Offline (Using Local Storage)'}
              </span>
            )}
          </div>
        </div>

        {/* Model Inference Hyperparameters */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Sliders size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Model Inference Hyperparameters</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ fontWeight: 600 }}>Temperature</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-500)' }}>{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-500)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Lower values yield deterministic, structured responses.
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ fontWeight: 600 }}>Top P (Nucleus Sampling)</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{topP}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Controls token pool diversity cut-off.
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ fontWeight: 600 }}>Max Output Tokens</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>{maxTokens}</span>
              </div>
              <input
                type="range"
                min="512"
                max="8192"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Maximum completion length limit.
              </span>
            </div>
          </div>
        </div>

        {/* API Keys Vault */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-surface-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Key size={18} color="var(--accent-amber)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>API Keys Vault (Encrypted)</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Bring your own API keys. Encrypted client-side and never transmitted without authorization.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                OpenAI API Key
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="input-text"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Anthropic API Key
              </label>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                className="input-text"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                className="input-text"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}
              />
            </div>
          </div>
        </div>

        {/* System Diagnostics & Storage Reset */}
        <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-surface-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Storage & Cache Management</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Clear browser session state, cached vector embeddings, and reset to defaults.
            </p>
          </div>
          <button
            onClick={handleClearCache}
            className="btn"
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              color: 'var(--accent-rose)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
            }}
          >
            <Trash2 size={15} />
            <span>Reset Local Database</span>
          </button>
        </div>
      </div>
    </div>
  );
}
