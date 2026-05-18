import { setAuthTokenGetter } from "@workspace/api-client-react/custom-fetch";
import { readStoredAccessToken } from "./client";

/** Align Orval `customFetch` with `apiJson` bearer token behavior. */
export function setupGeneratedApiClient(): void {
  setAuthTokenGetter(() => readStoredAccessToken());
}
