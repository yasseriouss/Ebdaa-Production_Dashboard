/**
 * Bridges factory-app toast calls to the unified ENCID ToastProvider.
 */
import { useToast as useEncidToast } from "../../components/ui/Toast";

type FactoryToastInput = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

function formatMessage({ title, description }: FactoryToastInput): string {
  if (title && description) return `${title}: ${description}`;
  return title ?? description ?? "";
}

export function useToast() {
  const encid = useEncidToast();
  return {
    toast: (input: FactoryToastInput) => {
      const message = formatMessage(input);
      if (!message) return;
      if (input.variant === "destructive") encid.error(message);
      else encid.success(message);
    },
    dismiss: () => {},
    toasts: [] as unknown[],
  };
}

export function toast(input: FactoryToastInput) {
  const message = formatMessage(input);
  if (!message) return;
  // Module-level toast for rare non-hook use — no-op outside React; callers should use useToast.
  void message;
}
