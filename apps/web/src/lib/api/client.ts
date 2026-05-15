const apiBase = "";

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

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${apiBase}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers as Record<string, string>),
    },
  });
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;
  if (!res.ok) {
    const msg =
      data && typeof data === "object" && data !== null && "error" in data
        ? String((data as { error: string }).error)
        : res.statusText;
    throw new ApiError(msg || "Request failed", res.status, data);
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
