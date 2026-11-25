
/**
 * AURA AI - Enterprise API & Integration Service
 * Supports live backend connectivity with automatic resilient mock fallback.
 */

const STORAGE_KEYS = {
  BACKEND_URL: 'aura_backend_url',
  CHATS: 'aura_chats_history',
  DOCUMENTS: 'aura_documents',
  TICKETS: 'aura_tickets',
  SETTINGS: 'aura_settings',
};

// Default Backend URL
export const getBackendUrl = () => {
  return 'http://127.0.0.1:8000/api';
};

export const setBackendUrl = (url) => {
  localStorage.setItem(STORAGE_KEYS.BACKEND_URL, url);
};

// Check backend status
export const checkBackendHealth = async () => {
  const url = getBackendUrl();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${url}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
};

// Initial Mock Datasets
const DEFAULT_DOCUMENTS = [
  {
    id: 'doc-1',
    name: 'Enterprise_Architecture_Overview.pdf',
    size: '2.4 MB',
    type: 'pdf',
    tokens: 18450,
    chunks: 36,
    uploadedAt: '2026-10-12T14:30:00Z',
    status: 'indexed',
    summary: 'Cloud-native microservices architecture, Kubernetes ingress policies, and zero-trust identity verification.',
  },
  {
    id: 'doc-2',
    name: 'Q3_Customer_Support_SLA_Guidelines.docx',
    size: '1.1 MB',
    type: 'docx',
    tokens: 8320,
    chunks: 17,
    uploadedAt: '2026-10-11T09:15:00Z',
    status: 'indexed',
    summary: 'Response time tiers: Tier 1 (15m), Tier 2 (1h), escalation protocols and refund threshold matrices.',
  },
  {
    id: 'doc-3',
    name: 'LLM_FineTuning_Security_Checklist.json',
    size: '420 KB',
    type: 'json',
    tokens: 4120,
    chunks: 8,
    uploadedAt: '2026-10-10T18:40:00Z',
    status: 'indexed',
    summary: 'Data anonymization pipelines, differential privacy parameters, and automated PII scrubbing protocols.',
  },
];

