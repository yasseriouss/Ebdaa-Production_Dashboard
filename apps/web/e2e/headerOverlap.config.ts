export interface HeaderOverlapScenario {
  name: string;
  route: string;
  viewport: { width: number; height: number };
  sidebar?: "expanded" | "collapsed";
  maxDiffPixelRatio?: number;
}

export const overlapScenarios: HeaderOverlapScenario[] = [
  {
    name: "desktop-rtl-expanded",
    route: "/",
    viewport: { width: 1280, height: 720 },
    sidebar: "expanded",
  },
  {
    name: "desktop-rtl-collapsed",
    route: "/",
    viewport: { width: 1280, height: 720 },
    sidebar: "collapsed",
  },
  {
    name: "desktop-rtl-production",
    route: "/production",
    viewport: { width: 1280, height: 720 },
  },
  {
    name: "mobile-rtl",
    route: "/",
    viewport: { width: 390, height: 844 },
    maxDiffPixelRatio: 0.02,
  },
];
