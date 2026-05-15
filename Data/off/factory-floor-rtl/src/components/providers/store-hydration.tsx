"use client";

import { useEffect } from "react";

import { useWorkOrderStore } from "@/store/work-order-store";

export function StoreHydration() {
  useEffect(() => {
    void useWorkOrderStore.persist.rehydrate();
  }, []);
  return null;
}
