/**
 * Registry Manifest Schema for Cataclysm: Bright Nights Mods
 *
 * This schema defines the structure of manifest files that wrap external mod sources.
 * Unlike the game's modinfo.json, this provides versioning, download URLs, and
 * supports modpacks where multiple mods exist in a single repository.
 */

import * as v from "valibot"
import * as semver from "@std/semver"

/**
 * Custom valibot action for validating SemVer strings.
 * Uses @std/semver for parsing.
 */
export const semVerCheck = () =>
  v.custom<`${string}.${string}.${string}`>(
    (value) => typeof value === "string" && semver.canParse(value),
    "Invalid SemVer format. Use MAJOR.MINOR.PATCH (e.g., 1.0.0)",
  )

/**
 * Validates that a version string follows SemVer 2.0.0 format.
 * @param version - The version string to validate
 * @returns true if valid SemVer
 */
export const isValidSemVer = (version: string): boolean => semver.canParse(version)

/**
 * Parses a SemVer string into its components.
 * @param version - The version string to parse
 * @returns Object with major, minor, patch, prerelease, and build or null if invalid
 */
export const parseSemVer = (
  version: string,
): {
  major: number
  minor: number
  patch: number
  prerelease?: string
  build?: string
} | null => {
  const parsed = semver.tryParse(version)
  if (!parsed) return null

  return {
    major: parsed.major,
    minor: parsed.minor,
    patch: parsed.patch,
    prerelease: parsed.prerelease?.length ? parsed.prerelease.join(".") : undefined,
    build: parsed.build?.length ? parsed.build.join(".") : undefined,
  }
}

/**
 * Compares two SemVer strings.
 * @param a - First version
 * @param b - Second version
 * @returns -1 if a < b, 0 if a == b, 1 if a > b, null if either is invalid
 */
export const compareSemVer = (a: string, b: string): -1 | 0 | 1 | null => {
  const parsedA = semver.tryParse(a)
  const parsedB = semver.tryParse(b)
  if (!parsedA || !parsedB) return null
  return semver.compare(parsedA, parsedB)
}

/**
 * Dependencies in npm package.json style: { "mod_id": "version_constraint", ... }
 * Version constraints follow node-semver format:
 * - ">=0.9.1" - version 0.9.1 or higher
 * - "^1.0.0" - compatible with 1.0.0 (1.x.x)
 * - "~1.2.0" - approximately 1.2.0 (1.2.x)
 * - ">=1.0.0 <2.0.0" - range
 *
 * Special: "bn" is the base game (Bright Nights)
 */
export const Dependencies = v.record(
  v.string("Mod ID"),
  v.pipe(
    v.string("Version constraint in semver format"),
    v.minLength(1, "Version constraint cannot be empty"),
  ),
  'Dependencies object: { "mod_id": "version_constraint" }. "bn" is the base game.',
)
export type Dependencies = v.InferOutput<typeof Dependencies>

/** Supported autoupdate strategies */
export const AutoupdateType = v.picklist(["tag", "commit"], "Method to check for new versions")
export type AutoupdateType = v.InferOutput<typeof AutoupdateType>

/** Source types for mod archives */
export const SourceType = v.picklist(
  ["github_archive", "gitlab_archive", "direct_url"],
  "Type of source archive",
)
export type SourceType = v.InferOutput<typeof SourceType>

/**
 * Autoupdate configuration for automatic version tracking.
 * Used by CI to detect new releases and update manifests.
 */
export const AutoupdateConfig = v.looseObject({
  type: AutoupdateType,
  updateUrl: v.optional(
    v.string("URL to check for updates. If omitted, uses homepage."),
  ),
  branch: v.optional(
    v.string('Branch to track when type is "commit"'),
  ),
  regex: v.optional(
    v.string(
      "Regex filter for tags (PCRE2). Only tags matching this pattern are considered.",
    ),
  ),
})
export type AutoupdateConfig = v.InferOutput<typeof AutoupdateConfig>

/**
 * Source configuration - defines where to download the mod from.
 * Supports modpacks where a specific subdirectory contains the actual mod.
 */
