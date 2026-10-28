import React from 'react';
import { useApp } from '../context/AppContext';
import { Pause, Play, CheckSquare, X, Clock } from 'lucide-react';

interface ActiveTimerBannerProps {
  onCompleteTimer: () => void;
}

export const ActiveTimerBanner: React.FC<ActiveTimerBannerProps> = ({ onCompleteTimer }) => {
  const { activeTimer, pauseTimer, resumeTimer, cancelTimer } = useApp();

  if (!activeTimer) return null;

  const hours = Math.floor(activeTimer.elapsedSeconds / 3600);
  const minutes = Math.floor((activeTimer.elapsedSeconds % 3600) / 60);
  const seconds = activeTimer.elapsedSeconds % 60;

  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <aside aria-label="即時加工計時中" className="bg-slate-900 text-white px-4 py-2.5 shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 text-xs font-mono font-medium">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>即時加工計時中</span>
          </div>
          <div className="text-xs text-slate-200">
            <span className="font-semibold text-white">{activeTimer.workOrderNo}</span>
            <span className="mx-2 text-slate-500">·</span>
            <span>{activeTimer.processCode} {activeTimer.processName}</span>
            <span className="mx-2 text-slate-500">·</span>
            <span className="text-slate-300">{activeTimer.operatorName}</span>
            <span className="mx-2 text-slate-500">·</span>
            <span className="text-slate-400 font-mono">{activeTimer.machineCode}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-mono text-base font-bold tabular-nums text-emerald-400 bg-black/40 px-3 py-1 rounded border border-slate-700">
            {formattedTime}
          </div>

          {activeTimer.isPaused ? (
            <button
              onClick={resumeTimer}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-500 rounded transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>繼續</span>
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>暫停</span>
            </button>
          )}

          <button
            onClick={onCompleteTimer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 rounded transition-colors shadow-sm"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>結算報工</span>
          </button>

          <button
            onClick={cancelTimer}
            title="放棄本次計時"
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
