import type { FactoryId } from "../../data/types";

export interface AnalysisPart {
  id: string;
  /** اسم القطعة / البند */
  name: string;
  qty: string;
  factory: FactoryId;
  department_id: string;
  task_id: string;
  optionalPlannedMinutes: number | null;
  /** لتضمينها عند الاستيراد إلى مشروع جديد */
  includeInWorkOrder: boolean;
}

export interface AnalysisLineItem {
  id: string;
  name: string;
  spec: string;
  qty: string;
  unit: string;
}

export interface WorkOrderAnalysisSession {
  id: string;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  mimeType: string;
  /** بيانات عامة مستخرجة أو معدّلة يدوياً */
  projectName: string;
  client: string;
  orderRef: string;
  notes: string;
  materials: AnalysisLineItem[];
  accessories: AnalysisLineItem[];
  parts: AnalysisPart[];
  /** آخر وقت تم فيه استيراد هذه الجلسة إلى «مشروع جديد» */
  lastImportedAt?: string | null;
}
