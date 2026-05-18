import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@factory/components/ui/table";
import { formatDepartmentDisplayName } from "../../lib/departmentDisplayName";
import { useFactoryTranslation } from "../../lib/useFactoryTranslation";
import { cn } from "@factory/lib/utils";

type DeptRow = { departmentName?: string; departmentId?: string; count?: number };

type RowData = { name: string; count: number; index: number; sharePct: number };

function HeaderCells({ rtl, ft, headClass }: { rtl: boolean; ft: (k: string) => string; headClass: string }) {
  const dir = rtl ? "rtl" : "ltr";
  const rank = (
    <TableHead key="rank" dir={dir} className={cn(headClass, "w-10")}>
      {ft("dashboard.workforceDeptColRank")}
    </TableHead>
  );
  const name = (
    <TableHead key="name" dir={dir} className={headClass}>
      {ft("dashboard.workforceDeptColName")}
    </TableHead>
  );
  const count = (
    <TableHead key="count" dir={dir} className={cn(headClass, "w-24")}>
      {ft("dashboard.workforceDeptColCount")}
    </TableHead>
  );
  const share = (
    <TableHead key="share" dir={dir} className={cn(headClass, "w-20")}>
      {ft("dashboard.workforceDeptColShare")}
    </TableHead>
  );
  // RTL table: first column in DOM = rightmost (# on the right)
  const cols = rtl ? [rank, share, count, name] : [rank, name, count, share];
  return <>{cols}</>;
}

function DataCells({
  row,
  rtl,
  cellClass,
}: {
  row: RowData;
  rtl: boolean;
  cellClass: string;
}) {
  const dir = rtl ? "rtl" : "ltr";
  const rank = (
    <TableCell key="rank" dir={dir} className={cn(cellClass, "tabular-nums text-xs text-brand-metal")}>
      {row.index}
    </TableCell>
  );
  const name = (
    <TableCell
      key="name"
      dir={dir}
      className={cn(cellClass, "text-sm font-semibold text-[oklch(14%_0.02_50)]", rtl && "font-arabic")}
    >
      {row.name}
    </TableCell>
  );
  const count = (
    <TableCell key="count" dir={dir} className={cn(cellClass, "text-base font-bold tabular-nums text-brand-luxury")}>
      {row.count}
    </TableCell>
  );
  const share = (
    <TableCell key="share" dir={dir} className={cn(cellClass, "text-sm font-medium tabular-nums text-brand-metal")}>
      {row.sharePct}%
    </TableCell>
  );
  const cols = rtl ? [rank, share, count, name] : [rank, name, count, share];
  return <>{cols}</>;
}

export function WorkforceDepartmentChart({
  departments,
  rtl,
  className,
}: {
  departments: DeptRow[];
  rtl: boolean;
  className?: string;
}) {
  const { ft } = useFactoryTranslation();

  const rows = useMemo(() => {
    const sorted = [...(departments ?? [])]
      .map((d) => ({
        name: formatDepartmentDisplayName(
          String(d.departmentName || d.departmentId || "—"),
          d.departmentId,
        ),
        count: d.count ?? 0,
      }))
      .sort((a, b) => b.count - a.count);
    const totalCount = sorted.reduce((sum, r) => sum + r.count, 0);
    return sorted.map((row, index) => ({
      ...row,
      index: index + 1,
      sharePct: totalCount > 0 ? Math.round((row.count / totalCount) * 100) : 0,
    }));
  }, [departments]);

  const total = useMemo(() => rows.reduce((sum, r) => sum + r.count, 0), [rows]);

  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">—</p>;
  }

  const headClass = cn(
    "text-[11px] font-bold uppercase tracking-wider text-brand-metal",
    rtl ? "!text-right" : "!text-left",
  );
  const cellClass = cn("py-2.5 align-middle", rtl ? "!text-right" : "!text-left");

  return (
    <div className={cn("w-full min-w-0", className)} dir={rtl ? "rtl" : "ltr"} lang={rtl ? "ar" : "en"}>
      <Table dir={rtl ? "rtl" : "ltr"} className="w-full table-fixed">
        <colgroup>
          <col className={rtl ? "w-[8%]" : "w-[8%]"} />
          <col className={rtl ? "w-[16%]" : "w-[48%]"} />
          <col className={rtl ? "w-[20%]" : "w-[20%]"} />
          <col className={rtl ? "w-[48%]" : "w-[16%]"} />
        </colgroup>
        <TableHeader>
          <TableRow className="border-brand-border/60 hover:bg-transparent" dir={rtl ? "rtl" : "ltr"}>
            <HeaderCells rtl={rtl} ft={ft} headClass={headClass} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              dir={rtl ? "rtl" : "ltr"}
              className="border-brand-border/40 odd:bg-foreground/[0.03] hover:bg-foreground/[0.06]"
            >
              <DataCells row={row} rtl={rtl} cellClass={cellClass} />
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow
            dir={rtl ? "rtl" : "ltr"}
            className="border-t-2 border-brand-border/70 bg-foreground/[0.05] hover:bg-foreground/[0.05]"
          >
            {rtl ? (
              <>
                <TableCell dir="rtl" className={cellClass} />
                <TableCell dir="rtl" className={cn(cellClass, "text-sm font-medium tabular-nums text-brand-metal")}>
                  100%
                </TableCell>
                <TableCell dir="rtl" className={cn(cellClass, "text-base font-bold tabular-nums text-brand-luxury")}>
                  {total}
                </TableCell>
                <TableCell dir="rtl" className={cn(cellClass, "text-sm font-bold text-brand-luxury font-arabic")}>
                  {ft("dashboard.workforceDeptTotal")}
                </TableCell>
              </>
            ) : (
              <>
                <TableCell colSpan={2} className={cn(cellClass, "text-sm font-bold text-brand-luxury")}>
                  {ft("dashboard.workforceDeptTotal")}
                </TableCell>
                <TableCell className={cn(cellClass, "text-base font-bold tabular-nums text-brand-luxury")}>
                  {total}
                </TableCell>
                <TableCell className={cn(cellClass, "text-sm font-medium tabular-nums text-brand-metal")}>
                  100%
                </TableCell>
              </>
            )}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
