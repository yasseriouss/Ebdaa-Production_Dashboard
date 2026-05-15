/**
 * Canonical data policy for Ebdaa / wood line (F01) integration.
 * SCM Nova SI 400 appears in alternate docs/spreadsheets; it is not mixed into
 * operational master data until verified on the shop floor.
 */
export const EBdaa_DATA_POLICY = {
  canonicalMachineSource:
    "HOMAG inventory from Tajawal comprehensive report (21 assets incl. support equipment).",
  secondaryReference:
    "SCM Nova SI 400 and related sheets — technical reference only; do not treat as default routing IDs.",
  sensitivityNote:
    "Serial numbers and staffing figures are factory-internal; anonymize exports if the app is exposed publicly.",
} as const;

export type EbdaaDataPolicy = typeof EBdaa_DATA_POLICY;
