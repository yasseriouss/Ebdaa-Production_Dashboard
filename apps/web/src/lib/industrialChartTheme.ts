/** Recharts-friendly tokens aligned with ENCID industrial theme CSS variables. */
export const industrialChartTheme = {
  metal: "var(--theme-brand-metal)",
  wood: "var(--theme-brand-wood)",
  grid: "var(--theme-brand-border)",
  axis: "var(--theme-brand-metal)",
  tooltip: {
    background: "var(--theme-brand-elevated)",
    border: "var(--theme-brand-border)",
    text: "var(--theme-brand-luxury)",
  },
} as const;

export const chartTooltipProps = {
  contentStyle: {
    backgroundColor: industrialChartTheme.tooltip.background,
    border: `1px solid ${industrialChartTheme.tooltip.border}`,
    fontSize: "10px",
  },
  itemStyle: { color: industrialChartTheme.tooltip.text },
} as const;
