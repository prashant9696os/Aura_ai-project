import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  MessageSquare,
  Pin,
  Trash2,
  Download,
  X,
  ChevronLeft,
} from 'lucide-react';

export default function ChatHistorySidebar({ isOpen, onClose }) {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    createNewChat,
    deleteChat,
    pinChat,
    addToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter((c) => c.pinned);
  const unpinnedChats = filteredChats.filter((c) => !c.pinned);

  const exportCurrentChat = (chat) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(chat, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${chat.title.replace(/\s+/g, '_')}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Chat Exported', 'Conversation downloaded as JSON.', 'success');
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        width: '280px',
        height: '100%',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Top Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={16} color="var(--primary-500)" />
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Chat History
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => createNewChat()}
            className="btn btn-primary"
            style={{ padding: '5px 9px', fontSize: '11.5px' }}
            title="Start new conversation"
          >
            <Plus size={13} />
            <span>New</span>
          </button>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ padding: '6px' }}
            title="Close history drawer"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={14}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-text"
            style={{ paddingLeft: '32px', fontSize: '12.5px', padding: '7px 10px 7px 32px' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Pinned Section */}
        {pinnedChats.length > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px' }}>
              Pinned Sessions
            </div>
            {pinnedChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                onSelect={() => setActiveChatId(chat.id)}
                onDelete={() => deleteChat(chat.id)}
                onPin={() => pinChat(chat.id)}
                onExport={() => exportCurrentChat(chat)}
              />
            ))}
          </div>
        )}

        {/* Regular Sessions */}
        <div>
          <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px' }}>
            All Sessions ({unpinnedChats.length})
          </div>
          {unpinnedChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onSelect={() => setActiveChatId(chat.id)}
              onDelete={() => deleteChat(chat.id)}
              onPin={() => pinChat(chat.id)}
              onExport={() => exportCurrentChat(chat)}
            />
          ))}

          {filteredChats.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)', fontSize: '12px' }}>
              No conversations found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatItem({ chat, isActive, onSelect, onDelete, onPin, onExport }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 10px',
        borderRadius: 'var(--radius-md)',
        background: isActive ? 'rgba(99, 102, 241, 0.15)' : isHovered ? 'var(--bg-surface-hover)' : 'transparent',
        border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
        <MessageSquare
          size={14}
          color={isActive ? 'var(--primary-500)' : 'var(--text-muted)'}
          style={{ flexShrink: 0 }}
        />
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12.5px', fontWeight: isActive ? 600 : 400, color: isActive ? '#ffffff' : 'var(--text-primary)' }}>
          {chat.title}
        </div>
      </div>

      {/* Action buttons on hover */}
      <div
        style={{
          display: isHovered || isActive ? 'flex' : 'none',
          alignItems: 'center',
          gap: '2px',
          marginLeft: '4px',
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPin();
          }}
          className="btn-icon"
          style={{ padding: '3px' }}
          title={chat.pinned ? 'Unpin' : 'Pin'}
        >
          <Pin size={12} color={chat.pinned ? 'var(--accent-amber)' : 'inherit'} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
          className="btn-icon"
          style={{ padding: '3px' }}
          title="Export JSON"
        >
          <Download size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="btn-icon"
          style={{ padding: '3px' }}
          title="Delete chat"
        >
          <Trash2 size={12} color="var(--accent-rose)" />
        </button>
      </div>
    </div>
  );
}
