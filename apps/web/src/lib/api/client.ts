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

function shouldAttachBearerToken(): boolean {
  const v = import.meta.env.VITE_OFFLINE_UNRESTRICTED;
  if (v === "1" || (typeof v === "string" && v.toLowerCase() === "true")) return false;
  return true;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${apiBase}${path}`;
  const token = shouldAttachBearerToken() ? readStoredAccessToken() : null;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers as Record<string, string>),
    },
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
      // Non-JSON response (e.g. Vercel's HTML rewrite fallback)
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
  return data as T;
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
