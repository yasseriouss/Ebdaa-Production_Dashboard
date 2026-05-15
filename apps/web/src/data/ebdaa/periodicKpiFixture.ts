/** Starter KPI rows mirroring empty Excel templates — safe placeholders for `/planning`. */

export interface WeeklyKpiRow {
  week: string;
  from: string;
  to: string;
  projectsTotal: number;
  projectsDone: number;
  projectsActive: number;
  projectsLate: number;
  achievementPct: number;
  piecesProduced: number;
  defectivePieces: number;
  qualityPct: number;
  runtimeHours: number;
}

export interface MonthlyKpiRow {
  monthAr: string;
  year: number;
  projectsTotal: number;
  projectsDone: number;
  projectsLate: number;
  achievementPct: number;
  productionTotal: number;
  qualityPct: number;
  revenuePlanned: number;
  costs: number;
  marginPct: number;
  utilizationPct: number;
}

export const ebdaaWeeklyKpiFixture: WeeklyKpiRow[] = [
  {
    week: "W01",
    from: "2026-01-05",
    to: "2026-01-11",
    projectsTotal: 0,
    projectsDone: 0,
    projectsActive: 0,
    projectsLate: 0,
    achievementPct: 0,
    piecesProduced: 0,
    defectivePieces: 0,
    qualityPct: 0,
    runtimeHours: 0,
  },
  {
    week: "W02",
    from: "2026-01-12",
    to: "2026-01-18",
    projectsTotal: 0,
    projectsDone: 0,
    projectsActive: 0,
    projectsLate: 0,
    achievementPct: 0,
    piecesProduced: 0,
    defectivePieces: 0,
    qualityPct: 0,
    runtimeHours: 0,
  },
];

/** Mirrors sheet 3 in `المتابعة_الدورية_الشاملة.xlsx` (half-year windows). */
export interface HalfYearKpiRow {
  periodAr: string;
  year: number;
  projectsTotal: number;
  projectsDone: number;
  achievementPct: number;
  productionTotal: number;
  qualityPct: number;
  revenue: number;
  costs: number;
  netProfit: number;
  marginPct: number;
  goalsAchievedAr: string;
}

/** Mirrors sheet 4 (annual summary). */
export interface YearlyKpiRow {
  year: number;
  projectsTotal: number;
  projectsDone: number;
  achievementPct: number;
  productionTotal: number;
  qualityPct: number;
  revenue: number;
  costs: number;
  netProfit: number;
  marginPct: number;
  growthPct: number;
  investments: number;
}

export const ebdaaHalfYearKpiFixture: HalfYearKpiRow[] = [
  {
    periodAr: "النصف الأول (يناير - يونيو)",
    year: 2026,
    projectsTotal: 0,
    projectsDone: 0,
    achievementPct: 0,
    productionTotal: 0,
    qualityPct: 0,
    revenue: 0,
    costs: 0,
    netProfit: 0,
    marginPct: 0,
    goalsAchievedAr: "—",
  },
  {
    periodAr: "النصف الثاني (يوليو - ديسمبر)",
    year: 2026,
    projectsTotal: 0,
    projectsDone: 0,
    achievementPct: 0,
    productionTotal: 0,
    qualityPct: 0,
    revenue: 0,
    costs: 0,
    netProfit: 0,
    marginPct: 0,
    goalsAchievedAr: "—",
  },
];

export const ebdaaYearlyKpiFixture: YearlyKpiRow[] = [
  {
    year: 2026,
    projectsTotal: 0,
    projectsDone: 0,
    achievementPct: 0,
    productionTotal: 0,
    qualityPct: 0,
    revenue: 0,
    costs: 0,
    netProfit: 0,
    marginPct: 0,
    growthPct: 0,
    investments: 0,
  },
];

export const ebdaaMonthlyKpiFixture: MonthlyKpiRow[] = [
  {
    monthAr: "يناير",
    year: 2026,
    projectsTotal: 0,
    projectsDone: 0,
    projectsLate: 0,
    achievementPct: 0,
    productionTotal: 0,
    qualityPct: 0,
    revenuePlanned: 0,
    costs: 0,
    marginPct: 0,
    utilizationPct: 0,
  },
  {
    monthAr: "فبراير",
    year: 2026,
    projectsTotal: 0,
    projectsDone: 0,
    projectsLate: 0,
    achievementPct: 0,
    productionTotal: 0,
    qualityPct: 0,
    revenuePlanned: 0,
    costs: 0,
    marginPct: 0,
    utilizationPct: 0,
  },
];
