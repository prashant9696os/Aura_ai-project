import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ToastContainer from './components/common/ToastContainer';
import Dashboard from './components/dashboard/Dashboard';
import ChatInterface from './components/chat/ChatInterface';
import DocumentHub from './components/documents/DocumentHub';
import Tickets from './pages/Tickets';
import AnalyticsView from './components/analytics/AnalyticsView';
import SettingsModal from './components/settings/SettingsModal';

function MainLayout() {
  const { activeTab } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'chat':
        return <ChatInterface />;
      case 'documents':
        return <DocumentHub />;
      case 'tickets':
        return <Tickets />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsModal />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Dynamic Ambient Background Glows & Grid */}
      <div className="ambient-grid-overlay" />
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* Real-Time Toast Notifications */}
      <ToastContainer />

      {/* Main Navigation Sidebar */}
      <Sidebar />

      {/* Central View Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          minWidth: 0,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <Navbar />
        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
