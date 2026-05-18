import type { DepartmentId, Factory, FactoryCapacitySchema } from "../types";

/**
 * Canonical operations + capacity model for the two facilities. Sourced from
 * `Data/gem_Claude/factory_capacity_schema (2).json`; transcribed into TS so
 * the experiments folder is not pulled into the bundle.
 *
 * `DEPT_PACKAGING` is appended to the wood factory because the work-order
 * routing references it even though the upstream operations schema omits it.
 * Treat its capacity numbers as planning placeholders until the data team
 * confirms real values.
 */
export const factoryCapacityFixture: FactoryCapacitySchema = {
  metal_factory: {
    factory_id: "MF-001",
    name: "مصنع تشكيل المعادن",
    departments: [
      {
        id: "DEPT_PREP",
        name: "قسم تجهيز الصاج والقص الأولي",
        process_step: 1,
        description: "فك اللفائف وتفصيل الألواح والمقاطع لتقليل الهالك",
        tasks: [
          {
            id: "TASK_COIL",
            name: "الكويل",
            type: "Handling",
            capacity_metrics: { unit_of_measure: "Ton", cycle_time_seconds: 1800, setup_time_minutes: 30, batch_size: 1, efficiency_factor: 0.9, max_capacity_per_hour: 2 },
            cost_center_info: { hourly_operating_cost: 200, labor_required: 2 },
          },
          {
            id: "TASK_SHEAR",
            name: "المقص",
            type: "Cutting",
            capacity_metrics: { unit_of_measure: "Sheet", cycle_time_seconds: 60, setup_time_minutes: 10, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 60 },
            cost_center_info: { hourly_operating_cost: 150, labor_required: 1 },
          },
          {
            id: "TASK_LASER",
            name: "الليزر",
            type: "Precision Cutting",
            capacity_metrics: { unit_of_measure: "Sheet", cycle_time_seconds: 300, setup_time_minutes: 15, batch_size: 1, efficiency_factor: 0.95, max_capacity_per_hour: 12 },
            cost_center_info: { hourly_operating_cost: 400, labor_required: 1 },
          },
          {
            id: "TASK_PUNCH",
            name: "البانش",
            type: "Punching",
            capacity_metrics: { unit_of_measure: "Sheet", cycle_time_seconds: 180, setup_time_minutes: 20, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 20 },
            cost_center_info: { hourly_operating_cost: 250, labor_required: 1 },
          },
          {
            id: "TASK_SAW",
            name: "الديسك والمنشار",
            type: "Section Cutting",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 30, setup_time_minutes: 5, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 120 },
            cost_center_info: { hourly_operating_cost: 80, labor_required: 1 },
          },
          {
            id: "TASK_NOTCH",
            name: "التخليع",
            type: "Notching",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 45, setup_time_minutes: 10, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 80 },
            cost_center_info: { hourly_operating_cost: 100, labor_required: 1 },
          },
        ],
      },
      {
        id: "DEPT_FORMING",
        name: "قسم التشكيل الميكانيكي",
        process_step: 2,
        description: "تحويل القطع إلى 3D وتشكيل المواسير والثقوب",
        tasks: [
          {
            id: "TASK_BENDING",
            name: "التنايات",
            type: "Bending",
            capacity_metrics: { unit_of_measure: "Bend", cycle_time_seconds: 40, setup_time_minutes: 15, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 90 },
            cost_center_info: { hourly_operating_cost: 180, labor_required: 1 },
          },
          {
            id: "TASK_PRESS",
            name: "مكابس وتكويع",
            type: "Stamping",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 10, setup_time_minutes: 25, batch_size: 1, efficiency_factor: 0.75, max_capacity_per_hour: 360 },
            cost_center_info: { hourly_operating_cost: 200, labor_required: 2 },
          },
          {
            id: "TASK_DRILL",
            name: "المثقاب",
            type: "Drilling",
            capacity_metrics: { unit_of_measure: "Hole", cycle_time_seconds: 15, setup_time_minutes: 5, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 240 },
            cost_center_info: { hourly_operating_cost: 60, labor_required: 1 },
          },
        ],
      },
      {
        id: "DEPT_WELDING",
        name: "قسم اللحام",
        process_step: 3,
        description: "التجميع الإنشائي للمنتج باختلاف الخامات",
        tasks: [
          {
            id: "WELD_CO2",
            name: "لحام CO2",
            type: "Welding",
            capacity_metrics: { unit_of_measure: "Meter", cycle_time_seconds: 300, setup_time_minutes: 10, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 12 },
            cost_center_info: { hourly_operating_cost: 120, labor_required: 1 },
          },
          {
            id: "WELD_ARGON",
            name: "لحام أرجون ستانلس",
            type: "Welding",
            capacity_metrics: { unit_of_measure: "Meter", cycle_time_seconds: 600, setup_time_minutes: 15, batch_size: 1, efficiency_factor: 0.75, max_capacity_per_hour: 6 },
            cost_center_info: { hourly_operating_cost: 180, labor_required: 1 },
          },
          {
            id: "WELD_COPPER",
            name: "لحام نحاس",
            type: "Brazing",
            capacity_metrics: { unit_of_measure: "Joint", cycle_time_seconds: 120, setup_time_minutes: 10, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 30 },
            cost_center_info: { hourly_operating_cost: 150, labor_required: 1 },
          },
          {
            id: "WELD_SPOT",
            name: "لحام بنطة",
            type: "Spot Welding",
            capacity_metrics: { unit_of_measure: "Spot", cycle_time_seconds: 5, setup_time_minutes: 5, batch_size: 1, efficiency_factor: 0.9, max_capacity_per_hour: 720 },
            cost_center_info: { hourly_operating_cost: 90, labor_required: 1 },
          },
        ],
      },
      {
        id: "DEPT_FINISHING",
        name: "قسم المعالجة وتشطيب الأسطح",
        process_step: 4,
        description: "إزالة الزوائد والوصول للمظهر النهائي خاصة للستانلس",
        tasks: [
          {
            id: "FINISH_GRIND",
            name: "تجليخ",
            type: "Grinding",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 180, setup_time_minutes: 5, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 20 },
            cost_center_info: { hourly_operating_cost: 100, labor_required: 1 },
          },
          {
            id: "FINISH_STAINLESS",
            name: "تشطيب استالنس",
            type: "Polishing",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 900, setup_time_minutes: 10, batch_size: 1, efficiency_factor: 0.7, max_capacity_per_hour: 4 },
            cost_center_info: { hourly_operating_cost: 160, labor_required: 1 },
          },
        ],
      },
      {
        id: "DEPT_COATING_ASSY",
        name: "قسم الدهان والتجميع النهائي",
        process_step: 5,
        description: "التغطية النهائية وتجميع المكونات غير المعدنية",
        tasks: [
          {
            id: "COAT_PAINT",
            name: "الدهان",
            type: "Coating",
            capacity_metrics: { unit_of_measure: "Batch", cycle_time_seconds: 3600, setup_time_minutes: 45, batch_size: 50, efficiency_factor: 0.85, max_capacity_per_hour: 50 },
            cost_center_info: { hourly_operating_cost: 500, labor_required: 3 },
          },
          {
            id: "FINAL_ASSY",
            name: "التجميع",
            type: "Assembly",
            capacity_metrics: { unit_of_measure: "Product", cycle_time_seconds: 1200, setup_time_minutes: 10, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 3 },
            cost_center_info: { hourly_operating_cost: 120, labor_required: 2 },
          },
        ],
      },
    ],
  },
  woodworking_factory: {
    factory_id: "WF-001",
    name: "مصنع الأخشاب والأثاث",
    departments: [
      {
        id: "DEPT_SOLID_WOOD",
        name: "قسم الخشب الطبيعي",
        process_step: 1,
        description: "تجهيز وتشكيل الأخشاب الطبيعية والقوائم",
        tasks: [
          {
            id: "SAW_BAND",
            name: "منشار شريط طبيعي",
            type: "Cutting",
            capacity_metrics: { unit_of_measure: "Meter", cycle_time_seconds: 60, setup_time_minutes: 10, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 60 },
            cost_center_info: { hourly_operating_cost: 120, labor_required: 2 },
          },
          {
            id: "PLANER",
            name: "ماكينة رابوه",
            type: "Leveling",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 45, setup_time_minutes: 5, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 80 },
            cost_center_info: { hourly_operating_cost: 100, labor_required: 1 },
          },
          {
            id: "THICKNESSER",
            name: "ماكينة تخانة",
            type: "Thicknessing",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 30, setup_time_minutes: 10, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 120 },
            cost_center_info: { hourly_operating_cost: 110, labor_required: 1 },
          },
          {
            id: "SAW_CIRC",
            name: "منشار صينية",
            type: "Cutting",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 40, setup_time_minutes: 5, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 90 },
            cost_center_info: { hourly_operating_cost: 90, labor_required: 1 },
          },
          {
            id: "SAW_DISC_MAN",
            name: "دسك يدوي",
            type: "Cutting",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 20, setup_time_minutes: 2, batch_size: 1, efficiency_factor: 0.9, max_capacity_per_hour: 180 },
            cost_center_info: { hourly_operating_cost: 60, labor_required: 1 },
          },
          {
            id: "SAW_MULTI",
            name: "منشار تقطيع متعدد",
            type: "Rip Sawing",
            capacity_metrics: { unit_of_measure: "Meter", cycle_time_seconds: 15, setup_time_minutes: 15, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 240 },
            cost_center_info: { hourly_operating_cost: 150, labor_required: 2 },
          },
        ],
      },
      {
        id: "DEPT_PANEL_PROC",
        name: "قسم المسطحات",
        process_step: 2,
        description: "تقطيع وحفر ولصق حواف الألواح الصناعية",
        tasks: [
          {
            id: "PANEL_CUT",
            name: "المقطع",
            type: "Sizing",
            capacity_metrics: { unit_of_measure: "Sheet", cycle_time_seconds: 300, setup_time_minutes: 15, batch_size: 3, efficiency_factor: 0.9, max_capacity_per_hour: 36 },
            cost_center_info: { hourly_operating_cost: 300, labor_required: 2 },
          },
          {
            id: "SAW_SLIDE",
            name: "مقطع سحاب",
            type: "Sizing",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 120, setup_time_minutes: 5, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 30 },
            cost_center_info: { hourly_operating_cost: 150, labor_required: 1 },
          },
          {
            id: "EDGE_BANDING",
            name: "ماكينة لصق شريط",
            type: "Edge Banding",
            capacity_metrics: { unit_of_measure: "Meter", cycle_time_seconds: 10, setup_time_minutes: 20, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 360 },
            cost_center_info: { hourly_operating_cost: 250, labor_required: 1 },
          },
          {
            id: "CNC_ROUTER",
            name: "الراوتر",
            type: "CNC",
            capacity_metrics: { unit_of_measure: "Sheet", cycle_time_seconds: 600, setup_time_minutes: 15, batch_size: 1, efficiency_factor: 0.95, max_capacity_per_hour: 6 },
            cost_center_info: { hourly_operating_cost: 400, labor_required: 1 },
          },
          {
            id: "BORING",
            name: "التخريم",
            type: "Boring",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 45, setup_time_minutes: 15, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 80 },
            cost_center_info: { hourly_operating_cost: 180, labor_required: 1 },
          },
          {
            id: "DOUBLE_END",
            name: "ماكينة دبل إيند",
            type: "Tenoning",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 20, setup_time_minutes: 30, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 180 },
            cost_center_info: { hourly_operating_cost: 300, labor_required: 2 },
          },
        ],
      },
      {
        id: "DEPT_VENEER",
        name: "قسم القشرة والمكابس",
        process_step: 3,
        description: "قص وخياطة وكبس القشرة على المسطحات",
        tasks: [
          {
            id: "VEN_CLIP",
            name: "ماكينة مقص القشرة",
            type: "Cutting",
            capacity_metrics: { unit_of_measure: "Bundle", cycle_time_seconds: 120, setup_time_minutes: 10, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 30 },
            cost_center_info: { hourly_operating_cost: 100, labor_required: 1 },
          },
          {
            id: "VEN_STITCH",
            name: "ماكينة خياطة قشرة",
            type: "Stitching",
            capacity_metrics: { unit_of_measure: "Sheet", cycle_time_seconds: 180, setup_time_minutes: 5, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 20 },
            cost_center_info: { hourly_operating_cost: 90, labor_required: 1 },
          },
          {
            id: "GLUER",
            name: "غراية",
            type: "Gluing",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 30, setup_time_minutes: 15, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 120 },
            cost_center_info: { hourly_operating_cost: 150, labor_required: 2 },
          },
          {
            id: "PRESS_FLAT",
            name: "مكبس مسطح",
            type: "Pressing",
            capacity_metrics: { unit_of_measure: "Batch", cycle_time_seconds: 600, setup_time_minutes: 10, batch_size: 5, efficiency_factor: 0.9, max_capacity_per_hour: 30 },
            cost_center_info: { hourly_operating_cost: 200, labor_required: 2 },
          },
          {
            id: "PRESS_LAYER",
            name: "مكبس طبقات",
            type: "Pressing",
            capacity_metrics: { unit_of_measure: "Batch", cycle_time_seconds: 900, setup_time_minutes: 15, batch_size: 10, efficiency_factor: 0.9, max_capacity_per_hour: 40 },
            cost_center_info: { hourly_operating_cost: 250, labor_required: 2 },
          },
        ],
      },
      {
        id: "DEPT_JOINERY",
        name: "قسم الحلايا والنجارة الدقيقة",
        process_step: 4,
        description: "تشكيل الحلوق والشمابر وأعمال النقر واللسان",
        tasks: [
          {
            id: "DOOR_FRAME",
            name: "ماكينة تشكيل حلق الباب",
            type: "Molding",
            capacity_metrics: { unit_of_measure: "Meter", cycle_time_seconds: 30, setup_time_minutes: 20, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 120 },
            cost_center_info: { hourly_operating_cost: 150, labor_required: 1 },
          },
          {
            id: "ARCHITRAVE",
            name: "ماكينة شمبران",
            type: "Molding",
            capacity_metrics: { unit_of_measure: "Meter", cycle_time_seconds: 15, setup_time_minutes: 15, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 240 },
            cost_center_info: { hourly_operating_cost: 120, labor_required: 1 },
          },
          {
            id: "MORTISER",
            name: "منقار يدوي",
            type: "Mortising",
            capacity_metrics: { unit_of_measure: "Hole", cycle_time_seconds: 45, setup_time_minutes: 5, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 80 },
            cost_center_info: { hourly_operating_cost: 80, labor_required: 1 },
          },
        ],
      },
      {
        id: "DEPT_SANDING",
        name: "قسم الصنفرة",
        process_step: 5,
        description: "تنعيم الأسطح والحلايا لتهيئتها للدهان",
        tasks: [
          {
            id: "SAND_WIDE",
            name: "صنفرة",
            type: "Sanding",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 60, setup_time_minutes: 15, batch_size: 1, efficiency_factor: 0.9, max_capacity_per_hour: 60 },
            cost_center_info: { hourly_operating_cost: 200, labor_required: 1 },
          },
          {
            id: "SAND_DRUM",
            name: "ماكينة صنفرة دولاب",
            type: "Sanding",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 120, setup_time_minutes: 10, batch_size: 1, efficiency_factor: 0.85, max_capacity_per_hour: 30 },
            cost_center_info: { hourly_operating_cost: 120, labor_required: 1 },
          },
          {
            id: "SAND_PROF",
            name: "ماكينة صنفرة حلايا",
            type: "Sanding",
            capacity_metrics: { unit_of_measure: "Meter", cycle_time_seconds: 10, setup_time_minutes: 20, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 360 },
            cost_center_info: { hourly_operating_cost: 150, labor_required: 1 },
          },
        ],
      },
      {
        id: "DEPT_UPHOLSTERY",
        name: "قسم التنجيد",
        process_step: 6,
        description: "تجهيز وخياطة الأقمشة",
        tasks: [
          {
            id: "SEW_FABRIC",
            name: "ماكينة خياطة قماش",
            type: "Sewing",
            capacity_metrics: { unit_of_measure: "Meter", cycle_time_seconds: 180, setup_time_minutes: 5, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 20 },
            cost_center_info: { hourly_operating_cost: 80, labor_required: 1 },
          },
        ],
      },
      {
        id: "DEPT_WOOD_PAINT",
        name: "قسم الدهانات",
        process_step: 7,
        description: "عزل وتلوين الأخشاب في بيئة معزولة",
        tasks: [
          {
            id: "PAINT_BOOTH",
            name: "كابينة دهانات",
            type: "Spray Painting",
            capacity_metrics: { unit_of_measure: "Batch", cycle_time_seconds: 1800, setup_time_minutes: 30, batch_size: 20, efficiency_factor: 0.85, max_capacity_per_hour: 40 },
            cost_center_info: { hourly_operating_cost: 350, labor_required: 2 },
          },
        ],
      },
      {
        id: "DEPT_WOOD_ASSY",
        name: "قسم التجميع",
        process_step: 8,
        description: "تجميع الكبائن والتقفيل النهائي",
        tasks: [
          {
            id: "PRESS_CARCASS",
            name: "ماكينة كبس العلب",
            type: "Carcass Pressing",
            capacity_metrics: { unit_of_measure: "Cabinet", cycle_time_seconds: 300, setup_time_minutes: 10, batch_size: 1, efficiency_factor: 0.9, max_capacity_per_hour: 12 },
            cost_center_info: { hourly_operating_cost: 180, labor_required: 2 },
          },
          {
            id: "WOOD_ASSY_MAN",
            name: "التجميع",
            type: "Manual Assembly",
            capacity_metrics: { unit_of_measure: "Cabinet", cycle_time_seconds: 1800, setup_time_minutes: 0, batch_size: 1, efficiency_factor: 0.8, max_capacity_per_hour: 2 },
            cost_center_info: { hourly_operating_cost: 150, labor_required: 2 },
          },
        ],
      },
      {
        id: "DEPT_PACKAGING",
        name: "قسم التغليف",
        process_step: 9,
        description: "تغليف المنتج النهائي وتجهيزه للشحن (مرحلة مضافة من تدفق أوامر التشغيل).",
        tasks: [
          {
            id: "PACK_MANUAL",
            name: "تغليف يدوي",
            type: "Packaging",
            capacity_metrics: { unit_of_measure: "Piece", cycle_time_seconds: 240, setup_time_minutes: 5, batch_size: 1, efficiency_factor: 0.9, max_capacity_per_hour: 15 },
            cost_center_info: { hourly_operating_cost: 70, labor_required: 1 },
          },
        ],
      },
      {
        id: "DEPT_MAINTENANCE",
        name: "قسم الصيانة",
        process_step: 10,
        description: "الصيانة الوقائية والأعطال، والمرافق المصنعية بما فيها الهواء المضغوط.",
        tasks: [
          {
            id: "COMPRESSED_AIR_PLANT",
            name: "محطات الهواء المضغوط (KAESER)",
            type: "Utilities",
            capacity_metrics: {
              unit_of_measure: "m³/min",
              cycle_time_seconds: 0,
              setup_time_minutes: 0,
              batch_size: 1,
              efficiency_factor: 0.92,
              max_capacity_per_hour: 1,
            },
            cost_center_info: { hourly_operating_cost: 45, labor_required: 1 },
          },
        ],
      },
    ],
  },
};

