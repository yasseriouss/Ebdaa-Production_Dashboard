import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware `clsx` wrapper for one-call class composition. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
