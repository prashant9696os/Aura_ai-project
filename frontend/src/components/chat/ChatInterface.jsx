import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { generateAIResponse } from '../../services/api';
import ChatHistorySidebar from './ChatHistorySidebar';
import {
  Send,
  Sparkles,
  Paperclip,
  Bot,
  User,
  Copy,
  Check,
  RefreshCw,
  ThumbsUp,
  Download,
  Menu,
  Cpu,
  StopCircle,
  FileCheck,
  X,
} from 'lucide-react';

const MODELS = [
  { id: 'GPT-4o Omni', name: 'GPT-4o Omni', desc: 'Flagship multimodal reasoning', badge: 'Fastest' },
  { id: 'Claude 3.5 Sonnet', name: 'Claude 3.5 Sonnet', desc: 'Superior coding & nuanced logic', badge: 'Top Code' },
  { id: 'Gemini 1.5 Pro', name: 'Gemini 1.5 Pro', desc: '1M+ context window retrieval', badge: 'Long Context' },
  { id: 'DeepSeek R1', name: 'DeepSeek R1', desc: 'Deep mathematical & algorithmic chain', badge: 'Reasoning' },
];

const PERSONAS = [
  { id: 'Senior AI Architect', name: 'Senior AI Architect', desc: 'Designs high-scale distributed AI systems' },
  { id: 'Support Resolution Agent', name: 'Support Resolution Agent', desc: 'Specialist in customer SLA triage' },
  { id: 'Security & Compliance Auditor', name: 'Security & Compliance Auditor', desc: 'Zero-trust, SOC2 & privacy focus' },
  { id: 'Full-Stack Polyglot', name: 'Full-Stack Polyglot', desc: 'Clean React, Python, Node.js & SQL code' },
];

const generateMessageId = (prefix = 'msg') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
};

