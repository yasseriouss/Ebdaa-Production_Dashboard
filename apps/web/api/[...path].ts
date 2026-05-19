export const config = {
  runtime: "edge",
};

/**
 * Proxies `/api/*` to `FDH_API_UPSTREAM` (e.g. https://your-api.example.com).
 * Set in Vercel → Project → Settings → Environment Variables.
 */
export default async function handler(request: Request): Promise<Response> {
  const upstream = process.env.FDH_API_UPSTREAM?.replace(/\/$/, "");
  if (!upstream) {
    return new Response(
      JSON.stringify({
        error: "FDH_API_UPSTREAM is not configured on Vercel",
      }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  }

  const incoming = new URL(request.url);
  const target = `${upstream}${incoming.pathname}${incoming.search}`;
  const headers = new Headers(request.headers);
  headers.delete("host");

  const init: RequestInit = { method: request.method, headers };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  return fetch(target, init);
}
