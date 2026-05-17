import type { MessageTree } from "../i18n/resolveMessage";

export function flattenMessageKeys(tree: MessageTree, prefix = ""): string[] {
  const keys: string[] = [];
  if (typeof tree === "string") return keys;
  for (const [k, v] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") keys.push(path);
    else keys.push(...flattenMessageKeys(v, path));
  }
  return keys.sort();
}