export default function ChatInterface() {
  const {
    activeChat,
    setChats,
    documents,
    uploadDocument,
    addToast,
  } = useApp();

  const [inputMessage, setInputMessage] = useState(() => {
    try {
      const pending = localStorage.getItem('aura_pending_prompt');
      if (pending) {
        localStorage.removeItem('aura_pending_prompt');
        return pending;
      }
    } catch {
      // Local storage fallback
    }
    return '';
  });
  const [selectedModel, setSelectedModel] = useState('GPT-4o Omni');
  const [selectedPersona, setSelectedPersona] = useState('Senior AI Architect');
  const [attachedDocs, setAttachedDocs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [historySidebarOpen, setHistorySidebarOpen] = useState(true);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  const abortStreamRef = useRef(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isStreaming]);

  // Handle Send Message
  const handleSendMessage = async (textToSend = inputMessage) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isStreaming || !activeChat) return;

    setInputMessage('');
    abortStreamRef.current = false;

    const userMsg = {
      id: generateMessageId('usr'),
      role: 'user',
      content: trimmed,
      timestamp: 'Just now',
      attachedDocs: [...attachedDocs],
    };

    // If chat title is still "New Conversation", auto-title from first message
    const updatedTitle =
      activeChat.title === 'New Conversation'
        ? trimmed.length > 32
          ? trimmed.slice(0, 32) + '...'
          : trimmed
        : activeChat.title;

    const currentMessages = [...(activeChat.messages || []), userMsg];

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? {
              ...c,
              title: updatedTitle,
              updatedAt: new Date().toISOString(),
              model: selectedModel,
              systemPersona: selectedPersona,
              messages: currentMessages,
            }
          : c
      )
    );

    // Prepare assistant message placeholder
    const assistantMsgId = generateMessageId('ast');
    const initialAssistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: 'Generating...',
      model: selectedModel,
      tokens: 0,
      latency: '~20ms',
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? { ...c, messages: [...currentMessages, initialAssistantMsg] }
          : c
      )
    );

    setIsStreaming(true);

    try {
      let fullContent = '';
      const selectedDocObjects = documents.filter((d) => attachedDocs.includes(d.id));

      await generateAIResponse(
        trimmed,
        selectedModel,
        selectedPersona,
        selectedDocObjects,
        (tokenChunk) => {
          if (abortStreamRef.current) return;
          fullContent = tokenChunk;
          setChats((prev) =>
            prev.map((c) =>
              c.id === activeChat.id
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMsgId ? { ...m, content: fullContent } : m
                    ),
                  }
                : c
            )
          );
        }
      );

      // Finalize message metrics
      const tokenEst = Math.max(120, Math.floor(fullContent.length / 4));
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChat.id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId
                    ? {
                        ...m,
                        content: fullContent,
                        timestamp: 'Just now',
                        tokens: tokenEst,
                        latency: `${Math.floor(Math.random() * 15 + 18)}ms`,
                      }
                    : m
                ),
              }
            : c
        )
      );
    } catch {
      addToast('Inference Error', 'Failed to generate response.', 'error');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleStopGeneration = () => {
    abortStreamRef.current = true;
    setIsStreaming(false);
    addToast('Generation Halted', 'Streaming output stopped.', 'info');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const doc = await uploadDocument(file);
      setAttachedDocs((prev) => [...prev, doc.id]);
    } catch {
      // Toast already handled in context
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleAttachDoc = (docId) => {
    setAttachedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const copyToClipboard = (text, id, isCode = false) => {
    navigator.clipboard.writeText(text);
    if (isCode) {
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } else {
      setCopiedMsgId(id);
      setTimeout(() => setCopiedMsgId(null), 2000);
      addToast('Copied', 'Message content copied to clipboard.', 'success', 2000);
    }
  };

  const exportMarkdown = () => {
    if (!activeChat) return;
    let md = `# Conversation: ${activeChat.title}\n*Model: ${selectedModel} | Date: ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    activeChat.messages.forEach((m) => {
      md += `### ${m.role === 'user' ? 'User' : 'AURA Assistant'}\n\n${m.content}\n\n---\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChat.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Exported Markdown', 'Chat conversation downloaded.', 'success');
  };

  const renderFormattedContent = (content, msgId) => {
    if (!content) return null;

    // Check for fenced code blocks
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'bash',
        code: match[2].trim(),
        id: `${msgId}-code-${blockIndex++}`,
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex),
      });
    }

    return parts.map((part, idx) => {
      if (part.type === 'code') {
        const isCopied = copiedCodeId === part.id;
        return (
          <div
            key={idx}
            style={{
              margin: '14px 0',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: '#040711',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.04)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                {part.language}
              </span>
              <button
                onClick={() => copyToClipboard(part.code, part.id, true)}
                className="btn-ghost"
                style={{
                  padding: '3px 8px',
                  fontSize: '11.5px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: isCopied ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                }}
              >
                {isCopied ? <Check size={12} /> : <Copy size={12} />}
                <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre
              style={{
                padding: '14px 16px',
                margin: 0,
                overflowX: 'auto',
                fontFamily: 'var(--font-mono)',
                fontSize: '12.5px',
                lineHeight: 1.6,
                color: '#e2e8f0',
              }}
            >
              <code>{part.code}</code>
            </pre>
          </div>
        );
      }

      // Render regular text with markdown styles
      return (
        <div key={idx} style={{ lineHeight: 1.7, fontSize: '14px', whiteSpace: 'pre-wrap' }}>
          {part.content}
        </div>
      );
    });
  };

  const starterPrompts = [
    {
      title: 'Analyze RAG Vector Recall',
      category: 'Vector Shards',
      icon: '⚡',
      prompt: 'What strategies maximize MRR (Mean Reciprocal Rank) when querying enterprise PDF embeddings?',
    },
    {
      title: 'Auto-Triage Customer Escalation',
      category: 'Autonomous Triage',
      icon: '🎯',
      prompt: 'Draft an automated P1 root cause analysis and resolution response for high latency issues.',
    },
    {
      title: 'Enterprise Security Checklist',
      category: 'Security & Compliance',
      icon: '🛡️',
      prompt: 'Synthesize the compliance guidelines from our indexed security documents for SOC2 Type II.',
    },
    {
      title: 'High-Concurrency React Architecture',
      category: 'Architecture Blueprint',
      icon: '💻',
      prompt: 'Show me an idiomatic React 19 pattern for non-blocking AI streaming with automatic retry.',
    },
  ];

  return (
    <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - var(--header-height))', overflow: 'hidden' }}>
      {/* Collapsible History Sidebar */}
      <ChatHistorySidebar
        isOpen={historySidebarOpen}
        onClose={() => setHistorySidebarOpen(false)}
      />

      {/* Main Chat Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-app)', position: 'relative' }}>
        {/* Top Chat Controls Bar */}
        <div
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!historySidebarOpen && (
              <button
                onClick={() => setHistorySidebarOpen(true)}
                className="btn-icon"
                title="Open Chat History"
              >
                <Menu size={18} />
              </button>
            )}

            {/* Model Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={15} color="var(--primary-500)" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="select-input"
                style={{ padding: '6px 28px 6px 10px', fontSize: '13px', width: 'auto', fontWeight: 600 }}
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* Persona Preset Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="var(--accent-cyan)" />
              <select
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value)}
                className="select-input"
                style={{ padding: '6px 28px 6px 10px', fontSize: '13px', width: 'auto' }}
              >
                {PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Knowledge Base attachment indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RAG Grounding:</span>
              <span className="badge badge-cyan" style={{ fontSize: '10px' }}>
                {attachedDocs.length > 0 ? `${attachedDocs.length} Docs Attached` : 'Global Knowledge'}
              </span>
            </div>

            <button
              onClick={exportMarkdown}
              className="btn btn-ghost"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="Download conversation as Markdown"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Messages Stream Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {(!activeChat?.messages || activeChat.messages.length === 0) ? (
            /* Empty State: Prompt Starter Gallery */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                maxWidth: '720px',
                margin: '0 auto',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <Sparkles size={32} color="#ffffff" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
                How can AURA assist your operations today?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '520px', marginBottom: '32px' }}>
                Engage in deep architectural reasoning, query your vectorized documents, or trigger autonomous customer ticket triage.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '14px',
                  width: '100%',
                }}
              >
                {starterPrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sp.prompt)}
                    className="glass-card-interactive"
                    style={{
                      padding: '16px 18px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="badge badge-primary" style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {sp.icon} {sp.category}
                        </span>
                        <Sparkles size={13} color="var(--primary-400)" />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {sp.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {sp.prompt}
                      </div>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--primary-400)', fontWeight: 600 }}>
                      Run prompt &rarr;
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Bubbles */
            activeChat.messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '880px',
                    width: '100%',
                    margin: '0 auto',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      flexDirection: isUser ? 'row-reverse' : 'row',
                      width: '100%',
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: isUser ? '50%' : '10px',
                        background: isUser ? 'var(--gradient-cyan-indigo)' : 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      {isUser ? <User size={18} color="#ffffff" /> : <Bot size={18} color="#ffffff" />}
                    </div>

                    {/* Message Bubble Body */}
                    <div style={{ maxWidth: '85%', minWidth: '180px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '6px',
                          flexDirection: isUser ? 'row-reverse' : 'row',
                        }}
                      >
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {isUser ? 'You' : 'AURA Assistant'}
                        </span>
                        {!isUser && msg.model && (
                          <span className="badge badge-primary" style={{ fontSize: '10px', padding: '1px 6px' }}>
                            {msg.model}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {msg.timestamp}
                        </span>
                      </div>

                      <div
                        className="glass-card"
                        style={{
                          padding: '16px 20px',
                          background: isUser ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-surface-elevated)',
                          border: isUser
                            ? '1px solid rgba(99, 102, 241, 0.4)'
                            : '1px solid var(--border-medium)',
                          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                          color: 'var(--text-primary)',
                          boxShadow: 'var(--shadow-md)',
                        }}
                      >
                        {renderFormattedContent(msg.content, msg.id)}
                      </div>

                      {/* Assistant Response Meta & Action Row */}
                      {!isUser && msg.content && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '8px',
                            padding: '0 4px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            {msg.tokens > 0 && <span>{msg.tokens} tokens</span>}
                            {msg.latency && <span>• {msg.latency}</span>}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              onClick={() => copyToClipboard(msg.content, msg.id, false)}
                              className="btn-icon"
                              style={{ padding: '4px' }}
                              title="Copy response"
                            >
                              {copiedMsgId === msg.id ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                            </button>
                            <button
                              onClick={() => {
                                addToast('Feedback Received', 'Thank you for rating this output!', 'success');
                              }}
                              className="btn-icon"
                              style={{ padding: '4px' }}
                              title="Thumbs up"
                            >
                              <ThumbsUp size={14} />
                            </button>
                            <button
                              onClick={() => {
                                handleSendMessage(activeChat.messages[activeChat.messages.length - 2]?.content || 'Explain further');
                              }}
                              className="btn-icon"
                              style={{ padding: '4px' }}
                              title="Regenerate response"
                            >
                              <RefreshCw size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div
          style={{
            padding: '16px 32px 24px',
            background: 'var(--bg-glass)',
            borderTop: '1px solid var(--border-subtle)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Attached Docs Chips row */}
            {attachedDocs.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Attached context:</span>
                {attachedDocs.map((docId) => {
                  const doc = documents.find((d) => d.id === docId);
                  if (!doc) return null;
                  return (
                    <div
                      key={docId}
                      className="badge badge-cyan"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', textTransform: 'none' }}
                    >
                      <FileCheck size={12} />
                      <span>{doc.name}</span>
                      <button
                        onClick={() => toggleAttachDoc(docId)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Prompt Suggestions Row */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
              {[
                { icon: '⚡', label: 'HNSW Latency Tuning', prompt: 'What strategies maximize MRR when querying enterprise PDF vector embeddings?' },
                { icon: '🎯', label: 'Triage P1 Incident', prompt: 'Draft an automated P1 root cause analysis and resolution response for high latency issues.' },
                { icon: '🛡️', label: 'SOC2 Security Audit', prompt: 'Synthesize compliance guidelines from our indexed security documents for SOC2 Type II.' },
                { icon: '💻', label: 'React 19 Streaming Pattern', prompt: 'Show me an idiomatic React 19 pattern for non-blocking AI streaming with automatic retry.' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="btn-icon-subtle"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '12px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '8px 12px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {/* File Attachment Hidden Input */}
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept=".pdf,.docx,.txt,.json,.csv"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-icon"
                title="Attach document to conversation"
                style={{ padding: '8px', color: attachedDocs.length > 0 ? 'var(--accent-cyan)' : 'inherit' }}
              >
                <Paperclip size={18} />
              </button>

              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask ${selectedModel} anything or instruct it to analyze documents...`}
                rows={1}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontFamily: 'var(--font-main)',
                  padding: '8px 4px',
                  maxHeight: '160px',
                  lineHeight: 1.5,
                }}
              />

              {isStreaming ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="btn"
                  style={{
                    background: 'var(--accent-rose)',
                    color: '#ffffff',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                  }}
                >
                  <StopCircle size={16} />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="btn btn-primary"
                  style={{
                    padding: '9px 16px',
                    opacity: inputMessage.trim() ? 1 : 0.5,
                    cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Send size={15} />
                  <span>Send</span>
                </button>
              )}
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', padding: '0 4px' }}>
              <span>Press <strong>Enter</strong> to send • <strong>Shift + Enter</strong> for newline</span>
              <span>Encrypted with AES-256 • SOC2 Type II Certified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
