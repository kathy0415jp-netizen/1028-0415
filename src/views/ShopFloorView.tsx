import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MachineStatus } from '../types';
import {
  Cpu,
  Users,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Plus,
  Clock,
  Activity,
} from 'lucide-react';

interface ShopFloorViewProps {
  onOpenDowntimeModal: () => void;
}

export const ShopFloorView: React.FC<ShopFloorViewProps> = ({ onOpenDowntimeModal }) => {
  const {
    machines,
    operators,
    downtimeLogs,
    workReports,
    updateMachineStatus,
    resolveDowntimeLog,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'machines' | 'operators' | 'downtimes'>('machines');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900">車間機台設備與作業員工作站</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            監控現場 CNC、三次元量測儀器、表面研磨設備稼動狀態，即時回報待料與異常停機
          </p>
        </div>

        <button
          onClick={onOpenDowntimeModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>通報機台停機 / 待料</span>
        </button>
      </div>

      {/* Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs w-fit">
        <button
          onClick={() => setActiveSection('machines')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
            activeSection === 'machines'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>機台設備清單 ({machines.length})</span>
        </button>
        <button
          onClick={() => setActiveSection('operators')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
            activeSection === 'operators'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>作業技術人員 ({operators.length})</span>
        </button>
        <button
          onClick={() => setActiveSection('downtimes')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
            activeSection === 'downtimes'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>停機異常履歷 ({downtimeLogs.length})</span>
        </button>
      </div>

      {/* SECTION 1: MACHINES */}
      {activeSection === 'machines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((mc) => {
            return (
              <div
                key={mc.id}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 hover:border-slate-300 transition-colors shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500">{mc.machineCode}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{mc.name}</h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{mc.model}</div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      mc.status === 'running'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : mc.status === 'maintenance'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : mc.status === 'breakdown'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {mc.status === 'running'
                      ? '加工運轉中'
                      : mc.status === 'maintenance'
                      ? '例行保養'
                      : mc.status === 'breakdown'
                      ? '故障報修'
                      : '待機閒置'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">安裝產線：</span>
                    <span className="text-slate-800 font-medium">{mc.line}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">當前加工工單：</span>
                    <span className="font-mono font-bold text-slate-900">
                      {mc.currentWorkOrderNo || '無 (待命中)'}
                    </span>
                  </div>
                  {mc.currentOperatorName && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">當前操作員：</span>
                      <span className="text-slate-800 font-medium">{mc.currentOperatorName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">綜合稼動率：</span>
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">
                      {mc.utilizationRate}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                    <span>上次保養日：</span>
                    <span className="font-mono">{mc.lastMaintenanceDate}</span>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">調度機台狀態：</span>
                  <select
                    value={mc.status}
                    onChange={(e) => updateMachineStatus(mc.id, e.target.value as MachineStatus)}
                    className="text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 font-medium"
                  >
                    <option value="running">運轉中 (Running)</option>
                    <option value="idle">待機閒置 (Idle)</option>
                    <option value="maintenance">例行保養 (Maintenance)</option>
                    <option value="breakdown">故障停機 (Breakdown)</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 2: OPERATORS */}
      {activeSection === 'operators' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="py-3 px-3.5 font-semibold">工號</th>
                <th className="py-3 px-3.5 font-semibold">作業員姓名</th>
                <th className="py-3 px-3.5 font-semibold">所屬部門 / 班組</th>
                <th className="py-3 px-3.5 font-semibold">職位身分</th>
                <th className="py-3 px-3.5 font-semibold">技能等級</th>
                <th className="py-3 px-3.5 font-semibold">班別</th>
                <th className="py-3 px-3.5 font-semibold text-right">已報工單數</th>
                <th className="py-3 px-3.5 font-semibold text-right">累計投入工時 (h)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {operators.map((op) => {
                const opReports = workReports.filter((r) => r.operatorId === op.id);
                const totalHours = opReports.reduce((sum, r) => sum + r.durationHours, 0);

                return (
                  <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-900">{op.employeeNo}</td>
                    <td className="py-3 px-3.5 font-semibold text-slate-900">{op.name}</td>
                    <td className="py-3 px-3.5 text-slate-700">{op.department}</td>
                    <td className="py-3 px-3.5 text-slate-600">
                      {op.role === 'line_lead'
                        ? '組長 / 領班'
                        : op.role === 'inspector'
                        ? '品保品檢員'
                        : op.role === 'supervisor'
                        ? '生管主管'
                        : '現場作業員'}
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-700">
                      {op.skillLevel === 'Lead'
                        ? '資深領班'
                        : op.skillLevel === 'Senior'
                        ? '高級技師'
                        : '中級技術員'}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {op.shift === 'day' ? '日班 (08:00-17:00)' : '夜班 (20:00-05:00)'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {opReports.length} 筆
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {totalHours.toFixed(1)} h
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SECTION 3: DOWNTIME LOGS */}
      {activeSection === 'downtimes' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-3.5 font-semibold">機台編號</th>
                  <th className="py-3 px-3.5 font-semibold">機台名稱</th>
                  <th className="py-3 px-3.5 font-semibold">異常原因類別</th>
                  <th className="py-3 px-3.5 font-semibold">詳細情況描述</th>
                  <th className="py-3 px-3.5 font-semibold">通報人員</th>
                  <th className="py-3 px-3.5 font-semibold">開始時間</th>
                  <th className="py-3 px-3.5 font-semibold text-right">停工時長</th>
                  <th className="py-3 px-3.5 font-semibold text-center">狀態 / 處置</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {downtimeLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900">{log.machineCode}</td>
                      <td className="py-3 px-3.5 text-slate-800 font-medium">{log.machineName}</td>
                      <td className="py-3 px-3.5">
                        <span className="font-semibold text-amber-700">
                          {log.reason === 'material_shortage'
                            ? '待料停工'
                            : log.reason === 'machine_breakdown'
                            ? '機台故障'
                            : log.reason === 'maintenance'
                            ? '排程保養'
                            : '換模調整'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 max-w-xs">{log.reasonText}</td>
                      <td className="py-3 px-3.5 text-slate-600">{log.reportedBy}</td>
                      <td className="py-3 px-3.5 font-mono text-slate-500">
                        {log.startTime.replace('T', ' ').slice(0, 16)}
                      </td>
                      <td className="py-3 px-3.5 text-right font-mono tabular-nums text-slate-800">
                        {log.durationMinutes ? `${log.durationMinutes} 分鐘` : '持續中'}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {log.status === 'ongoing' ? (
                          <button
                            onClick={() => resolveDowntimeLog(log.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors shadow-xs"
                          >
                            標記已排除恢復
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            已排除結案
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