const DEFAULT_TICKETS = [
  {
    id: 'TCK-8942',
    title: 'High latency spikes on Vector Search API cluster in us-east-1',
    customer: 'Sarah Jenkins (Apex FinTech)',
    email: 'sarah.j@apexfin.io',
    priority: 'Urgent',
    status: 'In Progress',
    category: 'Infrastructure',
    sentiment: 'Frustrated (-0.72)',
    sentimentScore: -0.72,
    createdAt: '12 mins ago',
    slaDue: '18 mins remaining',
    messages: [
      { sender: 'customer', text: 'Our production embedding queries are taking >1400ms instead of the usual 80ms. Multiple user timeouts triggered.' },
    ],
    aiTriage: {
      urgency: 'P1 Critical',
      rootCauseHypothesis: 'Likely HNSW index memory fragmentation or replica throttling during node rebalance.',
      confidence: '96%',
      suggestedResolution: 'Scale read replicas to 4 pods, verify PVC IOPS threshold, and recycle pod-vector-worker-03.',
      suggestedDraft: `Hi Sarah,

Our automated telemetry detected the query latency anomaly on the us-east-1 vector shard. We have already provisioned additional read replica nodes and cleared the pending HNSW cache lock.

Latency has normalized back to 42ms. We are monitoring for the next 30 minutes to confirm total stability.

Best regards,
AURA Enterprise Support Team`,
    },
  },
  {
    id: 'TCK-8941',
    title: 'Request for custom SSO SAML 2.0 configuration with Okta',
    customer: 'David Chen (OmniCorp)',
    email: 'dchen@omnicorp.org',
    priority: 'Medium',
    status: 'Open',
    category: 'Authentication',
    sentiment: 'Neutral (+0.12)',
    sentimentScore: 0.12,
    createdAt: '45 mins ago',
    slaDue: '3 hours remaining',
    messages: [
      { sender: 'customer', text: 'We are rolling out Okta enterprise-wide and need the ACS URL and Entity ID for our tenant domain.' },
    ],
    aiTriage: {
      urgency: 'P3 Standard',
      rootCauseHypothesis: 'Routine enterprise tenant SSO integration request.',
      confidence: '99%',
      suggestedResolution: 'Provide tenant ACS endpoint and SAML metadata descriptor link from organization settings.',
      suggestedDraft: `Hello David,

Thank you for reaching out. Here are your dedicated Okta SAML 2.0 configuration attributes:
- Single Sign-On ACS URL: https://auth.aura-ai.io/saml/sso/omnicorp
- Audience URI (Entity ID): urn:aura-ai:saml:omnicorp
- Name ID Format: EmailAddress

Let us know if you need assistance testing assertion claims.

Warm regards,
AURA Support`,
    },
  },
  {
    id: 'TCK-8939',
    title: 'Billing invoice discrepancy for September GPU inference tokens',
    customer: 'Elena Rostova (NeuralLab Inc)',
    email: 'elena@neurallab.ai',
    priority: 'High',
    status: 'Resolved',
    category: 'Billing',
    sentiment: 'Concerned (-0.38)',
    sentimentScore: -0.38,
    createdAt: '2 hours ago',
    slaDue: 'Resolved within SLA',
    messages: [
      { sender: 'customer', text: 'The token breakdown shows 1.2M DeepSeek tokens charged at GPT-4o tier.' },
    ],
    aiTriage: {
      urgency: 'P2 High',
      rootCauseHypothesis: 'Billing tier mapping config tag was outdated during September 28 release.',
      confidence: '98%',
      suggestedResolution: 'Issue an automated credit memo of $184.50 and update billing meter tags.',
      suggestedDraft: `Hi Elena,

We investigated your September invoice. You are completely right—the system applied the default rate prior to model classification update. We have applied a $184.50 credit to your billing ledger and updated your current statement.

Thank you for catching this!

Best regards,
AURA Finance & Support`,
    },
  },
  {
    id: 'TCK-8935',
    title: 'Clarification on RAG context window limits for Claude 3.5',
    customer: 'Marcus Vance (Datacore)',
    email: 'm.vance@datacore.io',
    priority: 'Low',
    status: 'Open',
    category: 'Documentation',
    sentiment: 'Positive (+0.65)',
    sentimentScore: 0.65,
    createdAt: '4 hours ago',
    slaDue: '5 hours remaining',
    messages: [
      { sender: 'customer', text: 'Does the document upload chunking preserve tables in 200k context window mode?' },
    ],
    aiTriage: {
      urgency: 'P4 Low',
      rootCauseHypothesis: 'Inquiry regarding markdown table parsing and context preservation.',
      confidence: '97%',
      suggestedResolution: 'Explain markdown table parsing parser and hybrid dense-sparse retrieval setting.',
      suggestedDraft: `Hello Marcus,

Yes! When Claude 3.5 Sonnet is selected, documents containing markdown or HTML tables are parsed using our structured tabular extractor, ensuring column-row relationships remain intact across chunks.

Feel free to upload test datasets to verify.

Best regards,
AURA Support`,
    },
  },
];

// LocalStorage helpers
export const loadLocalData = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const saveLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save data to localStorage:', err);
  }
};

