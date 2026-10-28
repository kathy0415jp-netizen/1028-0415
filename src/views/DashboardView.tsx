import React from 'react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../components/Header';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Cpu,
  TrendingUp,
  ArrowRight,
  FileText,
  Activity,
  Plus,
  PlayCircle,
  Download,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenReportModal: () => void;
  onOpenWorkOrderModal: () => void;
  onOpenDowntimeModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenReportModal,
  onOpenWorkOrderModal,
  onOpenDowntimeModal,
}) => {
  const { workOrders, workReports, machines, exportToCSV } = useApp();

  // Metrics calculation
  const totalReportedHours = workReports.reduce((sum, r) => sum + r.durationHours, 0);
  const totalGoodQty = workReports.reduce((sum, r) => sum + r.goodQty, 0);
  const totalDefectQty = workReports.reduce((sum, r) => sum + r.defectQty, 0);
  const overallYield =
    totalGoodQty + totalDefectQty > 0
      ? Number(((totalGoodQty / (totalGoodQty + totalDefectQty)) * 100).toFixed(1))
      : 100;

  const totalStdHours = workReports.reduce((sum, r) => sum + r.standardHours, 0);
  const overallEfficiency =
    totalReportedHours > 0
      ? Number(((totalStdHours / totalReportedHours) * 100).toFixed(1))
      : 100;

  const pendingApprovals = workReports.filter((r) => r.status === 'pending_review');
  const runningMachinesCount = machines.filter((m) => m.status === 'running').length;

  return (
    <div className="space-y-6">
      {/* Hero Visual Card with Verified Local Generated Image */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm text-white">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/factory_shopfloor_hero_1791872655349.jpg"
            alt="智能精密製造加工車間現場"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 mb-3">
            <Activity className="w-4 h-4" />
            <span>智能製造現場即時報工 MES 控制台</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            精密製造製程管理與工時報工看板
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            即時追蹤工單進度、機台加工狀態、良品產出與工時效率。現場作業員支援一鍵秒錶計時報工與條碼槍掃描，落實工序標準工時管控。
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <PlayCircle className="w-4 h-4" />
              <span>現場快速報工</span>
            </button>
            <button
              onClick={onOpenWorkOrderModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建生產工單</span>
            </button>
            <button
              onClick={onOpenDowntimeModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-medium transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>異常停機通報</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-medium transition-colors ml-auto hidden sm:flex"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出報工報表</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip - Zero-Pill, Tabular Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>今日累計報工工時</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalReportedHours.toFixed(1)} <span className="text-xs font-sans font-normal text-slate-500">小時</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            標準工時: <span className="font-mono tabular-nums">{totalStdHours.toFixed(1)}h</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>累計良品產出量</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalGoodQty.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-500">件</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            不良報廢: <span className="font-mono text-rose-600 tabular-nums">{totalDefectQty} 件</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>全廠綜合良率</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {overallYield}%
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            目標基準: <span className="font-mono tabular-nums">≥ 95.0%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>工時效率達成率</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {overallEfficiency}%
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            標準工時 / 實際工時比
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>待主管審核報工單</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
            {pendingApprovals.length} <span className="text-xs font-sans font-normal text-slate-500">筆</span>
          </div>
          <button
            onClick={() => onNavigate('approvals')}
            className="text-[11px] text-slate-700 hover:text-slate-950 font-medium flex items-center gap-1 mt-2"
          >
            <span>前往審核簽核</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Grid: Machine Status Matrix + Work Orders Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Work Orders Progress */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">在製工單排產與完成進度</h2>
              <p className="text-xs text-slate-500 mt-0.5">監控當前各生產工單各工序投產狀態</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1"
            >
              <span>查看全部工單</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {workOrders.slice(0, 4).map((wo) => {
              const progressPct = wo.totalQty > 0 ? Math.min(100, Math.round((wo.completedQty / wo.totalQty) * 100)) : 0;
              const currentProc = wo.processes.find((p) => p.status === 'in_progress') || wo.processes[0];

              return (
                <div
                  key={wo.id}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {wo.orderNo}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs font-medium text-slate-800">{wo.productName}</span>
                      {wo.priority === 'urgent' && (
                        <span className="text-[10px] font-semibold font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          急件
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-600 tabular-nums">
                      {wo.completedQty.toLocaleString()} / {wo.totalQty.toLocaleString()} 件 ({progressPct}%)
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        progressPct >= 100 ? 'bg-emerald-600' : 'bg-slate-900'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span>當前工序:</span>
                      <span className="font-medium text-slate-700">
                        {currentProc?.processCode} {currentProc?.processName}
                      </span>
                    </div>
                    <div>交期: {wo.planEndDate}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Machine Stations Operational Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">車間機台設備運轉狀態</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                運轉中: {runningMachinesCount} / {machines.length} 台
              </p>
            </div>
            <button
              onClick={() => onNavigate('shopfloor')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1"
            >
              <span>機台工作站</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {machines.map((mc) => {
              let statusLabel = '待機閒置';
              let statusColor = 'text-slate-600 bg-slate-100 border-slate-200';
              if (mc.status === 'running') {
                statusLabel = '運轉加工中';
                statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
              } else if (mc.status === 'maintenance') {
                statusLabel = '保養維護';
                statusColor = 'text-amber-700 bg-amber-50 border-amber-200';
              } else if (mc.status === 'breakdown') {
                statusLabel = '故障停機';
                statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
              }

              return (
                <div
                  key={mc.id}
                  className="p-3 rounded-lg border border-slate-200 text-xs flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono font-semibold text-slate-900">{mc.machineCode}</span>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="text-slate-700 truncate font-medium">{mc.name}</div>

                  {mc.status === 'running' && mc.currentWorkOrderNo ? (
                    <div className="text-[11px] text-slate-500">
                      工單: <span className="font-mono text-slate-700">{mc.currentWorkOrderNo}</span> ·{' '}
                      {mc.currentOperatorName}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400">{mc.line}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Work Reports Stream */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">最新車間現場報工紀錄</h2>
            <p className="text-xs text-slate-500 mt-0.5">即時顯示作業員回報之良品、不良品與工時資料</p>
          </div>
          <button
            onClick={() => onNavigate('reporting')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1"
          >
            <span>報工清單與登記</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2.5 px-3 font-semibold">報工單號</th>
                <th className="py-2.5 px-3 font-semibold">工單號碼</th>
                <th className="py-2.5 px-3 font-semibold">製程工序</th>
                <th className="py-2.5 px-3 font-semibold">報工人員</th>
                <th className="py-2.5 px-3 font-semibold">機台</th>
                <th className="py-2.5 px-3 font-semibold text-right">良品數</th>
                <th className="py-2.5 px-3 font-semibold text-right">不良數</th>
                <th className="py-2.5 px-3 font-semibold text-right">工時 (h)</th>
                <th className="py-2.5 px-3 font-semibold text-right">良率</th>
                <th className="py-2.5 px-3 font-semibold text-right">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workReports.slice(0, 5).map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-slate-900">{rep.reportNo}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{rep.workOrderNo}</td>
                  <td className="py-3 px-3 text-slate-800">{rep.processCode} {rep.processName}</td>
                  <td className="py-3 px-3 text-slate-700">{rep.operatorName}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{rep.machineCode}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {rep.goodQty}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-600 tabular-nums">
                    {rep.defectQty}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {rep.durationHours.toFixed(1)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    {rep.yieldRate}%
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
