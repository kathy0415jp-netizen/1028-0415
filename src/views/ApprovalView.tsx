import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckSquare,
  AlertTriangle,
  XCircle,
  FileCheck,
  Check,
  X,
  Search,
} from 'lucide-react';

export const ApprovalView: React.FC = () => {
  const { workReports, approveWorkReport, rejectWorkReport, batchApproveReports } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('工時填報有誤，請複核');
  const [searchTerm, setSearchTerm] = useState('');

  const pendingReports = workReports.filter((r) => r.status === 'pending_review');
  const historyReports = workReports.filter((r) => r.status !== 'pending_review');

  const displayedReports = (activeTab === 'pending' ? pendingReports : historyReports).filter(
    (r) =>
      r.reportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pendingReports.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    batchApproveReports(selectedIds);
    setSelectedIds([]);
  };

  const handleConfirmReject = () => {
    if (!rejectingId) return;
    rejectWorkReport(rejectingId, rejectReason);
    setRejectingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900">生管與班組長報工審核中心</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            稽核現場作業工時真實性、良率公差與報廢原因，自動標註異常工時預警
          </p>
        </div>

        {activeTab === 'pending' && selectedIds.length > 0 && (
          <button
            onClick={handleBatchApprove}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
          >
            <Check className="w-4 h-4" />
            <span>批次核准已選項目 ({selectedIds.length})</span>
          </button>
        )}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => {
              setActiveTab('pending');
              setSelectedIds([]);
            }}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>待主管簽核</span>
            {pendingReports.length > 0 && (
              <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-1.5 rounded">
                {pendingReports.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setSelectedIds([]);
            }}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            審核紀錄歷程 ({historyReports.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋單號、人員或工單..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {displayedReports.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">
              {activeTab === 'pending' ? '目前所有報工單均已審核完畢！' : '查無歷史審核紀錄'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  {activeTab === 'pending' && (
                    <th className="py-3 px-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === pendingReports.length && pendingReports.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-slate-300"
                      />
                    </th>
                  )}
                  <th className="py-3 px-3.5 font-semibold">報工單號 / 日期</th>
                  <th className="py-3 px-3.5 font-semibold">工單 / 產品規格</th>
                  <th className="py-3 px-3.5 font-semibold">製程工序</th>
                  <th className="py-3 px-3.5 font-semibold">作業員 / 機台</th>
                  <th className="py-3 px-3.5 font-semibold text-right">良品/不良</th>
                  <th className="py-3 px-3.5 font-semibold text-right">實際工時</th>
                  <th className="py-3 px-3.5 font-semibold text-right">標時 / 效率</th>
                  <th className="py-3 px-3.5 font-semibold text-center">異常預警</th>
                  <th className="py-3 px-3.5 font-semibold text-center">簽核決策</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedReports.map((rep) => {
                  const isLowYield = rep.yieldRate < 95;
                  const isEfficiencyAnomaly = rep.efficiencyRate > 125 || rep.efficiencyRate < 75;

                  return (
                    <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                      {activeTab === 'pending' && (
                        <td className="py-3 px-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(rep.id)}
                            onChange={() => handleToggleSelect(rep.id)}
                            className="rounded border-slate-300"
                          />
                        </td>
                      )}
                      <td className="py-3 px-3.5">
                        <div className="font-mono font-bold text-slate-900">{rep.reportNo}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {rep.startTime.slice(0, 16).replace('T', ' ')}
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-mono font-semibold text-slate-800">{rep.workOrderNo}</div>
                        <div className="text-slate-600 truncate max-w-[150px]">{rep.productName}</div>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="font-mono text-slate-500 mr-1">{rep.processCode}</span>
                        <span className="text-slate-800">{rep.processName}</span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-slate-900">{rep.operatorName}</div>
                        <div className="font-mono text-[11px] text-slate-400">機台: {rep.machineCode}</div>
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                        <div className="font-bold text-slate-900">{rep.goodQty} 件</div>
                        {rep.defectQty > 0 ? (
                          <div className="text-rose-600 font-medium">({rep.defectQty} 不良)</div>
                        ) : (
                          <div className="text-slate-400 text-[11px]">全數良品</div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono text-slate-800 tabular-nums">
                        <span className="font-bold">{rep.durationHours.toFixed(1)}</span> 小時
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                        <div className="text-slate-600">{rep.standardHours.toFixed(1)}h</div>
                        <div
                          className={`text-[11px] font-semibold ${
                            rep.efficiencyRate >= 95 ? 'text-emerald-700' : 'text-amber-600'
                          }`}
                        >
                          {rep.efficiencyRate}% 效率
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {isLowYield ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded"
                            title="良率低於95%基準線"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            良率 {rep.yieldRate}%
                          </span>
                        ) : isEfficiencyAnomaly ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded"
                            title="工時效率偏離標準超過25%"
                          >
                            工時離群
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">標準常態</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        {rep.status === 'pending_review' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => approveWorkReport(rep.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
                            >
                              核准
                            </button>
                            <button
                              onClick={() => setRejectingId(rep.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
                            >
                              駁回
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded border inline-block ${
                                rep.status === 'approved'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {rep.status === 'approved' ? '已核准' : '已駁回'}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[100px] mx-auto">
                              {rep.reviewedBy}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>駁回此筆報工紀錄</span>
              </h3>
              <button onClick={() => setRejectingId(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                請輸入退件駁回原因（供作業員修正重報）：
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded"
              >
                確認退件駁回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
