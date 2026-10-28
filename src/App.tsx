import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header, NavTab } from './components/Header';
import { ActiveTimerBanner } from './components/ActiveTimerBanner';
import { ToastContainer } from './components/ToastContainer';
import { DashboardView } from './views/DashboardView';
import { WorkReportingView } from './views/WorkReportingView';
import { WorkOrdersView } from './views/WorkOrdersView';
import { ApprovalView } from './views/ApprovalView';
import { ShopFloorView } from './views/ShopFloorView';
import { AnalyticsView } from './views/AnalyticsView';
import { CreateReportModal } from './components/modals/CreateReportModal';
import { CreateWorkOrderModal } from './components/modals/CreateWorkOrderModal';
import { DowntimeReportModal } from './components/modals/DowntimeReportModal';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTimerCompleting, setIsTimerCompleting] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isDowntimeModalOpen, setIsDowntimeModalOpen] = useState(false);

  const handleOpenReportModal = () => {
    setIsTimerCompleting(false);
    setIsReportModalOpen(true);
  };

  const handleCompleteTimer = () => {
    setIsTimerCompleting(true);
    setIsReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Bar Contract compliant Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenReportModal={handleOpenReportModal}
      />

      {/* Floating Active Timer Banner */}
      <ActiveTimerBanner onCompleteTimer={handleCompleteTimer} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigate={setCurrentTab}
            onOpenReportModal={handleOpenReportModal}
            onOpenWorkOrderModal={() => setIsWorkOrderModalOpen(true)}
            onOpenDowntimeModal={() => setIsDowntimeModalOpen(true)}
          />
        )}

        {currentTab === 'reporting' && (
          <WorkReportingView onOpenReportModal={handleOpenReportModal} />
        )}

        {currentTab === 'orders' && (
          <WorkOrdersView
            onOpenWorkOrderModal={() => setIsWorkOrderModalOpen(true)}
            onOpenReportModal={handleOpenReportModal}
          />
        )}

        {currentTab === 'approvals' && <ApprovalView />}

        {currentTab === 'shopfloor' && (
          <ShopFloorView onOpenDowntimeModal={() => setIsDowntimeModalOpen(true)} />
        )}

        {currentTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Quiet Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">智造雲 · 現場報工管理系統</span>
            <span>MES Shop Floor Work Reporting System</span>
          </div>
          <div>支援本地離線快取儲存 · 符合 ISO 9001 / IATF 16949 工時回報追溯標準</div>
        </div>
      </footer>

      {/* Modals */}
      <CreateReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setIsTimerCompleting(false);
        }}
        initialFromTimer={isTimerCompleting}
      />

      <CreateWorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
      />

      <DowntimeReportModal
        isOpen={isDowntimeModalOpen}
        onClose={() => setIsDowntimeModalOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
