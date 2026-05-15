import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { StageUiStatus, WorkOrderPatches } from "@/lib/wood-orders-logic";

type State = {
  patches: WorkOrderPatches;
  setQtyPassed: (workOrderId: string, stageKey: string, qty: number) => void;
  setStageStatus: (
    workOrderId: string,
    stageKey: string,
    status: StageUiStatus
  ) => void;
};

export const useWorkOrderStore = create<State>()(
  persist(
    (set) => ({
      patches: {},
      setQtyPassed: (workOrderId, stageKey, qty) =>
        set((s) => {
          const safe = Math.max(0, Math.floor(Number.isFinite(qty) ? qty : 0));
          return {
            patches: {
              ...s.patches,
              [workOrderId]: {
                ...s.patches[workOrderId],
                [stageKey]: {
                  ...s.patches[workOrderId]?.[stageKey],
                  qty_passed: safe,
                },
              },
            },
          };
        }),
      setStageStatus: (workOrderId, stageKey, status) =>
        set((s) => ({
          patches: {
            ...s.patches,
            [workOrderId]: {
              ...s.patches[workOrderId],
              [stageKey]: {
                ...s.patches[workOrderId]?.[stageKey],
                stageStatus: status,
              },
            },
          },
        })),
    }),
    {
      name: "factory-wood-work-order-patches",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ patches: s.patches }),
    }
  )
);
