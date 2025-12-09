/**
 * Registry Manifest Schema for Cataclysm: Bright Nights Mods
 *
 * This schema defines the structure of manifest files that wrap external mod sources.
 * Unlike the game's modinfo.json, this provides versioning, download URLs, and
 * supports modpacks where multiple mods exist in a single repository.
 */

import * as v from "valibot"
import * as semver from "@std/semver"
import { store } from "../../site/app/components/manifest-generator/store.ts"
import { computed } from "@preact/signals"
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
 * SemVerRange schema - validates semver range strings using @std/semver.
 * Supports npm-style version constraints:
 * - ">=0.9.1" - version 0.9.1 or higher
 * - "^1.0.0" - compatible with 1.0.0 (1.x.x)
 * - "~1.2.0" - approximately 1.2.0 (1.2.x)
 * - ">=1.0.0 <2.0.0" - range
 * - "*" - any version
 */
export const SemVerRange = v.pipe(
  v.string("Version constraint must be a string"),
  v.minLength(1, "Version constraint cannot be empty"),
  v.custom<string>(
    (value) => typeof value === "string" && semver.tryParseRange(value) !== undefined,
    "Invalid SemVer range format. Use npm-style constraints (e.g., >=1.0.0, ^1.0.0, ~1.2.0, 1.x, *)",
  ),
)
export type SemVerRange = v.InferOutput<typeof SemVerRange>

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
  SemVerRange,
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
  update_url: v.optional(
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
  commit_sha: v.optional(
    v.pipe(
      v.string("Git commit SHA for immutability verification"),
      v.regex(/^[a-f0-9]{40}$/, "Invalid SHA format (must be 40 hex characters)"),
    ),
  ),
  extract_path: v.optional(
    v.string(
      'Path inside the archive where the mod is located. For standalone mods, use "." or omit.',
    ),
  ),
})
export type ModSource = v.InferOutput<typeof ModSource>

/**
 * Pattern for URL-representable mod IDs.
 * - Must be lowercase alphanumeric with underscores and dashes
 * - Must start with a letter or number
 * - Must not be empty
 * Used for both `id` and `parent` fields.
 */
export const ModIdPattern = /^[a-z0-9][a-z0-9_-]*$/

/**
 * ModId schema - reusable for id, parent, and dependency keys.
 * URL-representable: lowercase alphanumeric with underscores/dashes.
 */
export const ModId = v.pipe(
  v.string("Mod ID must be a string"),
  v.minLength(1, "Mod ID cannot be empty"),
  v.regex(
    ModIdPattern,
    "Mod ID must be URL-representable: lowercase alphanumeric with underscores/dashes, starting with letter or number",
  ),
)
export type ModId = v.InferOutput<typeof ModId>

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
  "CC-BY-3.0",
  "CC-BY-SA-3.0",
  "CC-BY-4.0",
  "CC-BY-SA-4.0",
  "CC-BY-NC-4.0",
  "CC-BY-NC-SA-4.0",
  "WTFPL",
  "Zlib",
  "ALL-RIGHTS-RESERVED",
] as const

export const License = v.string("License identifier. Recommended to use SPDX IDs.")

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
 * Field definitions used by both ModManifest and ModManifestWithDefaults.
 * Single source of truth - no duplication.
 */
const manifestFields = {
  schema_version: v.literal("1.0", "Schema version for forward compatibility"),
  id: ModId,
  display_name: v.string("Human-readable display name"),
  short_description: v.pipe(
    v.string("Short description, max 200 characters"),
    v.maxLength(200, "Short description must be 200 characters or less"),
  ),
  description: v.optional(v.string("Full description of the mod")),
  author: v.array(v.string("Mod author(s)")),
  license: v.fallback(License, "ALL-RIGHTS-RESERVED"),
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
  icon_url: v.optional(v.pipe(v.string("URL to icon image (PNG, max 160x160)"))),
  autoupdate: v.optional(AutoupdateConfig),
  parent: v.optional(ModId),
  last_updated: v.optional(v.pipe(
    v.string("ISO 8601 timestamp of when the manifest was last updated"),
    v.isoTimestamp("Invalid ISO 8601 timestamp format"),
  )),
} as const

/**
 * Base manifest schema without semantic checks.
 * Used internally for building the full schema.
 */
const ModManifestBase = v.object(manifestFields)
type ModManifestBase = v.InferOutput<typeof ModManifestBase>

/**
 * Main manifest schema for a mod in the registry.
 * This wraps external mod sources with versioning and metadata.
 * Includes semantic validation checks using v.pipe() with v.check().
 */
