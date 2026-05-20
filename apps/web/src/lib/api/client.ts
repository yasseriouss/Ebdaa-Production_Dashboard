const apiBase = "";

export const ACCESS_TOKEN_KEY = "fdh_access_token";

export function readStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeStoredAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface OfflineMutation {
  id: string;
  path: string;
  method: string;
  body: string | null;
  headers: Record<string, string>;
  timestamp: number;
}

export function getOfflineQueue(): OfflineMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("fdh_offline_queue");
    return raw ? JSON.parse(raw) as OfflineMutation[] : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineMutation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("fdh_offline_queue", JSON.stringify(queue));
  } catch {
    /* ignore */
  }
}

export function getOfflineQueueCount(): number {
  return getOfflineQueue().length;
}

let isSyncing = false;

export async function syncOfflineQueue(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (isSyncing) return false;
  if (!navigator.onLine) return false;

  const queue = getOfflineQueue();
  if (queue.length === 0) return false;

  isSyncing = true;
  window.dispatchEvent(new CustomEvent("fdh-offline-sync-status", { detail: { syncing: true, pendingCount: queue.length } }));

  let successCount = 0;
  const remaining: OfflineMutation[] = [];

  for (const item of queue) {
    try {
      const url = item.path.startsWith("http") ? item.path : `${apiBase}${item.path}`;
      const res = await fetch(url, {
        method: item.method,
        headers: {
          ...item.headers,
          "Content-Type": "application/json",
        },
        body: item.body,
      });

      if (res.ok) {
        successCount++;
      } else {
        // Keep in queue if it's a server failure, otherwise skip client validation issues
        if (res.status >= 500 || res.status === 0) {
          remaining.push(item);
        }
      }
    } catch (e) {
      // Network failure during sync, keep this and remaining items
      const itemIndex = queue.indexOf(item);
      remaining.push(...queue.slice(itemIndex));
      break;
    }
  }

  saveOfflineQueue(remaining);
  isSyncing = false;

  window.dispatchEvent(new CustomEvent("fdh-offline-sync-status", { detail: { syncing: false, pendingCount: remaining.length } }));
  window.dispatchEvent(new CustomEvent("fdh-offline-queue-changed"));

  if (successCount > 0) {
    window.dispatchEvent(new CustomEvent("fdh-offline-sync-complete"));
    return true;
  }
  return false;
}

// Auto-sync listener registration
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    void syncOfflineQueue();
  });
  window.addEventListener("offline", () => {
    window.dispatchEvent(new CustomEvent("fdh-offline-queue-changed"));
  });
}

function queueOfflineMutation<T>(path: string, method: string, headers: Record<string, string>, body: unknown): T {
  if (typeof window === "undefined") return {} as T;

  const id = `mutation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const queue = getOfflineQueue();

  let bodyStr: string | null = null;
  if (body) {
    bodyStr = typeof body === "string" ? body : JSON.stringify(body);
  }

  queue.push({
    id,
    path,
    method,
    body: bodyStr,
    headers,
    timestamp: Date.now(),
  });

  saveOfflineQueue(queue);
  window.dispatchEvent(new CustomEvent("fdh-offline-queue-changed"));

  // Generate a mock/optimistic response
  let mockRes: Record<string, unknown> = { ok: true, offline: true, id };
  if (bodyStr) {
    try {
      const parsed = JSON.parse(bodyStr);
      if (path.includes("/wood-work-orders")) {
        mockRes = {
          workOrderId: parsed.work_order_id || parsed.id || "offline-id",
          payload: parsed,
          offline: true,
        };
      } else if (path.includes("/work-order-analysis-sessions")) {
        mockRes = {
          id: parsed.id || "offline-id",
          payload: parsed,
          offline: true,
        };
      } else {
        mockRes = { ...parsed, offline: true, id };
      }
    } catch {
      /* ignore */
    }
  }
  return mockRes as T;
}

function shouldAttachBearerToken(): boolean {
  const v = import.meta.env.VITE_OFFLINE_UNRESTRICTED;
  if (v === "1" || (typeof v === "string" && v.toLowerCase() === "true")) return false;
  return true;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method?.toUpperCase() || "GET";
  const isGet = method === "GET";
  const url = path.startsWith("http") ? path : `${apiBase}${path}`;
  const token = shouldAttachBearerToken() ? readStoredAccessToken() : null;

  const headers = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string>),
  };

  // 1. Offline Mode Read (GET)
  if (typeof window !== "undefined" && !navigator.onLine && isGet) {
    const cached = localStorage.getItem(`fdh_offline_cache_${path}`);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        /* fallback */
      }
    }
  }

  // 2. Offline Mode Write (MUTATION)
  if (typeof window !== "undefined" && !navigator.onLine && !isGet) {
    return queueOfflineMutation<T>(path, method, headers, init?.body);
  }

  try {
    const res = await fetch(url, {
      ...init,
      headers,
    });

    if (res.status === 204) {
      return undefined as T;
    }

    const text = await res.text();
    let data: unknown = null;
    let isJson = false;
    if (text) {
      try {
        data = JSON.parse(text);
        isJson = true;
      } catch {
        // Non-JSON response
      }
    }

    if (!res.ok) {
      const msg =
        isJson && data && typeof data === "object" && "error" in data
          ? String((data as { error: string }).error)
          : res.statusText || `Request failed with status ${res.status}`;
      throw new ApiError(msg || "Request failed", res.status, isJson ? data : { rawText: text });
    }

    if (text && !isJson) {
      throw new ApiError("Response is not valid JSON", res.status, { rawText: text });
    }

    // 3. Cache successful GET responses
    if (isGet && typeof window !== "undefined") {
      try {
        localStorage.setItem(`fdh_offline_cache_${path}`, text);
      } catch {
        /* storage full */
      }
    }

    return data as T;
  } catch (error) {
    // 4. Resilient Network Failure Recovery
    if (typeof window !== "undefined") {
      if (isGet) {
        const cached = localStorage.getItem(`fdh_offline_cache_${path}`);
        if (cached) {
          try {
            return JSON.parse(cached) as T;
          } catch {
            /* ignore */
          }
        }
      } else {
        // Queue mutation during connection dropouts
        return queueOfflineMutation<T>(path, method, headers, init?.body);
      }
    }
    throw error;
  }
}


export interface FhWoodWorkOrderRow {
  workOrderId: string;
  payload: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface FhReferenceRow {
  key: string;
  payload: Record<string, unknown>;
  updatedAt?: string;
}

export interface FhAnalysisEnvelope {
  id: string;
  payload: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface FhNewProjectAutosaveEnvelope {
  singletonKey: "default";
  payload: Record<string, unknown>;
  updatedAt?: string;
}
