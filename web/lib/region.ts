import raw from "../data/region.json" with { type: "json" };
import { parseRegion, type RegionData } from "./domain.ts";

/**
 * Real water points for the demo region, written by `scripts/import-wpdx.mjs`.
 * `data/region.json` contains `null` until an import runs; the fictional seed is used then.
 */
export const REGION: RegionData | null = parseRegion(raw as unknown);
