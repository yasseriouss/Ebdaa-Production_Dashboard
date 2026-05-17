import { setAuthTokenGetter } from "@workspace/api-client-react";
import { readStoredAccessToken } from "./client";

/** Align Orval `customFetch` with `apiJson` bearer token behavior. */
export function setupGeneratedApiClient(): void {
  setAuthTokenGetter(() => readStoredAccessToken());
}