export const ModSource = v.object({
  type: SourceType,
  url: v.pipe(
    v.string("Direct download URL for the archive (ZIP)"),
    v.url("Invalid URL format"),
  ),
  commitSha: v.optional(
    v.pipe(
      v.string("Git commit SHA for immutability verification"),
      v.regex(/^[a-f0-9]{40}$/, "Invalid SHA format (must be 40 hex characters)"),
    ),
  ),
  extractPath: v.optional(
    v.string(
      'Path inside the archive where the mod is located. For standalone mods, use "." or omit.',
    ),
  ),
})
export type ModSource = v.InferOutput<typeof ModSource>

/** Pattern for valid manifest IDs */
export const ManifestIdPattern = /^[a-z][a-z0-9_]*$/

/** Common SPDX licenses */
export const CommonLicenses = [
  "MIT",
  "Apache-2.0",
  "GPL-2.0-only",
  "GPL-2.0-or-later",
  "GPL-3.0-only",
  "GPL-3.0-or-later",
  "LGPL-2.1-only",
  "LGPL-2.1-or-later",
  "LGPL-3.0-only",
  "LGPL-3.0-or-later",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "MPL-2.0",
  "AGPL-3.0-only",
  "AGPL-3.0-or-later",
  "Unlicense",
  "CC0-1.0",
  "CC-BY-4.0",
  "CC-BY-SA-4.0",
  "CC-BY-NC-4.0",
  "CC-BY-NC-SA-4.0",
  "WTFPL",
  "Zlib",
  "ALL-RIGHTS-RESERVED",
] as const

export const License = v.picklist(CommonLicenses, "CC-BY-SA-4.0")

export const SemVer = v.custom<string>(
  (value) => typeof value === "string" && semver.canParse(value),
  "Invalid SemVer format. Use MAJOR.MINOR.PATCH (e.g., 1.0.0)",
)

export const Version = v.pipe(
  v.string(
    "Current version of the mod. Must follow Semantic Versioning 2.0.0 (MAJOR.MINOR.PATCH).",
  ),
  SemVer,
)
/**
 * Main manifest schema for a mod in the registry.
 * This wraps external mod sources with versioning and metadata.
 */
export const ModManifest = v.object({
  // === Schema Version ===
  schemaVersion: v.literal("1.0", "Schema version for forward compatibility"),

  // === Identity ===
  id: v.pipe(
    v.string(
      "Unique internal identifier for the mod. Lowercase alphanumeric with underscores.",
    ),
    v.regex(ManifestIdPattern, "ID must be lowercase alphanumeric with underscores"),
  ),
  displayName: v.string("Human-readable display name"),
  shortDescription: v.pipe(
    v.string("Short description, max 200 characters"),
    v.maxLength(200, "Short description must be 200 characters or less"),
  ),
  description: v.optional(v.string("Full description of the mod")),

  // === Attribution ===
  author: v.array(v.string("Mod author(s)")),
  license: License,
  homepage: v.optional(v.pipe(
    v.string("URL to mod homepage, repository, or documentation"),
    v.url("Invalid URL format"),
  )),

  version: Version,

  dependencies: v.optional(Dependencies),
  conflicts: v.optional(Dependencies),

  source: ModSource,

  categories: v.optional(
    v.array(
      v.string(),
      'Categories for organization: "content", "qol", "overhaul", "sound", "graphics"',
    ),
  ),
  tags: v.optional(v.array(v.string(), "Freeform tags for search")),

  iconUrl: v.optional(v.pipe(
    v.string("URL to icon image (PNG, max 160x160)"),
    v.url("Invalid URL format"),
  )),
  autoupdate: v.optional(AutoupdateConfig),
})
export type ModManifest = v.InferOutput<typeof ModManifest>

/**
 * Validates that a manifest ID follows naming conventions.
 * @param id - The manifest ID to validate
 * @returns true if valid
 */
export const isValidManifestId = (id: string): boolean => ManifestIdPattern.test(id)

/**
 * Creates a default manifest with required fields.
 * @param id - Unique identifier
 * @param displayName - Display name
 * @param url - Download URL
 * @returns Manifest with defaults
 */
export const createManifest = (
  id: string,
  displayName: string,
  url: string,
): ModManifest => ({
  schemaVersion: "1.0",
  id,
  displayName,
  shortDescription: "",
  author: [],
  license: "ALL-RIGHTS-RESERVED",
  version: "0.0.0",
  source: {
    type: "github_archive",
    url,
  },
})
