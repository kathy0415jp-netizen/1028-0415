import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkOrder, WorkOrderStatus } from '../types';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Building,
} from 'lucide-react';

interface WorkOrdersViewProps {
  onOpenWorkOrderModal: () => void;
  onOpenReportModal: () => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  onOpenWorkOrderModal,
  onOpenReportModal,
}) => {
  const { workOrders, updateWorkOrderStatus } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'pending' | 'completed' | 'urgent'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(workOrders[0]?.id || null);

  const filteredOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.productModel.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'urgent') {
      return matchesSearch && wo.priority === 'urgent';
    }
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900">生產製造工單管理 (MO/WO)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            掌控各批次訂單製程路線 (Routing)、各工序良品累積進度與交期排程
          </p>
        </div>

        <button
          onClick={onOpenWorkOrderModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>建立新工單</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋工單號碼、客戶名稱、產品品名或型號..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            全部 ({workOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              statusFilter === 'in_progress'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            加工中 ({workOrders.filter((w) => w.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              statusFilter === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            待排產 ({workOrders.filter((w) => w.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              statusFilter === 'completed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            已結案 ({workOrders.filter((w) => w.status === 'completed').length})
          </button>
          <button
            onClick={() => setStatusFilter('urgent')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
              statusFilter === 'urgent'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-rose-600 hover:text-rose-800'
            }`}
          >
            急件 ({workOrders.filter((w) => w.priority === 'urgent').length})
          </button>
        </div>
      </div>

      {/* Work Orders List Accordions */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">查無相符工單</p>
          </div>
        ) : (
          filteredOrders.map((wo) => {
            const isExpanded = expandedOrderId === wo.id;
            const progressPct =
              wo.totalQty > 0 ? Math.min(100, Math.round((wo.completedQty / wo.totalQty) * 100)) : 0;

            return (
              <div
                key={wo.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(wo.id)}
                  className="p-5 cursor-pointer hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold font-mono text-slate-900">{wo.orderNo}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {wo.customer}
                      </span>
                      {wo.priority === 'urgent' && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          特急件
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-slate-800">{wo.productName}</div>
                    <div className="text-xs text-slate-500">
                      型號: <span className="font-mono text-slate-700">{wo.productModel}</span>
                      <span className="mx-2 text-slate-300">|</span>
                      料號: <span className="font-mono text-slate-700">{wo.partNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end md:self-auto">
                    {/* Quantity stats */}
                    <div className="text-right">
                      <div className="text-xs text-slate-500">目標產量</div>
                      <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                        {wo.completedQty.toLocaleString()} / {wo.totalQty.toLocaleString()}{' '}
                        <span className="text-xs font-normal text-slate-500">件</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        進度: <span className="font-semibold text-slate-700 font-mono">{progressPct}%</span>
                        {wo.scrapQty > 0 && (
                          <span className="text-rose-600 ml-1.5 font-mono">({wo.scrapQty} 報廢)</span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="w-24 text-center">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded border inline-block w-full ${
                          wo.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : wo.status === 'in_progress'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {wo.status === 'completed'
                          ? '已結案'
                          : wo.status === 'in_progress'
                          ? '加工中'
                          : wo.status === 'paused'
                          ? '暫停中'
                          : '待排產'}
                      </span>
                    </div>

                    <button className="text-slate-400 hover:text-slate-700 p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      progressPct >= 100 ? 'bg-emerald-600' : 'bg-slate-900'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Expanded Details: Routing Processes */}
                {isExpanded && (
                  <div className="p-5 bg-slate-50/70 border-t border-slate-200 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        工藝製程路線 (Routing) 進度明細
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">工單排程期：</span>
                        <span className="font-mono text-slate-700 font-medium">
                          {wo.planStartDate} ~ {wo.planEndDate}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {wo.processes.map((proc, idx) => {
                        const procPct =
                          proc.targetQty > 0
                            ? Math.min(100, Math.round((proc.completedGoodQty / proc.targetQty) * 100))
                            : 0;

                        return (
                          <div
                            key={proc.id}
                            className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 text-center font-mono font-bold text-slate-400">
                                #{idx + 1}
                              </span>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                  <span className="font-mono text-slate-600">{proc.processCode}</span>
                                  <span>{proc.processName}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  標準工時: {proc.standardCycleTimeMinutes} 分/件 · 目標: {proc.targetQty} 件
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="w-40">
                                <div className="flex justify-between text-[11px] mb-1 font-mono">
                                  <span className="text-slate-500">良品: {proc.completedGoodQty}</span>
                                  <span className="text-slate-800 font-semibold">{procPct}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      proc.status === 'completed' ? 'bg-emerald-600' : 'bg-slate-800'
                                    }`}
                                    style={{ width: `${procPct}%` }}
                                  />
                                </div>
                              </div>

                              <span
                                className={`text-[10px] font-medium px-2 py-0.5 rounded border whitespace-nowrap ${
                                  proc.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : proc.status === 'in_progress'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}
                              >
                                {proc.status === 'completed'
                                  ? '工序完工'
                                  : proc.status === 'in_progress'
                                  ? '進行中'
                                  : '待加工'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Work Order Action Strip */}
                    <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">工單狀態變更：</span>
                        <select
                          value={wo.status}
                          onChange={(e) => updateWorkOrderStatus(wo.id, e.target.value as WorkOrderStatus)}
                          className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 font-medium text-xs"
                        >
                          <option value="in_progress">加工中</option>
                          <option value="paused">暫停中</option>
                          <option value="completed">完工結案</option>
                          <option value="pending">待排產</option>
                        </select>
                      </div>

                      <button
                        onClick={onOpenReportModal}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
                      >
                        對此工單快速報工
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
