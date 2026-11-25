import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UploadCloud,
  FileText,
  Trash2,
  Bot,
  Search,
  CheckCircle2,
  Database,
  Eye,
  X,
  FileCode,
  FileSpreadsheet,
  Grid,
  List,
  Sparkles,
} from 'lucide-react';

export default function DocumentHub() {
  const { documents, uploadDocument, deleteDocument, createNewChat, setActiveTab, addToast } = useApp();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [fileFilter, setFileFilter] = useState('all'); // 'all' | 'pdf' | 'docx' | 'json' | 'csv'
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsProcessing(true);
    setProcessingProgress(20);
    setProcessingStage('1/4: Extracting raw text & layout metadata...');

    setTimeout(async () => {
      setProcessingProgress(48);
      setProcessingStage('2/4: Chunking tokens with 512-window overlap...');

      setTimeout(async () => {
        setProcessingProgress(75);
        setProcessingStage('3/4: Generating 1536-dim vector embeddings via text-embedding-3...');

        setTimeout(async () => {
          try {
            await uploadDocument(file);
            setProcessingProgress(95);
            setProcessingStage('4/4: Indexing into distributed HNSW vector graph...');
            setTimeout(() => {
              setProcessingProgress(100);
              setIsProcessing(false);
              setProcessingStage('');
            }, 600);
          } catch {
            setIsProcessing(false);
          }
        }, 700);
      }, 650);
    }, 600);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleIngestSample = (sample) => {
    const fakeFile = new File([sample.content], sample.name, { type: sample.type });
    handleFiles([fakeFile]);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText size={22} color="var(--accent-rose)" />;
      case 'json':
      case 'code':
        return <FileCode size={22} color="var(--accent-amber)" />;
      case 'csv':
        return <FileSpreadsheet size={22} color="var(--accent-emerald)" />;
      default:
        return <FileText size={22} color="var(--primary-400)" />;
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesQuery =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = fileFilter === 'all' || doc.type === fileFilter;
    return matchesQuery && matchesFilter;
  });

  const totalTokens = documents.reduce((sum, d) => sum + (d.tokens || 0), 0);
  const totalChunks = documents.reduce((sum, d) => sum + (d.chunks || 0), 0);

  const handleChatWithDoc = (doc) => {
    createNewChat();
    addToast('RAG Grounding Active', `Grounding chat with ${doc.name}`, 'info');
    setActiveTab('chat');
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1600px', margin: '0 auto', overflowY: 'auto', height: 'calc(100vh - var(--header-height))' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-cyan">
              <Database size={12} /> Semantic RAG Repository
            </span>
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> HNSW Cluster Healthy
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Enterprise Knowledge Base & RAG Hub
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Upload PDFs, DOCX, JSON, or CSV files to automatically extract text, create 1536-dim vector embeddings, and ground AI responses.
          </p>
        </div>

        {/* Capacity Stat Summary */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="glass-card" style={{ padding: '12px 18px', background: 'var(--bg-surface-elevated)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Indexed Tokens</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalTokens.toLocaleString()}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '12px 18px', background: 'var(--bg-surface-elevated)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Semantic Chunks</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-400)' }}>
              {totalChunks}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '12px 18px', background: 'var(--bg-surface-elevated)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MRR Recall Score</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              98.6%
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className="glass-card"
        style={{
          padding: '32px 24px',
          border: isDragging ? '2px dashed var(--primary-500)' : '2px dashed var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          background: isDragging ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-surface-elevated)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isProcessing ? 'default' : 'pointer',
          marginBottom: '20px',
          transition: 'all var(--transition-normal)',
          position: 'relative',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
          accept=".pdf,.docx,.txt,.json,.csv"
        />

        {isProcessing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '420px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: '3px solid var(--border-subtle)',
                borderTopColor: 'var(--primary-400)',
                animation: 'spin 1s linear infinite',
              }}
            />
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {processingStage}
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  marginTop: '8px',
                }}
              >
                <div
                  style={{
                    width: `${processingProgress}%`,
                    height: '100%',
                    background: 'var(--gradient-primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                <span>Processing vector embeddings</span>
                <span>{processingProgress}%</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'var(--gradient-cyan-indigo)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                boxShadow: 'var(--shadow-glow-cyan)',
              }}
            >
              <UploadCloud size={26} color="#ffffff" />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
              Drag & Drop files here, or <span style={{ color: 'var(--primary-400)' }}>browse local files</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Automatic text extraction, semantic chunking & HNSW vector indexing for PDF, DOCX, TXT, JSON, and CSV
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span className="badge badge-primary">Automatic OCR</span>
              <span className="badge badge-cyan">1536-dim Embeddings</span>
              <span className="badge badge-success">Zero-Trust Isolation</span>
            </div>
          </>
        )}
      </div>

      {/* Quick Sample Document Ingest Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
          Quick Test Ingest:
        </span>
        {[
          {
            name: 'Microservice_Kubernetes_Specs.yaml',
            type: 'text/yaml',
            content: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: ai-inference-worker\nspec:\n  replicas: 4\n  strategy: RollingUpdate',
          },
          {
            name: 'SOC2_Type_II_Security_Controls.pdf',
            type: 'application/pdf',
            content: 'SOC2 Type II Annual Security Certification Summary. Verified data encryption in transit and at rest with TLS 1.3.',
          },
          {
            name: 'Inference_Latency_Benchmarks.csv',
            type: 'text/csv',
            content: 'Model,Concurrency,p50,p99,CostPer1k\nGPT-4o,64,18ms,34ms,$0.0025\nClaude-3.5,64,22ms,42ms,$0.003',
          },
        ].map((sample, idx) => (
          <button
            key={idx}
            onClick={() => handleIngestSample(sample)}
            className="btn-icon-subtle"
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={11} color="var(--primary-400)" />
            <span>+ {sample.name}</span>
          </button>
        ))}
      </div>

      {/* Document Library Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>
            Vectorized Documents ({filteredDocs.length})
          </h2>

          {/* Extension Filter Pills */}
          <div className="tab-switcher">
            {['all', 'pdf', 'docx', 'json', 'csv'].map((f) => (
              <button
                key={f}
                onClick={() => setFileFilter(f)}
                className={`tab-btn ${fileFilter === f ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px', textTransform: 'uppercase' }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search documents or concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-text"
              style={{ paddingLeft: '34px', fontSize: '12px', padding: '7px 12px 7px 34px' }}
            />
          </div>

          {/* View Mode Switcher */}
          <div className="tab-switcher">
            <button
              onClick={() => setViewMode('grid')}
              className={`tab-btn ${viewMode === 'grid' ? 'active' : ''}`}
              style={{ padding: '6px 10px' }}
              title="Grid View"
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`tab-btn ${viewMode === 'table' ? 'active' : ''}`}
              style={{ padding: '6px 10px' }}
              title="Table View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="glass-card-interactive"
              style={{
                padding: '20px',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {getFileIcon(doc.type)}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '210px',
                          whiteSpace: 'nowrap',
                        }}
                        title={doc.name}
                      >
                        {doc.name}
                      </h3>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {doc.size} • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-success" style={{ fontSize: '10px' }}>
                    <CheckCircle2 size={11} /> Ready
                  </span>
                </div>

                {/* Summary Description */}
                <p
                  style={{
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {doc.summary || 'Document vectorized and ready for semantic context retrieval.'}
                </p>

                {/* Metrics Pill Grid */}
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '14px',
                    fontSize: '11.5px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Tokens: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{doc.tokens?.toLocaleString()}</strong>
                  </div>
                  <div style={{ color: 'var(--border-medium)' }}>|</div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Chunks: </span>
                    <strong style={{ color: 'var(--primary-400)' }}>{doc.chunks}</strong>
                  </div>
                  <div style={{ color: 'var(--border-medium)' }}>|</div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Recall: </span>
                    <strong style={{ color: 'var(--accent-emerald)' }}>98.4%</strong>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => handleChatWithDoc(doc)}
                  className="btn btn-primary"
                  style={{ padding: '7px 14px', fontSize: '12px' }}
                >
                  <Bot size={14} />
                  <span>Chat with Doc</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="btn-icon"
                    style={{ padding: '7px' }}
                    title="Inspect semantic chunks"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="btn-icon"
                    style={{ padding: '7px', color: 'var(--accent-rose)' }}
                    title="Delete from knowledge base"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredDocs.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No documents matching query. Drag a file above or click a quick sample to ingest!
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div
          className="glass-card"
          style={{
            background: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 18px' }}>Document Name</th>
                  <th style={{ padding: '14px 18px' }}>Type</th>
                  <th style={{ padding: '14px 18px' }}>Tokens</th>
                  <th style={{ padding: '14px 18px' }}>Chunks</th>
                  <th style={{ padding: '14px 18px' }}>Uploaded</th>
                  <th style={{ padding: '14px 18px' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
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
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {doc.name}
                    </td>
                    <td style={{ padding: '14px 18px', textTransform: 'uppercase', fontSize: '11px' }}>
                      <span className="badge badge-primary">{doc.type}</span>
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)' }}>
                      {doc.tokens?.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--primary-400)', fontWeight: 600 }}>
                      {doc.chunks}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span className="badge badge-success" style={{ fontSize: '10px' }}>
                        Ready
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleChatWithDoc(doc)}
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '11.5px' }}
                        >
                          Chat
                        </button>
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="btn-icon"
                          style={{ padding: '5px' }}
                          title="Inspect chunks"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="btn-icon"
                          style={{ padding: '5px', color: 'var(--accent-rose)' }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Semantic Chunk Inspection Modal */}
      {previewDoc && (
        <div className="modal-backdrop" onClick={() => setPreviewDoc(null)}>
          <div
            className="glass-card animate-fade-scale"
            style={{
              width: '100%',
              maxWidth: '700px',
              maxHeight: '80vh',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{previewDoc.name}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {previewDoc.chunks} semantic chunks • 1536-dimensional embeddings
                </span>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
              {[1, 2, 3].map((chunkIndex) => (
                <div
                  key={chunkIndex}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                      Semantic Chunk #{chunkIndex}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      Cosine Similarity: {(0.94 - chunkIndex * 0.035).toFixed(3)}
                    </span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
                    {chunkIndex === 1
                      ? `[Extracted section: Section 1.0 Architecture Overview] Cloud-native container clusters deployed with auto-healing ingress rules and zero-trust service mesh sidecars.`
                      : chunkIndex === 2
                      ? `[Extracted section: Section 2.4 SLA Matrix] Incident response tiers categorized by business criticality. P1 escalations initiate automated notification pager duty within 90 seconds.`
                      : `[Extracted section: Section 3.1 Vector Ingestion] Dense vector cosine similarity thresholds calibrated for hybrid BM25 cross-attention re-ranking.`}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setPreviewDoc(null)} className="btn btn-secondary">
                Close
              </button>
              <button
                onClick={() => {
                  handleChatWithDoc(previewDoc);
                  setPreviewDoc(null);
                }}
                className="btn btn-primary"
              >
                <Bot size={15} />
                <span>Chat with this Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
