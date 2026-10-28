export type WorkOrderStatus = 'pending' | 'in_progress' | 'paused' | 'completed';
export type PriorityLevel = 'urgent' | 'high' | 'normal' | 'low';
export type ReportStatus = 'pending_review' | 'approved' | 'rejected';
export type MachineStatus = 'running' | 'idle' | 'maintenance' | 'breakdown';
export type OperatorRole = 'operator' | 'inspector' | 'line_lead' | 'supervisor';
export type ShiftType = 'day' | 'night' | 'middle';

export interface DefectDetail {
  reasonCode: string;
  reasonName: string;
  qty: number;
}

export interface WorkOrderProcess {
  id: string;
  processCode: string; // e.g. OP-10, OP-20
  processName: string; // e.g. 備料裁切, CNC車銑
  sequence: number;
  standardCycleTimeMinutes: number; // 單件標準工時 (分)
  targetQty: number;
  completedGoodQty: number;
  defectQty: number;
  status: 'pending' | 'in_progress' | 'completed';
  assignedMachineId?: string;
  assignedOperatorId?: string;
}

export interface WorkOrder {
  id: string;
  orderNo: string; // e.g. WO-2026-101
  customer: string;
  productModel: string;
  productName: string;
  partNumber: string;
  totalQty: number;
  completedQty: number;
  scrapQty: number;
  planStartDate: string;
  planEndDate: string;
  status: WorkOrderStatus;
  priority: PriorityLevel;
  currentProcessIndex: number;
  processes: WorkOrderProcess[];
  notes?: string;
}

export interface Operator {
  id: string;
  employeeNo: string;
  name: string;
  department: string;
  skillLevel: 'Senior' | 'Intermediate' | 'Junior' | 'Lead';
  role: OperatorRole;
  shift: ShiftType;
  hourlyRate: number;
  phone?: string;
}

export interface Machine {
  id: string;
  machineCode: string; // e.g. MC-01
  name: string;
  model: string;
  line: string;
  status: MachineStatus;
  currentWorkOrderNo?: string;
  currentProcessName?: string;
  currentOperatorName?: string;
  utilizationRate: number; // % 稼動率
  lastMaintenanceDate: string;
}

export interface WorkReport {
  id: string;
  reportNo: string; // e.g. RP-20261012-001
  workOrderId: string;
  workOrderNo: string;
  productModel: string;
  productName: string;
  processId: string;
  processCode: string;
  processName: string;
  operatorId: string;
  operatorName: string;
  employeeNo: string;
  machineId: string;
  machineCode: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  durationHours: number; // 實際工時 (小時)
  goodQty: number;   // 良品數
  defectQty: number; // 不良數
  defectDetails: DefectDetail[];
  standardHours: number; // 標準工時 (小時)
  efficiencyRate: number; // 效率達成率 (標準/實際 * 100)%
  yieldRate: number; // 良率 (良品 / 總產出 * 100)%
  status: ReportStatus;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  mode: 'timer' | 'manual' | 'batch';
  createdAt: string;
  notes?: string;
}

export interface ActiveWorkTimer {
  workOrderId: string;
  workOrderNo: string;
  processId: string;
  processCode: string;
  processName: string;
  operatorId: string;
  operatorName: string;
  machineId: string;
  machineCode: string;
  startTime: string; // ISO
  elapsedSeconds: number;
  isPaused: boolean;
  standardCycleTimeMinutes: number;
}

export interface DowntimeLog {
  id: string;
  machineId: string;
  machineCode: string;
  machineName: string;
  reason: 'material_shortage' | 'machine_breakdown' | 'mold_change' | 'quality_abnormal' | 'maintenance' | 'other';
  reasonText: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  reportedBy: string;
  status: 'ongoing' | 'resolved';
  notes?: string;
}
