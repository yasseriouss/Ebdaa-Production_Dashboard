import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { getOfflineQueueCount, syncOfflineQueue } from "../../lib/api/client";
import { useDirection } from "../../lib/useDirection";
import { cn } from "../../lib/cn";

export function OfflineIndicator() {
  const { direction } = useDirection();
  const rtl = direction === "rtl";

  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(getOfflineQueueCount());
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setOnline(true);
      setSyncMessage(rtl ? "تم استعادة الاتصال. يجري المزامنة..." : "Connection restored. Syncing data...");
      syncOfflineQueue()
        .then((didSync) => {
          if (didSync) {
            setSyncMessage(rtl ? "تمت المزامنة بنجاح!" : "Synchronization completed successfully!");
            setTimeout(() => setSyncMessage(null), 3000);
          } else {
            setSyncMessage(null);
          }
        })
        .catch(() => {
          setSyncMessage(rtl ? "فشلت المزامنة التلقائية. يرجى المحاولة يدوياً." : "Auto-sync failed. Please try manually.");
          setTimeout(() => setSyncMessage(null), 4000);
        });
    };

    const handleOffline = () => {
      setOnline(false);
      setSyncMessage(null);
    };

    const handleQueueChange = () => {
      setPendingCount(getOfflineQueueCount());
    };

    const handleSyncStatus = (e: Event) => {
      const customEvent = e as CustomEvent<{ syncing: boolean; pendingCount: number }>;
      setSyncing(customEvent.detail.syncing);
      setPendingCount(customEvent.detail.pendingCount);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("fdh-offline-queue-changed", handleQueueChange);
    window.addEventListener("fdh-offline-sync-status", handleSyncStatus);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("fdh-offline-queue-changed", handleQueueChange);
      window.removeEventListener("fdh-offline-sync-status", handleSyncStatus);
    };
  }, [rtl]);

  const handleManualSync = async () => {
    if (!online || syncing) return;
    setSyncing(true);
    try {
      const didSync = await syncOfflineQueue();
      if (didSync) {
        setSyncMessage(rtl ? "تمت مزامنة جميع التغييرات بنجاح!" : "All changes successfully synced!");
      } else {
        setSyncMessage(rtl ? "لا توجد تعديلات بحاجة للمزامنة حالياً." : "No mutations require syncing right now.");
      }
    } catch {
      setSyncMessage(rtl ? "فشل الاتصال بالخادم لمزامنة التغييرات." : "Failed to establish server connection for synchronization.");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(null), 3000);
    }
  };

  // Do not render if completely online with zero pending changes
  if (online && pendingCount === 0 && !syncMessage && !syncing) {
    return null;
  }

  return (
    <div
      className={cn(
        "w-full px-4 py-2 text-xs font-medium flex items-center justify-between transition-all duration-300",
        online
          ? "bg-brand-success/15 border-b border-brand-success/30 text-brand-success"
          : "bg-brand-warning/15 border-b border-brand-warning/30 text-brand-warning"
      )}
      dir={rtl ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-2">
        {online ? (
          <Wifi className="h-4 w-4 shrink-0 animate-pulse" />
        ) : (
          <WifiOff className="h-4 w-4 shrink-0 animate-bounce" />
        )}
        <span className="leading-normal">
          {syncMessage ? (
            syncMessage
          ) : online ? (
            rtl
              ? `أنت متصل بالإنترنت. لديك ${pendingCount} تعديلات معلقة قيد الانتظار.`
              : `You are back online. ${pendingCount} offline changes pending sync.`
          ) : (
            rtl
              ? `أنت تعمل في وضع عدم الاتصال بالإنترنت (Offline Mode). جميع التعديلات محفوظة محلياً.`
              : `Working Offline. All actions are safely queued locally.`
          )}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {pendingCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-warning text-brand-black">
            {pendingCount} {rtl ? "تعديل معلق" : "Pending"}
          </span>
        )}
        
        {online && pendingCount > 0 && (
          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncing}
            className={cn(
              "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded border transition-all duration-200 flex items-center gap-1",
              syncing
                ? "bg-brand-border border-brand-border text-brand-metal cursor-not-allowed"
                : "bg-brand-success border-brand-success text-brand-black hover:bg-brand-success/80 active:scale-[0.97]"
            )}
          >
            <RefreshCw className={cn("h-3 w-3", syncing && "animate-spin")} />
            {rtl ? "مزامنة الآن" : "Sync Now"}
          </button>
        )}
      </div>
    </div>
  );
}
