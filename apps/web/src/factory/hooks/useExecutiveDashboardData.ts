import {
  useGetDashboardClients,
  useGetDashboardStats,
  useGetEmployeeStats,
  useGetMetalStagesSummary,
  useGetWoodenStagesSummary,
  useListCapacityMachines,
} from "@workspace/api-client-react";
import type { UseQueryResult } from "@tanstack/react-query";

function queryFailed(q: Pick<UseQueryResult<unknown, unknown>, "isError" | "isFetching">): boolean {
  return q.isError && !q.isFetching;
}

export function useExecutiveDashboardData() {
  const statsQ = useGetDashboardStats();
  const clientsQ = useGetDashboardClients();
  const empQ = useGetEmployeeStats();
  const metalStagesQ = useGetMetalStagesSummary();
  const woodenStagesQ = useGetWoodenStagesSummary();
  const capacityQ = useListCapacityMachines();

  const secondary = [clientsQ, empQ, metalStagesQ, woodenStagesQ, capacityQ];
  const partialErrors = secondary.filter(queryFailed);

  return {
    stats: statsQ.data,
    clients: clientsQ.data,
    empStats: empQ.data,
    metalStageSummary: metalStagesQ.data,
    woodenStageSummary: woodenStagesQ.data,
    capacityMachines: capacityQ.data ?? [],
    isLoading: statsQ.isLoading,
    loadingMetalStages: metalStagesQ.isLoading || capacityQ.isLoading,
    loadingWoodenStages: woodenStagesQ.isLoading || capacityQ.isLoading,
    isFetching: statsQ.isFetching || secondary.some((q) => q.isFetching),
    isError: statsQ.isError,
    error: statsQ.error,
    refetch: statsQ.refetch,
    partialError: partialErrors.length > 0,
    refetchAll: async () => {
      await Promise.all([
        statsQ.refetch(),
        clientsQ.refetch(),
        empQ.refetch(),
        metalStagesQ.refetch(),
        woodenStagesQ.refetch(),
        capacityQ.refetch(),
      ]);
    },
  };
}