// Enterprise AI response generator with live SSE streaming and resilient fallback
export const generateAIResponse = async (userPrompt, model, systemPersona, documents, onStreamToken) => {
  const isOnline = await checkBackendHealth();

  if (isOnline) {
    // 1. Try real-time Server-Sent Events (SSE) streaming from FastAPI
    try {
      const res = await fetch(`${getBackendUrl()}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          model,
          systemPersona,
          documents: documents?.map((d) => d.id) || [],
        }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith('data: ')) {
              const payload = trimmed.slice(6);

              if (payload === '[DONE]') break;

              try {
                const parsed = JSON.parse(payload);

                if (parsed.token) {
                  accumulated += parsed.token;

                  if (onStreamToken) {
                    onStreamToken(accumulated);
                  }
                }
              } catch {
                // Ignore partial JSON chunks
              }
            }
          }
        }

        if (accumulated.trim().length > 0) {
          return accumulated;
        }
      }
    } catch (e) {
      console.warn('Backend SSE streaming failed, falling back to standard endpoint:', e);
    }

    // 2. Fallback to standard synchronous /chat endpoint
    try {
      const res = await fetch(`${getBackendUrl()}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          model,
          systemPersona,
          documents: documents?.map((d) => d.id) || [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.response || '';

        if (onStreamToken) {
          onStreamToken(content);
        }

        return content;
      }
    } catch (e) {
      console.warn('Backend call failed, falling back to local simulation:', e);
    }
  }

  // Realistic Enterprise AI Simulation
  let simulatedText = '';
  const promptLower = userPrompt.toLowerCase();

  if (promptLower.includes('ticket') || promptLower.includes('triage') || promptLower.includes('support')) {
    simulatedText = `### 🎫 AI Support & Ticket Intelligence Analysis

Based on real-time telemetry and your attached document guidelines, here is the automated triage assessment:

1. **Urgency Classification**: **P1 Critical Priority**
   - **Target SLA**: Under 15 Minutes
   - **Root Cause**: Memory fragmentation detected in the vector index shards during high-throughput embeddings.

2. **Recommended Action Plan**:
\`\`\`bash
# Run auto-scaling and cluster cache invalidation
kubectl scale statefulset aura-vector-worker --replicas=6 -n prod
aura-cli cache invalidate --cluster=us-east-1 --pattern="embed:*"
\`\`\`

3. **Customer Resolution Draft**:
> *"We have investigated the latency anomaly and deployed additional dedicated replica nodes. Response latency is now healthy at 38ms."*

Would you like me to dispatch this resolution and close the SLA timer?`;
  } else if (promptLower.includes('document') || promptLower.includes('pdf') || promptLower.includes('rag') || promptLower.includes('upload')) {
    simulatedText = `### 📚 Knowledge Base & Semantic Vector Analysis

I examined your active indexed documents:
- **Enterprise Architecture Overview** (36 chunks, 18.4k tokens)
- **Q3 Customer Support SLA Guidelines** (17 chunks, 8.3k tokens)
- **LLM Fine-Tuning Security Checklist** (8 chunks, 4.1k tokens)

**Key Synthesized Insights**:
- **Zero-Trust Boundary**: All document embeddings are encrypted at rest with AES-256-GCM.
- **Retrieval Precision**: Hybrid dense vector (Cosine Similarity > 0.88) combined with BM25 lexical keyword matching is currently yielding an **MRR score of 0.94**.

You can upload additional documents directly from the **Knowledge Base** tab to expand our ground-truth repository.`;
  } else if (promptLower.includes('architecture') || promptLower.includes('code') || promptLower.includes('react') || promptLower.includes('api')) {
    simulatedText = `### ⚡ Enterprise AI Microservices Architecture

Here is the production architecture blueprint for high-throughput AI inference:

\`\`\`tsx
import React, { useState, useEffect } from 'react';

// Resilient Stream Consumer with Auto-Reconnect
export function useAIStream(endpoint: string) {
  const [tokens, setTokens] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const triggerStream = async (payload: { prompt: string; model: string }) => {
    setIsStreaming(true);
    setTokens('');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      setTokens((prev) => prev + decoder.decode(value));
    }

    setIsStreaming(false);
  };

  return { tokens, isStreaming, triggerStream };
}
\`\`\`

**Key Architectural Benefits**:
- **Non-blocking streaming**: Zero buffer bloat with native ReadableStream.
- **Token Efficiency**: Pre-computed system prompts minimize redundant inference spend by **34%**.`;
  } else {
    simulatedText = `### 🌟 AURA Enterprise AI Response

I have processed your query using **${model}** under the **${systemPersona || 'Senior AI Architect'}** persona.

**Executive Summary**:
Your request has been analyzed against the enterprise knowledge graph. Here are the core strategic points:

- **Optimization Vectors**: Streamlined multi-tier execution pipeline with instant fallback failovers.
- **Security & Governance**: Fully compliant with SOC2 Type II, HIPAA, and GDPR data isolation boundaries.
- **Latency Benchmark**: Time-to-first-token recorded at **~14ms** across distributed edge gateways.

Feel free to ask follow-up questions, upload supplementary documents, or trigger automated ticket triage!`;
  }

  // Stream output token by token for authentic AI SaaS feel
  const words = simulatedText.split(' ');
  let accumulated = '';

  for (let i = 0; i < words.length; i++) {
    accumulated += (i === 0 ? '' : ' ') + words[i];

    if (onStreamToken) {
      onStreamToken(accumulated);
    }

    await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 18) + 12));
  }

  return simulatedText;
};

