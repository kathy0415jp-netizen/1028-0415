import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkReport } from '../types';
import {
  PlayCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Eye,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface WorkReportingViewProps {
  onOpenReportModal: () => void;
}

export const WorkReportingView: React.FC<WorkReportingViewProps> = ({ onOpenReportModal }) => {
  const { workReports, deleteWorkReport, exportToCSV, activeTimer } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_review' | 'approved' | 'rejected'>('all');
  const [selectedReport, setSelectedReport] = useState<WorkReport | null>(null);

  const filteredReports = workReports.filter((r) => {
    const matchesSearch =
      r.reportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.machineCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900">現場作業報工大廳</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            紀錄各製程站點工時、良品與不良損耗，確保實際工時與標準工時達成率
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>匯出 CSV</span>
          </button>
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <PlayCircle className="w-4 h-4 text-emerald-400" />
            <span>新增現場報工</span>
          </button>
        </div>
      </div>

      {/* Active Timer Quick Notice if running */}
      {activeTimer && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-emerald-600 animate-spin" />
            <div className="text-xs">
              <span className="font-semibold text-emerald-950">
                目前有正在進行中的加工計時：
              </span>{' '}
              <span className="font-mono text-emerald-800 font-bold">{activeTimer.workOrderNo}</span> ·{' '}
              <span className="text-emerald-900">{activeTimer.processName}</span> (作業員: {activeTimer.operatorName})
            </div>
          </div>
          <button
            onClick={onOpenReportModal}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium transition-colors"
          >
            結算報工
          </button>
        </div>
      )}

      {/* Filters & Search Control */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋報工單號、工單、產品、作業員或機台..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            全部 ({workReports.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending_review')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              statusFilter === 'pending_review'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            待審核 ({workReports.filter((r) => r.status === 'pending_review').length})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              statusFilter === 'approved'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            已核准 ({workReports.filter((r) => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              statusFilter === 'rejected'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            已駁回 ({workReports.filter((r) => r.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">查無相符的報工紀錄</p>
            <p className="text-xs text-slate-400 mt-1">請嘗試變更搜尋關鍵字或篩選條件</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-3.5 font-semibold">報工單號</th>
                  <th className="py-3 px-3.5 font-semibold">工單號碼</th>
                  <th className="py-3 px-3.5 font-semibold">產品規格</th>
                  <th className="py-3 px-3.5 font-semibold">製程工序</th>
                  <th className="py-3 px-3.5 font-semibold">人員/機台</th>
                  <th className="py-3 px-3.5 font-semibold text-right">良品 (件)</th>
                  <th className="py-3 px-3.5 font-semibold text-right">報廢 (件)</th>
                  <th className="py-3 px-3.5 font-semibold text-right">工時 (h)</th>
                  <th className="py-3 px-3.5 font-semibold text-right">良率</th>
                  <th className="py-3 px-3.5 font-semibold text-right">效率比</th>
                  <th className="py-3 px-3.5 font-semibold text-center">審核狀態</th>
                  <th className="py-3 px-3.5 font-semibold text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {rep.reportNo}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                      {rep.workOrderNo}
                    </td>
                    <td className="py-3 px-3.5 text-slate-800 max-w-[160px] truncate" title={rep.productName}>
                      {rep.productName}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">
                      <span className="font-mono text-slate-500 mr-1">{rep.processCode}</span>
                      <span>{rep.processName}</span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      <div>{rep.operatorName}</div>
                      <div className="font-mono text-[11px] text-slate-400">{rep.machineCode}</div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {rep.goodQty}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                      {rep.defectQty > 0 ? (
                        <span className="text-rose-600 font-semibold">{rep.defectQty}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-800">
                      {rep.durationHours.toFixed(1)}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                      <span className={rep.yieldRate >= 95 ? 'text-emerald-700 font-medium' : 'text-amber-600 font-semibold'}>
                        {rep.yieldRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono tabular-nums">
                      <span className={rep.efficiencyRate >= 95 ? 'text-emerald-700 font-medium' : 'text-amber-600'}>
                        {rep.efficiencyRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                          rep.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : rep.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {rep.status === 'approved' ? '已核准' : rep.status === 'rejected' ? '已駁回' : '待審核'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedReport(rep)}
                          title="查看詳情"
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteWorkReport(rep.id)}
                          title="刪除紀錄"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  報工單詳細資訊 · {selectedReport.reportNo}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  工單: {selectedReport.workOrderNo} ({selectedReport.productName})
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">工序：</span>
                  <span className="font-semibold text-slate-800 ml-1">
                    {selectedReport.processCode} {selectedReport.processName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">作業員：</span>
                  <span className="font-semibold text-slate-800 ml-1">
                    {selectedReport.operatorName} ({selectedReport.employeeNo})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">機台設備：</span>
                  <span className="font-mono text-slate-800 ml-1">{selectedReport.machineCode}</span>
                </div>
                <div>
                  <span className="text-slate-500">報工模式：</span>
                  <span className="font-medium text-slate-800 ml-1">
                    {selectedReport.mode === 'timer' ? '即時計時' : '手動補報'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-slate-500 text-[11px]">良品產出</div>
                  <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {selectedReport.goodQty} 件
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-slate-500 text-[11px]">不良報廢</div>
                  <div className="text-base font-bold font-mono text-rose-600 tabular-nums">
                    {selectedReport.defectQty} 件
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-slate-500 text-[11px]">投入工時</div>
                  <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {selectedReport.durationHours.toFixed(2)} h
                  </div>
                </div>
              </div>

              {selectedReport.defectDetails && selectedReport.defectDetails.length > 0 && (
                <div>
                  <div className="font-semibold text-rose-700 mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>不良品瑕疵原因歸屬：</span>
                  </div>
                  <div className="space-y-1">
                    {selectedReport.defectDetails.map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded bg-rose-50 border border-rose-200 text-rose-900 text-xs"
                      >
                        <span>{d.reasonName}</span>
                        <span className="font-mono font-bold tabular-nums">{d.qty} 件</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.notes && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500">現場備註：</span>
                  <p className="text-slate-800 mt-1 leading-relaxed">{selectedReport.notes}</p>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-slate-600">
                <div>審核狀態：{selectedReport.status === 'approved' ? '已核准' : selectedReport.status === 'rejected' ? '已駁回' : '待審核'}</div>
                {selectedReport.reviewedBy && <div>審核主管：{selectedReport.reviewedBy}</div>}
                {selectedReport.reviewerNotes && <div>審核評語：{selectedReport.reviewerNotes}</div>}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
