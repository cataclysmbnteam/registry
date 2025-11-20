/**
 * BN Mod Registry - Main export
 *
 * Provides types and utilities for working with the mod registry.
 */

// Schema exports
export {
  type AutoupdateConfig,
  type AutoupdateType,
  createManifest,
  isValidManifestId,
  type ModManifest,
  type ModSource,
  type SourceType,
} from "./src/schema/manifest.ts"

export {
  getModId,
  type ModCategory,
  type ModInfo,
  modInfoToManifestBase,
  type ModType,
  parseModInfo,
} from "./src/schema/modinfo.ts"

// Utility exports
export {
  type CheckOptions,
  checkUrl,
  checkUrls,
  extractManifestUrls,
  type UrlCheckResult,
} from "./src/utils/url_checker.ts"

export { checkManifest, type CheckResult } from "./src/utils/validator.ts"