export const ModManifest = v.pipe(
  ModManifestBase,
  // Semantic check: parent must be in dependencies
  v.check(
    (manifest: ModManifestBase) => {
      if (!manifest.parent) return true
      const deps = manifest.dependencies ?? {}
      const parentLower = manifest.parent.toLowerCase()
      return Object.keys(deps).some((id) => id.toLowerCase() === parentLower)
    },
    "Parent mod must be listed in dependencies",
  ),
  // Semantic check: mod cannot be its own parent
  v.check(
    (manifest: ModManifestBase) => {
      if (!manifest.parent) return true
      return manifest.parent.toLowerCase() !== manifest.id.toLowerCase()
    },
    "Mod cannot be its own parent",
  ),
  // Semantic check: cannot both depend on and conflict with same mod
  v.check(
    (manifest: ModManifestBase) => {
      if (!manifest.dependencies || !manifest.conflicts) return true
      const depIds = new Set(Object.keys(manifest.dependencies).map((id) => id.toLowerCase()))
      const conflictIds = Object.keys(manifest.conflicts).map((id) => id.toLowerCase())
      return !conflictIds.some((id) => depIds.has(id))
    },
    "Mod cannot both depend on and conflict with the same mod",
  ),
)
export type ModManifest = v.InferOutput<typeof ModManifest>

/**
 * Schema with defaults for generating manifest from form data.
 * Uses v.fallback() directly on manifestFields schemas.
 */
export const ModManifestWithDefaults = v.object({
  schema_version: v.fallback(manifestFields.schema_version, "1.0"),
  id: v.fallback(manifestFields.id, "my_mod"),
  display_name: v.fallback(manifestFields.display_name, "My Mod"),
  short_description: v.fallback(
    manifestFields.short_description,
    "A mod for Cataclysm: Bright Nights",
  ),
  description: manifestFields.description,
  author: v.fallback(manifestFields.author, []),
  license: v.fallback(manifestFields.license, "ALL-RIGHTS-RESERVED"),
  homepage: manifestFields.homepage,
  version: v.fallback(manifestFields.version, "0.0.0"),
  dependencies: manifestFields.dependencies,
  conflicts: manifestFields.conflicts,
  source: v.object({
    type: v.fallback(ModSource.entries.type, "github_archive"),
    url: v.fallback(
      ModSource.entries.url,
      "https://github.com/owner/repo/archive/refs/heads/main.zip",
    ),
    commit_sha: ModSource.entries.commit_sha,
    extract_path: ModSource.entries.extract_path,
  }),
  categories: manifestFields.categories,
  tags: manifestFields.tags,
  icon_url: manifestFields.icon_url,
  autoupdate: manifestFields.autoupdate,
  parent: manifestFields.parent,
})
export type ModManifestWithDefaults = v.InferOutput<typeof ModManifestWithDefaults>

/**
 * Converts store state to a manifest object with defaults applied.
 * Filters out empty/undefined optional fields for clean YAML output.
 */
export const storeToManifest = computed((): ModManifestWithDefaults => {
  const result = v.parse(ModManifestWithDefaults, {
    schema_version: "1.0",
    id: store.id || undefined,
    display_name: store.displayName || undefined,
    short_description: store.shortDescription || undefined,
    description: store.description || undefined,
    author: store.author,
    license: store.license || undefined,
    homepage: store.homepage || undefined,
    version: store.version || undefined,
    dependencies: store.dependencies.length > 0
      ? Object.fromEntries(store.dependencies)
      : undefined,
    source: {
      type: store.sourceType || undefined,
      url: store.sourceUrl || undefined,
      commit_sha: store.commitSha || undefined,
      extract_path: store.extractPath || undefined,
    },
    categories: store.categories.length > 0 ? store.categories : undefined,
    tags: store.tags.length > 0 ? store.tags : undefined,
    icon_url: store.iconUrl,
    autoupdate: store.enableAutoupdate
      ? {
        type: store.autoupdateType as AutoupdateType,
        branch: store.autoupdateType === "commit" ? store.autoupdateBranch : undefined,
        regex: store.autoupdateType === "tag" ? store.autoupdateRegex : undefined,
      }
      : undefined,
  })

  // Clean up empty optionals for cleaner YAML output
  const cleaned = { ...result } as Record<string, unknown>
  if (!cleaned.description) delete cleaned.description
  if (!cleaned.homepage) delete cleaned.homepage
  if (!cleaned.dependencies) delete cleaned.dependencies
  if (!cleaned.conflicts) delete cleaned.conflicts
  if (!cleaned.categories) delete cleaned.categories
  if (!cleaned.tags) delete cleaned.tags
  if (!cleaned.icon_url) delete cleaned.icon_url
  if (!cleaned.autoupdate) delete cleaned.autoupdate

  const source = cleaned.source as Record<string, unknown>
  if (!source.commit_sha) delete source.commit_sha
  if (!source.extract_path) delete source.extract_path

  if (cleaned.autoupdate) {
    const autoupdate = cleaned.autoupdate as Record<string, unknown>
    if (!autoupdate.branch) delete autoupdate.branch
    if (!autoupdate.regex) delete autoupdate.regex
    if (!autoupdate.update_url) delete autoupdate.update_url
  }

  return cleaned as ModManifestWithDefaults
})

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
  schema_version: "1.0",
  id,
  display_name: displayName,
  short_description: "",
  author: [],
  license: "ALL-RIGHTS-RESERVED",
  version: "0.0.0",
  source: {
    type: "github_archive",
    url,
  },
})
