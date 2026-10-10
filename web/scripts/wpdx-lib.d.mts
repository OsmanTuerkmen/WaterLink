import type { RegionData, Survey } from "../lib/domain";

export type WpdxRecord = Omit<Survey, "source"> & { lat: number; lon: number };
export declare const WPDX_ENDPOINT: string;
export declare const WPDX_FIELDS: string[];
export declare function mapStatus(statusClean: unknown, statusId: unknown): Survey["status"];
export declare function mapRecord(row: Record<string, unknown>): WpdxRecord | null;
export declare function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number;
export declare function dedupe(records: WpdxRecord[]): WpdxRecord[];
export declare function isImprovedSource(record: WpdxRecord): boolean;
export declare function isCleanFunctional(record: WpdxRecord): boolean;
export declare function pickNeighbourhood(records: WpdxRecord[], options?: { count?: number; near?: { lat: number; lon: number } | null; radiusKm?: number; walkKm?: number }): { a: WpdxRecord; b: WpdxRecord; c: WpdxRecord; points: WpdxRecord[] };
export declare function buildRegion(rows: Record<string, unknown>[], options?: { county?: string; count?: number; near?: { lat: number; lon: number } | null; radiusKm?: number; walkKm?: number; fetchedAt?: string }): RegionData;
