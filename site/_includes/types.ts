/**
 * Shared types for site page components.
 * Consolidates common interfaces used across mod listing pages.
 */

import type { ModManifest } from "../../mod.ts"

/**
 * Page data for mod pages, used by search results and mod listings.
 */
export interface ModPageData {
  url: string
  title: string
  manifest: ModManifest
}
