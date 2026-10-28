import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Download,
  RotateCcw,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  Award,
  Database,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { workReports, operators, exportToCSV, exportToJSON, resetToDemoData } = useApp();

  // Aggregate defect statistics
  const defectCounts: Record<string, { name: string; count: number }> = {};
  workReports.forEach((r) => {
    r.defectDetails.forEach((d) => {
      if (!defectCounts[d.reasonCode]) {
        defectCounts[d.reasonCode] = { name: d.reasonName, count: 0 };
      }
      defectCounts[d.reasonCode].count += d.qty;
    });
  });

  const sortedDefects = Object.entries(defectCounts).sort((a, b) => b[1].count - a[1].count);
  const totalDefectSum = sortedDefects.reduce((acc, curr) => acc + curr[1].count, 0);

  // Operator performance ranking
  const operatorStats = operators.map((op) => {
    const reports = workReports.filter((r) => r.operatorId === op.id);
    const totalHours = reports.reduce((sum, r) => sum + r.durationHours, 0);
    const totalGood = reports.reduce((sum, r) => sum + r.goodQty, 0);
    const totalDefects = reports.reduce((sum, r) => sum + r.defectQty, 0);
    const totalProduced = totalGood + totalDefects;
    const yieldRate = totalProduced > 0 ? Number(((totalGood / totalProduced) * 100).toFixed(1)) : 100;

    const stdHours = reports.reduce((sum, r) => sum + r.standardHours, 0);
    const efficiency = totalHours > 0 ? Number(((stdHours / totalHours) * 100).toFixed(1)) : 100;

    return {
      operator: op,
      reportsCount: reports.length,
      totalHours,
      totalGood,
      totalDefects,
      yieldRate,
      efficiency,
    };
  }).sort((a, b) => b.totalHours - a.totalHours);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900">製程品質與工時效益統計報表</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            不良品柏拉圖 (Pareto) 歸因分析、個人工時產出排行榜與系統資料匯出
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>匯出報工 CSV 報表</span>
          </button>
          <button
            onClick={exportToJSON}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>備份 JSON</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('確定要還原成初始示範資料嗎？現有自訂修改將被重置。')) {
                resetToDemoData();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置示範資料</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Defect Reasons Pareto Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>不良報廢原因 Pareto 柏拉圖分析</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                累計瑕疵總數: <span className="font-mono font-bold text-rose-700">{totalDefectSum} 件</span>
              </p>
            </div>
          </div>

          {sortedDefects.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">目前尚無不良品回報紀錄</div>
          ) : (
            <div className="space-y-3">
              {sortedDefects.map(([code, item]) => {
                const percentage =
                  totalDefectSum > 0 ? Math.round((item.count / totalDefectSum) * 100) : 0;

                return (
                  <div key={code} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400 font-semibold">{code}</span>
                        <span className="font-medium text-slate-800">{item.name}</span>
                      </div>
                      <div className="font-mono text-slate-700 tabular-nums font-semibold">
                        {item.count} 件 ({percentage}%)
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Process Efficiency & Work Hours Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>製程工時標準達標率</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                比較實際投入工時與工程標準工時 (Standard vs Actual Hours)
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {workReports.slice(0, 5).map((r) => {
              const diff = r.standardHours - r.durationHours;
              return (
                <div
                  key={r.id}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {r.workOrderNo} · {r.processName}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      作業員: {r.operatorName} · 機台: {r.machineCode}
                    </div>
                  </div>

                  <div className="text-right font-mono tabular-nums">
                    <div className="text-xs font-semibold text-slate-800">
                      實際: {r.durationHours.toFixed(1)}h / 標時: {r.standardHours.toFixed(1)}h
                    </div>
                    <div
                      className={`text-[11px] font-bold ${
                        r.efficiencyRate >= 95 ? 'text-emerald-700' : 'text-amber-600'
                      }`}
                    >
                      效率 {r.efficiencyRate}% {diff >= 0 ? `(+${diff.toFixed(1)}h)` : `(${diff.toFixed(1)}h)`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operator Performance Ranking Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>車間技術人員工時績效與產能貢獻排行</span>
          </h2>
          <span className="text-xs text-slate-500">依累計投入工時排序</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-3 px-3.5 font-semibold">排名</th>
                <th className="py-3 px-3.5 font-semibold">作業人員</th>
                <th className="py-3 px-3.5 font-semibold">部門</th>
                <th className="py-3 px-3.5 font-semibold">技能等級</th>
                <th className="py-3 px-3.5 font-semibold text-right">報工單數</th>
                <th className="py-3 px-3.5 font-semibold text-right">良品件數</th>
                <th className="py-3 px-3.5 font-semibold text-right">投入工時 (h)</th>
                <th className="py-3 px-3.5 font-semibold text-right">個人良率</th>
                <th className="py-3 px-3.5 font-semibold text-right">工時達成率</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {operatorStats.map((stat, idx) => (
                <tr key={stat.operator.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-3 px-3.5 font-semibold text-slate-900">
                    {stat.operator.name}
                    <span className="ml-1.5 font-mono text-[11px] text-slate-400">
                      ({stat.operator.employeeNo})
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-700">{stat.operator.department}</td>
                  <td className="py-3 px-3.5 text-slate-600">{stat.operator.skillLevel}</td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums">{stat.reportsCount} 筆</td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {stat.totalGood.toLocaleString()} 件
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {stat.totalHours.toFixed(1)} h
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums font-semibold text-emerald-700">
                    {stat.yieldRate}%
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {stat.efficiency}%
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