// Document Management Services
export const documentService = {
  getDocuments: () => loadLocalData(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS),

  fetchDocumentsFromBackend: async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/documents`);

      if (res.ok) {
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          documentService.saveDocuments(data);
          return data;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch documents from backend:', e);
    }

    return documentService.getDocuments();
  },

  saveDocuments: (docs) => saveLocalData(STORAGE_KEYS.DOCUMENTS, docs),

  uploadDocument: async (file) => {
    const isOnline = await checkBackendHealth();

    if (isOnline) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(`${getBackendUrl()}/documents/upload`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const doc = await res.json();
          const currentDocs = documentService.getDocuments();
          const updated = [doc, ...currentDocs.filter((d) => d.id !== doc.id)];
          documentService.saveDocuments(updated);
          return doc;
        }
      } catch (err) {
        console.warn('Backend upload failed, saving to local store:', err);
      }
    }

    // Local simulated document indexing
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const estimatedTokens = Math.max(350, Math.floor(file.size / 3.8));
    const estimatedChunks = Math.max(1, Math.ceil(estimatedTokens / 512));
    const extension = file.name.split('.').pop().toLowerCase();

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: file.name,
      size: `${sizeInMB > 0 ? sizeInMB : (file.size / 1024).toFixed(0)} ${sizeInMB > 0 ? 'MB' : 'KB'}`,
      type: extension,
      tokens: estimatedTokens,
      chunks: estimatedChunks,
      uploadedAt: new Date().toISOString(),
      status: 'indexed',
      summary: `Automated semantic index generated for ${file.name}. Parsed ${estimatedChunks} vector embeddings ready for RAG grounding.`,
    };

    const currentDocs = documentService.getDocuments();
    const updated = [newDoc, ...currentDocs];
    documentService.saveDocuments(updated);
    return newDoc;
  },

  deleteDocument: async (id) => {
    const isOnline = await checkBackendHealth();

    if (isOnline) {
      try {
        await fetch(`${getBackendUrl()}/documents/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Backend delete document failed:', err);
      }
    }

    const current = documentService.getDocuments();
    const filtered = current.filter((d) => d.id !== id);
    documentService.saveDocuments(filtered);
    return filtered;
  },
};

// Ticket Management Services
export const ticketService = {
  getTickets: () => loadLocalData(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS),

  fetchTicketsFromBackend: async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/tickets`);

      if (res.ok) {
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          ticketService.saveTickets(data);
          return data;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch tickets from backend:', e);
    }

    return ticketService.getTickets();
  },

  saveTickets: (tickets) => saveLocalData(STORAGE_KEYS.TICKETS, tickets),

  updateTicketStatus: async (id, newStatus) => {
    const tickets = ticketService.getTickets();
    const updated = tickets.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    ticketService.saveTickets(updated);

    try {
      await fetch(`${getBackendUrl()}/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.warn('Backend ticket update status failed:', e);
    }

    return updated;
  },

  createTicket: async (ticketData) => {
    const isOnline = await checkBackendHealth();

    if (isOnline) {
      try {
        const res = await fetch(`${getBackendUrl()}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticketData),
        });

        if (res.ok) {
          const newTicket = await res.json();
          const tickets = ticketService.getTickets();
          const updated = [newTicket, ...tickets.filter((t) => t.id !== newTicket.id)];
          ticketService.saveTickets(updated);
          return newTicket;
        }
      } catch (err) {
        console.warn('Backend create ticket failed:', err);
      }
    }

    const tickets = ticketService.getTickets();

    const newTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: 'Just now',
      status: 'Open',
      sentiment: 'Neutral (+0.05)',
      sentimentScore: 0.05,
      slaDue: '4 hours remaining',
      messages: [{ sender: 'customer', text: ticketData.description || ticketData.title }],
      aiTriage: {
        urgency: ticketData.priority === 'Urgent' ? 'P1 Critical' : 'P3 Standard',
        rootCauseHypothesis: 'Auto-triaged customer request.',
        confidence: '95%',
        suggestedResolution: 'Analyze issue details and trigger automated workflow response.',
        suggestedDraft: `Hello ${ticketData.customer || 'there'},

We have received your request regarding "${ticketData.title}". Our engineering team is currently investigating and will update you shortly.

Best regards,
AURA AI Support`,
      },
      ...ticketData,
    };

    const updated = [newTicket, ...tickets];
    ticketService.saveTickets(updated);
    return newTicket;
  },
};

// Analytics Service
export const analyticsService = {
  fetchAnalytics: async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/analytics`);

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Backend analytics fetch failed:', err);
    }

    return null;
  },
};
