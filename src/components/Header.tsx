import React from 'react';
import { PlayCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export type NavTab = 'dashboard' | 'reporting' | 'orders' | 'approvals' | 'shopfloor' | 'analytics';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenReportModal,
}) => {
  const { workReports, activeTimer } = useApp();
  const pendingCount = workReports.filter((r) => r.status === 'pending_review').length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              智
            </div>
            <button
              onClick={() => onSelectTab('dashboard')}
              className="text-left font-bold text-lg tracking-tight text-slate-900 whitespace-nowrap hover:opacity-80 transition-opacity"
            >
              智造雲 · 報工管理系統
            </button>
          </div>

          {/* Zone 2: Concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
                currentTab === 'dashboard'
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              即時總覽
            </button>
            <button
              onClick={() => onSelectTab('reporting')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
                currentTab === 'reporting'
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              <span>現場報工</span>
              {activeTimer && (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="計時中" />
              )}
            </button>
            <button
              onClick={() => onSelectTab('orders')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
                currentTab === 'orders'
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              工單進度
            </button>
            <button
              onClick={() => onSelectTab('approvals')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
                currentTab === 'approvals'
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              <span>報工審核</span>
              {pendingCount > 0 && (
                <span className="text-xs font-mono font-semibold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onSelectTab('shopfloor')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
                currentTab === 'shopfloor'
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              機台與人員
            </button>
            <button
              onClick={() => onSelectTab('analytics')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
                currentTab === 'analytics'
                  ? 'text-slate-900 border-slate-900 font-semibold'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              統計報表
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {activeTimer ? (
              <button
                onClick={() => onSelectTab('reporting')}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span>進行中計時</span>
              </button>
            ) : null}

            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>快速報工</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto py-2.5 border-t border-slate-100 text-xs font-medium text-slate-600 gap-4">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap py-1 ${currentTab === 'dashboard' ? 'text-slate-900 font-bold' : ''}`}
          >
            即時總覽
          </button>
          <button
            onClick={() => onSelectTab('reporting')}
            className={`whitespace-nowrap py-1 ${currentTab === 'reporting' ? 'text-slate-900 font-bold' : ''}`}
          >
            現場報工
          </button>
          <button
            onClick={() => onSelectTab('orders')}
            className={`whitespace-nowrap py-1 ${currentTab === 'orders' ? 'text-slate-900 font-bold' : ''}`}
          >
            工單進度
          </button>
          <button
            onClick={() => onSelectTab('approvals')}
            className={`whitespace-nowrap py-1 ${currentTab === 'approvals' ? 'text-slate-900 font-bold' : ''}`}
          >
            審核 ({pendingCount})
          </button>
          <button
            onClick={() => onSelectTab('shopfloor')}
            className={`whitespace-nowrap py-1 ${currentTab === 'shopfloor' ? 'text-slate-900 font-bold' : ''}`}
          >
            機台與人員
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`whitespace-nowrap py-1 ${currentTab === 'analytics' ? 'text-slate-900 font-bold' : ''}`}
          >
            統計報表
          </button>
        </div>
      </div>
    </header>
  );
};
