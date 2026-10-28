import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, AlertOctagon } from 'lucide-react';

interface DowntimeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMachineId?: string;
}

export const DowntimeReportModal: React.FC<DowntimeReportModalProps> = ({
  isOpen,
  onClose,
  defaultMachineId,
}) => {
  const { machines, operators, createDowntimeLog } = useApp();

  const [machineId, setMachineId] = useState(defaultMachineId || (machines[0]?.id || ''));
  const [reason, setReason] = useState<'material_shortage' | 'machine_breakdown' | 'mold_change' | 'quality_abnormal' | 'maintenance' | 'other'>('material_shortage');
  const [reasonText, setReasonText] = useState('前製程待料中，物料未達加工工位');
  const [operatorId, setOperatorId] = useState(operators[0]?.id || '');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const selectedMachine = machines.find((m) => m.id === machineId);
  const selectedOperator = operators.find((o) => o.id === operatorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine || !selectedOperator) return;

    createDowntimeLog({
      machineId: selectedMachine.id,
      machineCode: selectedMachine.machineCode,
      machineName: selectedMachine.name,
      reason,
      reasonText,
      startTime: new Date().toISOString(),
      reportedBy: selectedOperator.name,
      status: 'ongoing',
      notes,
    });

    onClose();
  };

  const handleReasonPreset = (type: typeof reason) => {
    setReason(type);
    if (type === 'material_shortage') setReasonText('前製程待料中，物料未達加工工位');
    else if (type === 'machine_breakdown') setReasonText('主軸異音報警 / 刀庫卡刀故障停機');
    else if (type === 'mold_change') setReasonText('產品換線更換治具夾爪與刀具校正');
    else if (type === 'quality_abnormal') setReasonText('品質異常停線，等待品保工程師複檢');
    else if (type === 'maintenance') setReasonText('車間例行一級機台潤滑與排屑清潔');
    else setReasonText('車間其他臨時突發停工事項');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-amber-50">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">機台停機 / 異常待料通報</h2>
              <p className="text-xs text-slate-600 mt-0.5">即時回報稼動停滯原因，通知生管排除異常</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              受影響機台設備 <span className="text-rose-500">*</span>
            </label>
            <select
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              required
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {machines.map((mc) => (
                <option key={mc.id} value={mc.id}>
                  {mc.machineCode} - {mc.name} ({mc.line})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              通報作業員 / 現場負責人 <span className="text-rose-500">*</span>
            </label>
            <select
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              required
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.employeeNo} · {op.name} ({op.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              停機異常類別
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleReasonPreset('material_shortage')}
                className={`p-2 border rounded-lg text-left transition-colors ${
                  reason === 'material_shortage'
                    ? 'border-slate-900 bg-slate-100 font-semibold text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                待料停工 (Material)
              </button>
              <button
                type="button"
                onClick={() => handleReasonPreset('machine_breakdown')}
                className={`p-2 border rounded-lg text-left transition-colors ${
                  reason === 'machine_breakdown'
                    ? 'border-slate-900 bg-slate-100 font-semibold text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                機台故障 (Breakdown)
              </button>
              <button
                type="button"
                onClick={() => handleReasonPreset('mold_change')}
                className={`p-2 border rounded-lg text-left transition-colors ${
                  reason === 'mold_change'
                    ? 'border-slate-900 bg-slate-100 font-semibold text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                換模換線 (Setup)
              </button>
              <button
                type="button"
                onClick={() => handleReasonPreset('quality_abnormal')}
                className={`p-2 border rounded-lg text-left transition-colors ${
                  reason === 'quality_abnormal'
                    ? 'border-slate-900 bg-slate-100 font-semibold text-slate-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                品檢異常 (Quality)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              異常現象說明 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              required
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              後續處置或備註 (選填)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：已通知廠務技術員前來檢修，預計1小時內排除..."
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm"
            >
              確認送出通報
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
