export type MessageTree = string | { [k: string]: MessageTree };

export function resolveMessage(tree: MessageTree, path: string): string | undefined {
  const parts = path.split(".").filter(Boolean);
  let cur: MessageTree = tree;
  for (const p of parts) {
    if (typeof cur !== "object" || cur === null || Array.isArray(cur)) return undefined;
    cur = cur[p] as MessageTree;
  }
  return typeof cur === "string" ? cur : undefined;
}

export function interpolate(
  template: string,
  params?: Record<string, string | number | undefined>,
): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) =>
    params[k] !== undefined ? String(params[k]) : `{{${k}}}`,
  );
}
