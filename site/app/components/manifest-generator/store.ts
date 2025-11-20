/**
 * Global store for the Manifest Generator.
 *
 * Uses deepsignal for reactive state management.
 * Components should import this store directly instead of using props.
 */

import { deepSignal } from "deepsignal"
import type { DiscoveredMod, Progress, RateLimit } from "./types.ts"

/** Store state interface */
export interface StoreState {
  // Form state
  id: string
  displayName: string
  shortDescription: string
  description: string
  author: string[]
  license: string
  homepage: string
  version: string
  dependencies: [string, string][]
  sourceType: string
  sourceUrl: string
  commitSha: string
  extractPath: string
  categories: string[]
  tags: string[]
  autoupdateType: string
  autoupdateBranch: string
  enableAutoupdate: boolean

  // UI state
  githubUrl: string
  isLoading: boolean
  loadingMessage: string
  error: string
  success: string
  rateLimit: RateLimit | null
  foundMods: DiscoveredMod[]
  selectedModIndex: number
  copied: boolean
  progress: Progress
}

/** Global store - import this directly in components */
export const store = deepSignal<StoreState>({
  // Form state defaults
  id: "",
  displayName: "",
  shortDescription: "",
  description: "",
  author: ["you"],
  license: "CC-BY-SA-4.0",
  homepage: "",
  version: "",
  dependencies: [["bn", ">=0.9.1"]],
  sourceType: "github_archive",
  sourceUrl: "",
  commitSha: "",
  extractPath: "",
  categories: [],
  tags: [],
  autoupdateType: "commit",
  autoupdateBranch: "main",
  enableAutoupdate: true,

  // UI state defaults
  githubUrl: "",
  isLoading: false,
  loadingMessage: "",
  error: "",
  success: "",
  rateLimit: null,
  foundMods: [],
  selectedModIndex: -1,
  copied: false,
  progress: { current: 0, total: 0, step: "" },
})
