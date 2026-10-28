import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WorkOrder,
  WorkReport,
  Machine,
  Operator,
  DowntimeLog,
  ActiveWorkTimer,
  MachineStatus,
  WorkOrderStatus,
} from '../types';
import {
  INITIAL_WORK_ORDERS,
  INITIAL_WORK_REPORTS,
  INITIAL_MACHINES,
  INITIAL_OPERATORS,
  INITIAL_DOWNTIME_LOGS,
} from '../data/initialData';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  text: string;
}

interface AppContextType {
  workOrders: WorkOrder[];
  workReports: WorkReport[];
  machines: Machine[];
  operators: Operator[];
  downtimeLogs: DowntimeLog[];
  activeTimer: ActiveWorkTimer | null;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'info' | 'warning' | 'error', text: string) => void;
  removeToast: (id: string) => void;
  
  // Work Report Operations
  createWorkReport: (data: Omit<WorkReport, 'id' | 'reportNo' | 'createdAt' | 'yieldRate' | 'efficiencyRate'>) => WorkReport;
  approveWorkReport: (reportId: string, reviewerNotes?: string) => void;
  rejectWorkReport: (reportId: string, reason: string) => void;
  batchApproveReports: (reportIds: string[]) => void;
  deleteWorkReport: (reportId: string) => void;

  // Work Order Operations
  createWorkOrder: (order: Partial<WorkOrder>) => void;
  updateWorkOrderStatus: (orderId: string, status: WorkOrderStatus) => void;
  
  // Machine Operations
  updateMachineStatus: (machineId: string, status: MachineStatus) => void;
  createDowntimeLog: (data: Omit<DowntimeLog, 'id' | 'durationMinutes'>) => void;
  resolveDowntimeLog: (logId: string) => void;

  // Active Timer Operations
  startTimer: (params: {
    workOrderId: string;
    workOrderNo: string;
    processId: string;
    processCode: string;
    processName: string;
    operatorId: string;
    operatorName: string;
    machineId: string;
    machineCode: string;
    standardCycleTimeMinutes: number;
  }) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => ActiveWorkTimer | null;
  cancelTimer: () => void;

  // Data utils
  resetToDemoData: () => void;
  exportToCSV: () => void;
  exportToJSON: () => void;
}

