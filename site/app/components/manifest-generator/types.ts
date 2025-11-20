/**
 * Type definitions for the Manifest Generator component.
 *
 * Re-exports types from src/schema/ to avoid redundancy.
 */

import type { ModInfo } from "../../../../src/schema/modinfo.ts"
// Re-export ModManifest and CommonLicenses from schema
export { CommonLicenses } from "../../../../src/schema/manifest.ts"
export type { ModManifest } from "../../../../src/schema/manifest.ts"

// Re-export ModInfo and DiscoveredMod from schema/utils
export type { ModInfo }
export type { DiscoveredMod } from "../../../../src/utils/github_fetch.ts"

export interface RateLimit {
  remaining: number
  reset: Date
}

export interface Progress {
  current: number
  total: number
  step: string
}

export const MOD_CATEGORIES = [
  "content",
  "qol",
  "overhaul",
  "sound",
  "graphics",
  "items",
  "creatures",
  "buildings",
  "vehicles",
] as const
