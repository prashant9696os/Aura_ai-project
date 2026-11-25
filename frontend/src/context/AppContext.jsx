import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  checkBackendHealth,
  documentService,
  ticketService,
  loadLocalData,
  saveLocalData,
} from '../services/api';

const AppContext = createContext(null);

const DEFAULT_CHATS = [
  {
    id: 'chat-1',
    title: 'Distributed Vector Cluster Optimization',
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    pinned: true,
    model: 'GPT-4o Omni',
    systemPersona: 'Senior AI Architect',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'How should we configure HNSW index parameters for a 50-million vector dataset with sub-50ms p99 latency?',
        timestamp: '2 hours ago',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `### 🚀 HNSW Vector Index Tuning Guide for 50M Vectors

To hit **sub-50ms p99 latency** on a 50M scale index, follow this battle-tested configuration:

#### 1. Optimal Index Parameters
- **\`M = 32\`**: Number of bi-directional links per vector node. Balances graph connectivity without inflating memory footprint.
- **\`efConstruction = 256\`**: Deep exploration during indexing phase.
- **\`efSearch = 64\`**: Search beam width. Guarantees >98.2% recall with negligible latency overhead.

#### 2. Memory Quantization Strategy
\`\`\`bash
# Enable Scalar Quantization (SQ8) to reduce RAM from 128GB -> 32GB
aura-vector config --index=knowledge-base-v2 --quantization=sq8 --cache-size=48G
\`\`\`

Would you like me to generate Kubernetes pod memory limits based on this?`,
        timestamp: '2 hours ago',
        model: 'GPT-4o Omni',
        tokens: 312,
        latency: '24ms',
      },
    ],
  },
  {
    id: 'chat-2',
    title: 'Q3 Enterprise SLA Compliance Review',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    pinned: false,
    model: 'Claude 3.5 Sonnet',
    systemPersona: 'Support Resolution Agent',
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'Review our current ticket response metrics against the Q3 SLA guidelines.',
        timestamp: 'Yesterday',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `### 📊 Q3 SLA Compliance Assessment

I cross-referenced your **Q3 Customer Support SLA Guidelines.docx** against current telemetry:

- **P1 Critical Response Time**: **8.4 mins** (Target: <15 mins) — **100% SLA Met** ✅
- **P2 High Urgency Response**: **32 mins** (Target: <60 mins) — **98.4% SLA Met** ✅
- **Customer Satisfaction (CSAT)**: **4.85 / 5.0** ⭐️

**Highlight**: The automated AI triage workflow prevented 4 potential breaches this week.`,
        timestamp: 'Yesterday',
        model: 'Claude 3.5 Sonnet',
        tokens: 198,
        latency: '31ms',
      },
    ],
  },
];

let toastCounter = 0;
const generateToastId = () => {
  toastCounter = (toastCounter + 1) % 1000000;
  return `toast-${Date.now()}-${toastCounter}`;
};

export const AppProvider = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('aura_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Backend Health State
  const [backendOnline, setBackendOnline] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  // Documents State
  const [documents, setDocuments] = useState(() => documentService.getDocuments());

  // Tickets State
  const [tickets, setTickets] = useState(() => ticketService.getTickets());

  const refreshBackendStatus = async () => {
    setIsCheckingBackend(true);
    const online = await checkBackendHealth();
    setBackendOnline(online);
    setIsCheckingBackend(false);
  };

  useEffect(() => {
    let isMounted = true;
    const checkAndSync = async () => {
      const online = await checkBackendHealth();
      if (!isMounted) return;
      setBackendOnline(online);
      if (online) {
        try {
          const [backendDocs, backendTickets] = await Promise.all([
            documentService.fetchDocumentsFromBackend(),
            ticketService.fetchTicketsFromBackend(),
          ]);
          if (isMounted) {
            if (backendDocs && backendDocs.length > 0) setDocuments(backendDocs);
            if (backendTickets && backendTickets.length > 0) setTickets(backendTickets);
          }
        } catch (e) {
          console.warn('Initial backend sync failed:', e);
        }
      }
    };
    checkAndSync();
    const interval = setInterval(checkAndSync, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (title, message, type = 'info', duration = 4000) => {
    const id = generateToastId();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Chats State
  const [chats, setChats] = useState(() => {
    return loadLocalData('aura_chats_history', DEFAULT_CHATS);
  });
  const [activeChatId, setActiveChatId] = useState(() => {
    return chats.length > 0 ? chats[0].id : null;
  });

  useEffect(() => {
    saveLocalData('aura_chats_history', chats);
  }, [chats]);

  const createNewChat = (model = 'GPT-4o Omni') => {
    const newChat = {
      id: `chat-${Date.now()}`,
      title: 'New Conversation',
      updatedAt: new Date().toISOString(),
      pinned: false,
      model: model,
      systemPersona: 'Senior AI Architect',
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setActiveTab('chat');
    addToast('Chat Created', 'Started a new session.', 'info');
    return newChat;
  };

  const deleteChat = (id) => {
    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeChatId === id) {
        setActiveChatId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
    addToast('Conversation Deleted', 'Chat history was removed.', 'info');
  };

  const pinChat = (id) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  // Document Handlers
  const handleUploadDocument = async (file) => {
    try {
      const doc = await documentService.uploadDocument(file);
      setDocuments(documentService.getDocuments());
      addToast('Document Indexed', `${file.name} is now vectorized and ready for RAG.`, 'success');
      return doc;
    } catch (err) {
      addToast('Upload Error', 'Failed to process document.', 'error');
      throw err;
    }
  };

  const handleDeleteDocument = async (id) => {
    const updated = await documentService.deleteDocument(id);
    setDocuments(updated);
    addToast('Document Removed', 'File was deleted from knowledge base.', 'info');
  };

  // Ticket Handlers
  const handleUpdateTicketStatus = async (id, newStatus) => {
    const updated = await ticketService.updateTicketStatus(id, newStatus);
    setTickets(updated);
    addToast('Ticket Updated', `Status changed to ${newStatus}.`, 'success');
  };

  const handleCreateTicket = async (ticketData) => {
    const newTicket = await ticketService.createTicket(ticketData);
    setTickets(ticketService.getTickets());
    addToast('Ticket Created', `Ticket ${newTicket.id} logged with automated triage.`, 'success');
    return newTicket;
  };

  // Active Chat Object helper
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        sidebarCollapsed,
        setSidebarCollapsed,
        backendOnline,
        isCheckingBackend,
        refreshBackendStatus,
        toasts,
        addToast,
        removeToast,
        chats,
        setChats,
        activeChatId,
        setActiveChatId,
        activeChat,
        createNewChat,
        deleteChat,
        pinChat,
        documents,
        uploadDocument: handleUploadDocument,
        deleteDocument: handleDeleteDocument,
        tickets,
        updateTicketStatus: handleUpdateTicketStatus,
        createTicket: handleCreateTicket,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
