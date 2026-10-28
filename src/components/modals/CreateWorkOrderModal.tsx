import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityLevel } from '../../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createWorkOrder } = useApp();

  const [orderNo, setOrderNo] = useState(`WO-2026-${Math.floor(106 + Math.random() * 800)}`);
  const [customer, setCustomer] = useState('台積電特用設備協力處');
  const [productModel, setProductModel] = useState('SEMI-CHUCK-50');
  const [productName, setProductName] = useState('12吋晶圓真空吸盤基座');
  const [partNumber, setPartNumber] = useState('PN-7730-SEMI');
  const [totalQty, setTotalQty] = useState(1500);
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [planStartDate, setPlanStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [planEndDate, setPlanEndDate] = useState(
    new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 10)
  );

  const [processes, setProcesses] = useState([
    { processCode: 'OP-10', processName: '航太鋁錠超精密粗車外徑', standardCycleTimeMinutes: 1.5 },
    { processCode: 'OP-20', processName: '五軸同動微米級流道銑削', standardCycleTimeMinutes: 4.2 },
    { processCode: 'OP-30', processName: '硬質超微弧陽極陶瓷化處理', standardCycleTimeMinutes: 2.0 },
    { processCode: 'OP-40', processName: '全尺寸雷射干涉儀真圓度品檢', standardCycleTimeMinutes: 1.8 },
  ]);

  if (!isOpen) return null;

  const handleAddProcess = () => {
    const nextSeq = (processes.length + 1) * 10;
    setProcesses([
      ...processes,
      {
        processCode: `OP-${nextSeq}`,
        processName: '新自訂製程工序',
        standardCycleTimeMinutes: 1.0,
      },
    ]);
  };

  const handleRemoveProcess = (idx: number) => {
    if (processes.length <= 1) return;
    setProcesses(processes.filter((_, i) => i !== idx));
  };

  const handleProcessChange = (idx: number, field: string, value: string | number) => {
    setProcesses(
      processes.map((p, i) => {
        if (i === idx) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedProcesses = processes.map((p, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      processCode: p.processCode,
      processName: p.processName,
      sequence: idx + 1,
      standardCycleTimeMinutes: Number(p.standardCycleTimeMinutes) || 1,
      targetQty: totalQty,
      completedGoodQty: 0,
      defectQty: 0,
      status: 'pending' as const,
    }));

    createWorkOrder({
      orderNo,
      customer,
      productModel,
      productName,
      partNumber,
      totalQty,
      priority,
      planStartDate,
      planEndDate,
      processes: formattedProcesses,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">建立新製造生產工單 (MO/WO)</h2>
            <p className="text-xs text-slate-500 mt-0.5">定義工單基本規格、生產目標數量與工藝製程路線 (Routing)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                工單號碼 (WO No.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                required
                className="w-full text-xs font-mono font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                客戶名稱 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                required
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                產品料號 (Part No.)
              </label>
              <input
                type="text"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                產品型號 (Model)
              </label>
              <input
                type="text"
                value={productModel}
                onChange={(e) => setProductModel(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                產品品名規格 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                預計生產總量 (件) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={totalQty}
                onChange={(e) => setTotalQty(Math.max(1, parseInt(e.target.value) || 1))}
                required
                className="w-full text-sm font-mono font-bold tabular-nums bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                排產優先度等級
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="urgent">特急件 (Urgent)</option>
                <option value="high">高優先 (High)</option>
                <option value="normal">一般排程 (Normal)</option>
                <option value="low">低優先 (Low)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                預計開工日
              </label>
              <input
                type="date"
                value={planStartDate}
                onChange={(e) => setPlanStartDate(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                預計完工交期
              </label>
              <input
                type="date"
                value={planEndDate}
                onChange={(e) => setPlanEndDate(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Processes list */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-800">
                製程工藝路線 (Routing Steps)
              </span>
              <button
                type="button"
                onClick={handleAddProcess}
                className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-950 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增工序</span>
              </button>
            </div>

            <div className="space-y-2">
              {processes.map((proc, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <span className="w-6 text-center font-mono font-bold text-slate-400">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={proc.processCode}
                    onChange={(e) => handleProcessChange(index, 'processCode', e.target.value)}
                    placeholder="工序編號"
                    className="w-20 font-mono font-semibold bg-white border border-slate-300 rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    value={proc.processName}
                    onChange={(e) => handleProcessChange(index, 'processName', e.target.value)}
                    placeholder="工序名稱說明"
                    className="flex-1 bg-white border border-slate-300 rounded px-2 py-1"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={proc.standardCycleTimeMinutes}
                      onChange={(e) =>
                        handleProcessChange(
                          index,
                          'standardCycleTimeMinutes',
                          parseFloat(e.target.value) || 1
                        )
                      }
                      title="標準單件工時(分)"
                      className="w-16 font-mono text-right bg-white border border-slate-300 rounded px-2 py-1 tabular-nums"
                    />
                    <span className="text-slate-500 text-[11px] whitespace-nowrap">分/件</span>
                  </div>
                  {processes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProcess(index)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
            >
              確認建立工單
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