const STORAGE_KEYS = {
  WORK_ORDERS: 'prowork_work_orders_v1',
  WORK_REPORTS: 'prowork_work_reports_v1',
  MACHINES: 'prowork_machines_v1',
  OPERATORS: 'prowork_operators_v1',
  DOWNTIME_LOGS: 'prowork_downtime_logs_v1',
  ACTIVE_TIMER: 'prowork_active_timer_v1',
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORK_ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_WORK_ORDERS;
    } catch {
      return INITIAL_WORK_ORDERS;
    }
  });

  const [workReports, setWorkReports] = useState<WorkReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORK_REPORTS);
      return saved ? JSON.parse(saved) : INITIAL_WORK_REPORTS;
    } catch {
      return INITIAL_WORK_REPORTS;
    }
  });

  const [machines, setMachines] = useState<Machine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MACHINES);
      return saved ? JSON.parse(saved) : INITIAL_MACHINES;
    } catch {
      return INITIAL_MACHINES;
    }
  });

  const [operators, setOperators] = useState<Operator[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OPERATORS);
      return saved ? JSON.parse(saved) : INITIAL_OPERATORS;
    } catch {
      return INITIAL_OPERATORS;
    }
  });

  const [downtimeLogs, setDowntimeLogs] = useState<DowntimeLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOWNTIME_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_DOWNTIME_LOGS;
    } catch {
      return INITIAL_DOWNTIME_LOGS;
    }
  });

  const [activeTimer, setActiveTimer] = useState<ActiveWorkTimer | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auto-sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORK_ORDERS, JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORK_REPORTS, JSON.stringify(workReports));
  }, [workReports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPERATORS, JSON.stringify(operators));
  }, [operators]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOWNTIME_LOGS, JSON.stringify(downtimeLogs));
  }, [downtimeLogs]);

  useEffect(() => {
    if (activeTimer) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(activeTimer));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
    }
  }, [activeTimer]);

  // Active Timer Interval
  useEffect(() => {
    if (!activeTimer || activeTimer.isPaused) return;

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev || prev.isPaused) return prev;
        return {
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isPaused]);

  const addToast = (type: 'success' | 'info' | 'warning' | 'error', text: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const createWorkReport = (
    data: Omit<WorkReport, 'id' | 'reportNo' | 'createdAt' | 'yieldRate' | 'efficiencyRate'>
  ): WorkReport => {
    const totalQty = data.goodQty + data.defectQty;
    const yieldRate = totalQty > 0 ? Number(((data.goodQty / totalQty) * 100).toFixed(1)) : 100;
    
    // Standard hours vs actual hours efficiency
    const efficiencyRate = data.durationHours > 0
      ? Number(((data.standardHours / data.durationHours) * 100).toFixed(1))
      : 100;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const reportNo = `RP-${dateStr}-${randomSuffix}`;

    const newReport: WorkReport = {
      ...data,
      id: 'rp-' + Date.now(),
      reportNo,
      yieldRate,
      efficiencyRate,
      status: 'pending_review',
      createdAt: now.toISOString(),
    };

    setWorkReports((prev) => [newReport, ...prev]);

    // Update corresponding work order process progress
    setWorkOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== data.workOrderId) return order;

        let totalCompleted = 0;
        let totalScrap = 0;

        const updatedProcesses = order.processes.map((proc) => {
          if (proc.id === data.processId) {
            const newGood = proc.completedGoodQty + data.goodQty;
            const newDefect = proc.defectQty + data.defectQty;
            const isCompleted = newGood >= proc.targetQty;
            return {
              ...proc,
              completedGoodQty: newGood,
              defectQty: newDefect,
              status: isCompleted ? ('completed' as const) : ('in_progress' as const),
            };
          }
          return proc;
        });

        // Determine if last process completed
        const lastProcess = updatedProcesses[updatedProcesses.length - 1];
        if (lastProcess) {
          totalCompleted = lastProcess.completedGoodQty;
          totalScrap = updatedProcesses.reduce((acc, p) => acc + p.defectQty, 0);
        }

        const isOrderComplete = totalCompleted >= order.totalQty;

        return {
          ...order,
          processes: updatedProcesses,
          completedQty: totalCompleted,
          scrapQty: totalScrap,
          status: isOrderComplete ? 'completed' : 'in_progress',
        };
      })
    );

    addToast('success', `報工單 ${reportNo} 已成功建立並提交審核`);
    return newReport;
  };

  const approveWorkReport = (reportId: string, reviewerNotes?: string) => {
    setWorkReports((prev) =>
      prev.map((rep) => {
        if (rep.id === reportId) {
          return {
            ...rep,
            status: 'approved',
            reviewedBy: '生管主管 (林課長)',
            reviewedAt: new Date().toISOString(),
            reviewerNotes: reviewerNotes || rep.reviewerNotes || '核准通過，工時無誤',
          };
        }
        return rep;
      })
    );
    addToast('success', '報工紀錄已核准確認');
  };

  const rejectWorkReport = (reportId: string, reason: string) => {
    setWorkReports((prev) =>
      prev.map((rep) => {
        if (rep.id === reportId) {
          return {
            ...rep,
            status: 'rejected',
            reviewedBy: '生管主管 (林課長)',
            reviewedAt: new Date().toISOString(),
            reviewerNotes: reason || '退回重報',
          };
        }
        return rep;
      })
    );
    addToast('warning', '報工紀錄已駁回退件');
  };

  const batchApproveReports = (reportIds: string[]) => {
    setWorkReports((prev) =>
      prev.map((rep) => {
        if (reportIds.includes(rep.id) && rep.status === 'pending_review') {
          return {
            ...rep,
            status: 'approved',
            reviewedBy: '生管主管 (批量核准)',
            reviewedAt: new Date().toISOString(),
            reviewerNotes: '批次審核通過',
          };
        }
        return rep;
      })
    );
    addToast('success', `已批量核准 ${reportIds.length} 筆報工單`);
  };

  const deleteWorkReport = (reportId: string) => {
    setWorkReports((prev) => prev.filter((r) => r.id !== reportId));
    addToast('info', '報工單已移除');
  };

  const createWorkOrder = (orderData: Partial<WorkOrder>) => {
    const id = 'wo-' + Date.now();
    const orderNo = orderData.orderNo || `WO-2026-${Math.floor(200 + Math.random() * 800)}`;
    
    const newOrder: WorkOrder = {
      id,
      orderNo,
      customer: orderData.customer || '新合作客戶',
      productModel: orderData.productModel || 'PROD-NEW-01',
      productName: orderData.productName || '客製精密零件',
      partNumber: orderData.partNumber || 'PN-' + Math.floor(1000 + Math.random() * 9000),
      totalQty: orderData.totalQty || 1000,
      completedQty: 0,
      scrapQty: 0,
      planStartDate: orderData.planStartDate || new Date().toISOString().slice(0, 10),
      planEndDate: orderData.planEndDate || new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 10),
      status: 'pending',
      priority: orderData.priority || 'normal',
      currentProcessIndex: 0,
      processes: orderData.processes && orderData.processes.length > 0 ? orderData.processes : [
        {
          id: id + '-p1',
          processCode: 'OP-10',
          processName: '進料檢驗與粗加工',
          sequence: 1,
          standardCycleTimeMinutes: 1.5,
          targetQty: orderData.totalQty || 1000,
          completedGoodQty: 0,
          defectQty: 0,
          status: 'pending',
        },
        {
          id: id + '-p2',
          processCode: 'OP-20',
          processName: '精密精修加工',
          sequence: 2,
          standardCycleTimeMinutes: 3.0,
          targetQty: orderData.totalQty || 1000,
          completedGoodQty: 0,
          defectQty: 0,
          status: 'pending',
        },
        {
          id: id + '-p3',
          processCode: 'OP-30',
          processName: '品質全檢與裝箱包裝',
          sequence: 3,
          standardCycleTimeMinutes: 0.8,
          targetQty: orderData.totalQty || 1000,
          completedGoodQty: 0,
          defectQty: 0,
          status: 'pending',
        },
      ],
      notes: orderData.notes,
    };

    setWorkOrders((prev) => [newOrder, ...prev]);
    addToast('success', `工單 ${newOrder.orderNo} 建立成功`);
  };

  const updateWorkOrderStatus = (orderId: string, status: WorkOrderStatus) => {
    setWorkOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
    addToast('info', `工單狀態已更新`);
  };

  const updateMachineStatus = (machineId: string, status: MachineStatus) => {
    setMachines((prev) =>
      prev.map((mc) => (mc.id === machineId ? { ...mc, status } : mc))
    );
    addToast('info', `機台狀態已更新為 ${status === 'running' ? '運轉中' : status === 'idle' ? '待機閒置' : status === 'maintenance' ? '例行保養' : '故障維修'}`);
  };

  const createDowntimeLog = (data: Omit<DowntimeLog, 'id' | 'durationMinutes'>) => {
    const newLog: DowntimeLog = {
      ...data,
      id: 'dt-' + Date.now(),
    };
    setDowntimeLogs((prev) => [newLog, ...prev]);
    
    // Also set machine status to breakdown or maintenance
    setMachines((prev) =>
      prev.map((mc) =>
        mc.id === data.machineId
          ? { ...mc, status: data.reason === 'maintenance' ? 'maintenance' : 'breakdown' }
          : mc
      )
    );

    addToast('warning', `已記錄機台 ${data.machineCode} 異常停機事件`);
  };

  const resolveDowntimeLog = (logId: string) => {
    const now = new Date();
    setDowntimeLogs((prev) =>
      prev.map((log) => {
        if (log.id === logId) {
          const start = new Date(log.startTime).getTime();
          const duration = Math.max(1, Math.round((now.getTime() - start) / 60000));
          
          // restore machine to running/idle
          setMachines((mList) =>
            mList.map((mc) =>
              mc.id === log.machineId ? { ...mc, status: 'idle' } : mc
            )
          );

          return {
            ...log,
            status: 'resolved',
            endTime: now.toISOString(),
            durationMinutes: duration,
          };
        }
        return log;
      })
    );
    addToast('success', '機台異常已排除並恢復待機');
  };

  // Timer controls
  const startTimer = (params: {
    workOrderId: string;
    workOrderNo: string;
    processId: string;
    processCode: string;
    processName: string;
    operatorId: string;
    operatorName: string;
    machineId: string;
    machineCode: string;
    standardCycleTimeMinutes: number;
  }) => {
    const newTimer: ActiveWorkTimer = {
      ...params,
      startTime: new Date().toISOString(),
      elapsedSeconds: 0,
      isPaused: false,
    };
    setActiveTimer(newTimer);

    // Update machine active info
    setMachines((prev) =>
      prev.map((mc) =>
        mc.id === params.machineId
          ? {
              ...mc,
              status: 'running',
              currentWorkOrderNo: params.workOrderNo,
              currentProcessName: params.processName,
              currentOperatorName: params.operatorName,
            }
          : mc
      )
    );

    addToast('info', `已啟動 ${params.workOrderNo} [${params.processName}] 計時報工`);
  };

  const pauseTimer = () => {
    setActiveTimer((prev) => (prev ? { ...prev, isPaused: true } : null));
    addToast('info', '計時已暫停');
  };

  const resumeTimer = () => {
    setActiveTimer((prev) => (prev ? { ...prev, isPaused: false } : null));
    addToast('info', '計時已繼續');
  };

  const stopTimer = () => {
    const current = activeTimer;
    setActiveTimer(null);
    return current;
  };

  const cancelTimer = () => {
    setActiveTimer(null);
    addToast('warning', '計時已取消');
  };

  const resetToDemoData = () => {
    setWorkOrders(INITIAL_WORK_ORDERS);
    setWorkReports(INITIAL_WORK_REPORTS);
    setMachines(INITIAL_MACHINES);
    setOperators(INITIAL_OPERATORS);
    setDowntimeLogs(INITIAL_DOWNTIME_LOGS);
    setActiveTimer(null);
    localStorage.removeItem(STORAGE_KEYS.WORK_ORDERS);
    localStorage.removeItem(STORAGE_KEYS.WORK_REPORTS);
    localStorage.removeItem(STORAGE_KEYS.MACHINES);
    localStorage.removeItem(STORAGE_KEYS.OPERATORS);
    localStorage.removeItem(STORAGE_KEYS.DOWNTIME_LOGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
    addToast('info', '已重置回原廠示範資料');
  };

  const exportToCSV = () => {
    const headers = [
      '報工單號',
      '工單號碼',
      '產品型號',
      '產品名稱',
      '製程工序',
      '作業人員',
      '員工工號',
      '使用機台',
      '開始時間',
      '結束時間',
      '實際工時(H)',
      '標準工時(H)',
      '良品數',
      '不良品數',
      '良率(%)',
      '效率達成率(%)',
      '審核狀態',
      '備註說明',
    ];

    const rows = workReports.map((r) => [
      `"${r.reportNo}"`,
      `"${r.workOrderNo}"`,
      `"${r.productModel}"`,
      `"${r.productName}"`,
      `"${r.processCode} ${r.processName}"`,
      `"${r.operatorName}"`,
      `"${r.employeeNo}"`,
      `"${r.machineCode}"`,
      `"${r.startTime.replace('T', ' ')}"`,
      `"${r.endTime.replace('T', ' ')}"`,
      r.durationHours.toFixed(2),
      r.standardHours.toFixed(2),
      r.goodQty,
      r.defectQty,
      `${r.yieldRate}%`,
      `${r.efficiencyRate}%`,
      r.status === 'approved' ? '已核准' : r.status === 'rejected' ? '已駁回' : '待審核',
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `報工管理系統_報工明細_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', '已成功匯出 CSV 報工報表');
  };

  const exportToJSON = () => {
    const data = {
      exportTime: new Date().toISOString(),
      workOrders,
      workReports,
      machines,
      operators,
      downtimeLogs,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `智造雲報工備份_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', '已成功下載系統完整 JSON 備份檔');
  };

  return (
    <AppContext.Provider
      value={{
        workOrders,
        workReports,
        machines,
        operators,
        downtimeLogs,
        activeTimer,
        toasts,
        addToast,
        removeToast,
        createWorkReport,
        approveWorkReport,
        rejectWorkReport,
        batchApproveReports,
        deleteWorkReport,
        createWorkOrder,
        updateWorkOrderStatus,
        updateMachineStatus,
        createDowntimeLog,
        resolveDowntimeLog,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        cancelTimer,
        resetToDemoData,
        exportToCSV,
        exportToJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
