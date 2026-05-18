export type OrdersExportFilters = {
  search: string;
  statusFilter: string;
  dateFrom: string;
  dateTo: string;
};

export function buildOrdersExportQuery(filters: OrdersExportFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.statusFilter !== "all") params.set("status", filters.statusFilter);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  return params;
}