/** Helper: find a department by id across both factories. */
export function findDepartment(deptId: string) {
  const all = [
    ...factoryCapacityFixture.metal_factory.departments,
    ...factoryCapacityFixture.woodworking_factory.departments,
  ];
  return all.find((d) => d.id === deptId);
}

/**
 * Optional org chart: child department → parent department (same factory).
 * Extend when HR/org confirms more lines; UI reads this for labels only.
 */
export const DEPARTMENT_REPORTS_TO: Partial<Record<DepartmentId, DepartmentId>> = {
  /** Veneer/press work is run as a line under panel & CNC in many plants. */
  DEPT_VENEER: "DEPT_PANEL_PROC",
  /** Packaging is the outbound tail of the assembly area in work-order flow. */
  DEPT_PACKAGING: "DEPT_WOOD_ASSY",
};

/** Resolve which top-level factory record owns this department id. */
export function getDepartmentFactory(deptId: DepartmentId): Factory | undefined {
  if (factoryCapacityFixture.woodworking_factory.departments.some((d) => d.id === deptId)) {
    return factoryCapacityFixture.woodworking_factory;
  }
  if (factoryCapacityFixture.metal_factory.departments.some((d) => d.id === deptId)) {
    return factoryCapacityFixture.metal_factory;
  }
  return undefined;
}
