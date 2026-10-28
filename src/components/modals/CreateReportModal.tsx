import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { STANDARD_DEFECT_REASONS } from '../../data/initialData';
import { DefectDetail } from '../../types';
import { X, Play, ScanLine, AlertTriangle } from 'lucide-react';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFromTimer?: boolean;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  initialFromTimer = false,
}) => {
  const {
    workOrders,
    operators,
    machines,
    activeTimer,
    stopTimer,
    createWorkReport,
    startTimer,
    addToast,
  } = useApp();

  // Mode: 'timer_start' | 'manual_entry'
  const [mode, setMode] = useState<'timer_start' | 'manual_entry'>(
    initialFromTimer ? 'manual_entry' : 'manual_entry'
  );

  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedProcessId, setSelectedProcessId] = useState<string>('');
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');

  const [goodQty, setGoodQty] = useState<number>(50);
  const [defectQty, setDefectQty] = useState<number>(0);
  const [defectDetails, setDefectDetails] = useState<DefectDetail[]>([]);
  const [durationHours, setDurationHours] = useState<number>(2.0);
  const [notes, setNotes] = useState<string>('');

  // Barcode quick picker toggle
  const [showBarcodeSelector, setShowBarcodeSelector] = useState<boolean>(false);

  // Initialize from active timer if available
  useEffect(() => {
    if (initialFromTimer && activeTimer) {
      setSelectedOrderId(activeTimer.workOrderId);
      setSelectedProcessId(activeTimer.processId);
      setSelectedOperatorId(activeTimer.operatorId);
      setSelectedMachineId(activeTimer.machineId);
      
      // Calculate hours from elapsed seconds
      const hrs = Math.max(0.1, Number((activeTimer.elapsedSeconds / 3600).toFixed(2)));
      setDurationHours(hrs);

      // Estimate good qty based on standard cycle time
      const estimatedQty = activeTimer.standardCycleTimeMinutes > 0
        ? Math.max(1, Math.round((hrs * 60) / activeTimer.standardCycleTimeMinutes))
        : 30;
      setGoodQty(estimatedQty);
      setDefectQty(0);
      setMode('manual_entry');
    } else if (workOrders.length > 0 && !selectedOrderId) {
      const firstActive = workOrders.find((w) => w.status === 'in_progress') || workOrders[0];
      setSelectedOrderId(firstActive.id);
      if (firstActive.processes.length > 0) {
        setSelectedProcessId(firstActive.processes[0].id);
      }
      if (operators.length > 0) setSelectedOperatorId(operators[0].id);
      if (machines.length > 0) setSelectedMachineId(machines[0].id);
    }
  }, [isOpen, initialFromTimer, activeTimer, workOrders, operators, machines]);

  // When order changes, update process selection
  const currentOrder = workOrders.find((w) => w.id === selectedOrderId);
  useEffect(() => {
    if (currentOrder && currentOrder.processes.length > 0) {
      const activeProcess = currentOrder.processes.find((p) => p.status === 'in_progress') || currentOrder.processes[0];
      setSelectedProcessId(activeProcess.id);
      if (activeProcess.assignedMachineId) setSelectedMachineId(activeProcess.assignedMachineId);
      if (activeProcess.assignedOperatorId) setSelectedOperatorId(activeProcess.assignedOperatorId);
    }
  }, [selectedOrderId]);

  if (!isOpen) return null;

  const currentProcess = currentOrder?.processes.find((p) => p.id === selectedProcessId);
  const currentOperator = operators.find((o) => o.id === selectedOperatorId);
  const currentMachine = machines.find((m) => m.id === selectedMachineId);

  // Standard hours calculation
  const standardHours = currentProcess
    ? Number((((goodQty + defectQty) * currentProcess.standardCycleTimeMinutes) / 60).toFixed(2))
    : durationHours;

  const totalOutput = goodQty + defectQty;
  const yieldRate = totalOutput > 0 ? Number(((goodQty / totalOutput) * 100).toFixed(1)) : 100;
  const efficiencyRate = durationHours > 0 ? Number(((standardHours / durationHours) * 100).toFixed(1)) : 100;

  const handleDefectChange = (reasonCode: string, reasonName: string, delta: number) => {
    setDefectDetails((prev) => {
      const existing = prev.find((d) => d.reasonCode === reasonCode);
      let updated: DefectDetail[];
      if (existing) {
        const newCount = Math.max(0, existing.qty + delta);
        if (newCount === 0) {
          updated = prev.filter((d) => d.reasonCode !== reasonCode);
        } else {
          updated = prev.map((d) => (d.reasonCode === reasonCode ? { ...d, qty: newCount } : d));
        }
      } else if (delta > 0) {
        updated = [...prev, { reasonCode, reasonName, qty: delta }];
      } else {
        updated = prev;
      }
      
      const newTotalDefect = updated.reduce((sum, d) => sum + d.qty, 0);
      setDefectQty(newTotalDefect);
      return updated;
    });
  };

  const handleStartTimer = () => {
    if (!currentOrder || !currentProcess || !currentOperator || !currentMachine) {
      addToast('error', '請完整選擇工單、工序、作業員與機台');
      return;
    }

    startTimer({
      workOrderId: currentOrder.id,
      workOrderNo: currentOrder.orderNo,
      processId: currentProcess.id,
      processCode: currentProcess.processCode,
      processName: currentProcess.processName,
      operatorId: currentOperator.id,
      operatorName: currentOperator.name,
      machineId: currentMachine.id,
      machineCode: currentMachine.machineCode,
      standardCycleTimeMinutes: currentProcess.standardCycleTimeMinutes,
    });

    onClose();
  };

  const handleSubmitManualReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder || !currentProcess || !currentOperator || !currentMachine) {
      addToast('error', '請完整填寫報工資訊');
      return;
    }

    const now = new Date();
    const startTimeDate = new Date(now.getTime() - durationHours * 3600 * 1000);

    createWorkReport({
      workOrderId: currentOrder.id,
      workOrderNo: currentOrder.orderNo,
      productModel: currentOrder.productModel,
      productName: currentOrder.productName,
      processId: currentProcess.id,
      processCode: currentProcess.processCode,
      processName: currentProcess.processName,
      operatorId: currentOperator.id,
      operatorName: currentOperator.name,
      employeeNo: currentOperator.employeeNo,
      machineId: currentMachine.id,
      machineCode: currentMachine.machineCode,
      startTime: startTimeDate.toISOString(),
      endTime: now.toISOString(),
      durationHours,
      goodQty,
      defectQty,
      defectDetails,
      standardHours,
      status: 'pending_review',
      mode: initialFromTimer ? 'timer' : 'manual',
      notes,
    });

    if (initialFromTimer) {
      stopTimer();
    }

    onClose();
  };

  const handleSimulateScan = (order: typeof workOrders[0]) => {
    setSelectedOrderId(order.id);
    if (order.processes.length > 0) {
      setSelectedProcessId(order.processes[0].id);
      if (order.processes[0].assignedMachineId) {
        setSelectedMachineId(order.processes[0].assignedMachineId);
      }
    }
    setShowBarcodeSelector(false);
    addToast('info', `條碼掃描成功：已載入工單 ${order.orderNo}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialFromTimer ? '計時完工 · 結算報工單' : '現場作業報工單登記'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              回報實際投入工時、良品產出與不良損耗，即時同步工單進度
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barcode Simulator Notification Banner */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <ScanLine className="w-4 h-4 text-slate-600" />
            <span>支援車間條碼槍掃描或 RFID 感應輸入</span>
          </div>
          <button
            type="button"
            onClick={() => setShowBarcodeSelector(!showBarcodeSelector)}
            className="text-xs font-medium text-slate-900 underline hover:text-slate-600"
          >
            {showBarcodeSelector ? '關閉模擬掃描' : '點擊模擬掃描工單'}
          </button>
        </div>

        {/* Barcode Quick Picker Box */}
        {showBarcodeSelector && (
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-700 mb-2">快速模擬掃瞄工單 QR / Barcode：</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {workOrders.slice(0, 4).map((wo) => (
                <button
                  key={wo.id}
                  type="button"
                  onClick={() => handleSimulateScan(wo)}
                  className="p-2.5 text-left border border-slate-300 rounded-lg hover:border-slate-800 bg-white transition-all text-xs"
                >
                  <div className="font-mono font-bold text-slate-900">{wo.orderNo}</div>
                  <div className="text-slate-600 truncate">{wo.productName}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">目標: {wo.totalQty} 件</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitManualReport} className="p-6 space-y-5">
          {/* Action Mode Toggle (if not ending timer) */}
          {!initialFromTimer && (
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setMode('manual_entry')}
                className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                  mode === 'manual_entry'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                手動工時結報 (補報工時)
              </button>
              <button
                type="button"
                onClick={() => setMode('timer_start')}
                className={`flex-1 py-1.5 font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                  mode === 'timer_start'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                <span>現場即時起工 (秒錶計時)</span>
              </button>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Work Order */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                生產工單編號 <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                required
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {workOrders.map((wo) => (
                  <option key={wo.id} value={wo.id}>
                    {wo.orderNo} - {wo.productName} ({wo.completedQty}/{wo.totalQty})
                  </option>
                ))}
              </select>
            </div>

            {/* Process / Operation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                製程工序 (Routing) <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedProcessId}
                onChange={(e) => setSelectedProcessId(e.target.value)}
                required
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {currentOrder?.processes.map((proc) => (
                  <option key={proc.id} value={proc.id}>
                    {proc.processCode} {proc.processName} (標時 {proc.standardCycleTimeMinutes}m/件)
                  </option>
                ))}
              </select>
            </div>

            {/* Operator */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                報工作業員 <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedOperatorId}
                onChange={(e) => setSelectedOperatorId(e.target.value)}
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

            {/* Machine */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                使用機台設備 <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                required
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {machines.map((mc) => (
                  <option key={mc.id} value={mc.id}>
                    {mc.machineCode} · {mc.name} ({mc.line})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mode: Timer start confirmation */}
          {mode === 'timer_start' ? (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-start gap-3">
                <Play className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-emerald-950">確認啟動現場計時</h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    系統將將機台狀態標記為「運轉中」，並在頂部計時條即時累計工時。完工後點擊結算即可填寫良品數結案。
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleStartTimer}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                    >
                      立即起工計時
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('manual_entry')}
                      className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900"
                    >
                      改為手動報工
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Output & Scrap Numbers */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      本次良品產出 (件) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={goodQty}
                      onChange={(e) => setGoodQty(Math.max(0, parseInt(e.target.value) || 0))}
                      required
                      className="w-full text-sm font-mono font-bold tabular-nums bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      不良品報廢 (件)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={defectQty}
                      onChange={(e) => setDefectQty(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-sm font-mono font-bold tabular-nums bg-white border border-slate-300 rounded-lg px-3 py-2 text-rose-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      實際投入工時 (小時) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={durationHours}
                      onChange={(e) => setDurationHours(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                      required
                      className="w-full text-sm font-mono font-bold tabular-nums bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* Defect Reasons Breakdown */}
                {defectQty > 0 && (
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        不良品原因細項歸屬 (總計: {defectQty} 件)
                      </span>
                      <span className="text-[11px] text-slate-500">點擊增減各項瑕疵數</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {STANDARD_DEFECT_REASONS.map((r) => {
                        const count = defectDetails.find((d) => d.reasonCode === r.code)?.qty || 0;
                        return (
                          <div
                            key={r.code}
                            className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                              count > 0 ? 'bg-rose-50/70 border-rose-200 text-rose-900' : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="truncate pr-1">{r.name}</span>
                            <div className="flex items-center gap-1 shrink-0 font-mono">
                              <button
                                type="button"
                                onClick={() => handleDefectChange(r.code, r.name, -1)}
                                className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="w-5 text-center font-semibold tabular-nums">{count}</span>
                              <button
                                type="button"
                                onClick={() => handleDefectChange(r.code, r.name, 1)}
                                className="w-5 h-5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Real-time KPI Preview strip */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-slate-200 text-center text-xs">
                  <div>
                    <div className="text-slate-500">標準工時核算</div>
                    <div className="text-sm font-bold font-mono text-slate-800 mt-0.5 tabular-nums">
                      {standardHours} <span className="text-xs font-normal">小時</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">良品達成率</div>
                    <div
                      className={`text-sm font-bold font-mono mt-0.5 tabular-nums ${
                        yieldRate >= 95 ? 'text-emerald-700' : 'text-amber-600'
                      }`}
                    >
                      {yieldRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">工時效率達成率</div>
                    <div
                      className={`text-sm font-bold font-mono mt-0.5 tabular-nums ${
                        efficiencyRate >= 95 ? 'text-emerald-700' : 'text-amber-600'
                      }`}
                    >
                      {efficiencyRate}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  現場製程備註說明 (選填)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="例：加工刀具無崩刃磨損、原物料進料無刮傷、預計下個班次繼續..."
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
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
                  提交報工單審核
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
