/**
 * Cataclysm: Bright Nights modinfo.json Schema
 *
 * This represents the game's native mod metadata format.
 * Found in each mod's root folder as modinfo.json.
 *
 * Note: This is NOT what we store in the registry - we use ModManifest.
 * This schema is for parsing/validating mods from source repos.
 */

import * as v from "valibot"

/**
 * Mod type determines loading behavior.
 * - "MOD_INFO": Standard mod
 * - "CORE": Core game data (not for mods)
 */
export const ModType = v.picklist(
  ["MOD_INFO", "CORE"],
  "Mod type determines loading behavior",
)
export type ModType = v.InferOutput<typeof ModType>

/**
 * Mod category for in-game organization.
 */
export const ModCategory = v.picklist(
  [
    "total_conversion",
    "content",
    "items",
    "creatures",
    "misc_additions",
    "buildings",
    "vehicles",
    "rebalance",
    "magical",
    "item_exclude",
    "monster_exclude",
    "graphical",
  ],
  "Mod category for in-game organization",
)
export type ModCategory = v.InferOutput<typeof ModCategory>

/**
 * Native modinfo.json structure from Cataclysm: Bright Nights.
 * The 'id' field is required for all mods in the registry.
 * Only type "MOD_INFO" is accepted (not "CORE" which is for core game data).
 */
export const ModInfo = v.object({
  type: v.literal("MOD_INFO", "Only MOD_INFO type is valid for mods"),
  id: v.pipe(
    v.string(
      "Unique mod identifier, used for dependencies. Convention: lowercase with underscores",
    ),
    v.nonEmpty("Mod ID cannot be empty"),
  ),
  name: v.pipe(
    v.string("Displayed name in mod selection"),
    v.nonEmpty("Mod name cannot be empty"),
  ),
  authors: v.optional(
    v.array(v.string(), "Author(s) of the mod"),
  ),
  license: v.optional(License),
  description: v.optional(
    v.string("Longer description shown in mod details"),
  ),
  category: v.optional(ModCategory),
  dependencies: v.optional(
    v.array(
      v.string(),
      'List of mod IDs this mod depends on. "dda" = base game, "bn" = Bright Nights specific',
    ),
  ),
  version: v.optional(
    v.string("Mod version string. Optional but recommended."),
  ),
  obsolete: v.optional(
    v.boolean("If true, mod provides a custom world generation"),
  ),
  maintainers: v.optional(
    v.array(v.string(), "Maintainers who have permission to update"),
  ),
})
export type ModInfo = v.InferOutput<typeof ModInfo>

/**
 * Gets the mod ID from a ModInfo object.
 */
export const getModId = (modinfo: ModInfo): string => modinfo.id

/**
 * Raw modinfo.json entry structure (permissive for parsing).
 * Used to filter and extract MOD_INFO entries before validation.
 */
const RawModInfoEntry = v.looseObject({
  type: v.literal("MOD_INFO"),
})

/**
 * Parse modinfo.json content.
 * BN modinfo can be a single object or array of objects.
 * Validates each entry against the ModInfo schema.
 * @param content - JSON string content
 * @returns Parsed and validated ModInfo array
 */
export const parseModInfo = (content: string): ModInfo[] => {
  const parsed = JSON.parse(content)
  const entries: unknown[] = Array.isArray(parsed) ? parsed : [parsed]

  // Filter to MOD_INFO entries and validate each against the schema
  return entries
    .filter((item) => v.safeParse(RawModInfoEntry, item).success)
    .flatMap((item) => {
      const res = v.safeParse(ModInfo, item)
      if (res.success) return [res.output]
      console.log(v.summarize(res.issues))
      return []
    })
    .map((item) => item as ModInfo)
}

import { type Dependencies, License } from "./manifest.ts"

/** Default version constraint for bn (Bright Nights base game) */
const BN_DEFAULT_VERSION = ">=0.9.1"

/** Default version constraint for unversioned dependencies */
const DEFAULT_VERSION = "*"

/**
 * Convert game's dependency array to registry's dependency object format.
 * - "bn" without version gets ">=0.9.1"
 * - Other mods without version get "*"
 */
export const convertDependencies = (deps?: string[]): Dependencies | undefined => {
  if (!deps || deps.length === 0) return undefined

  return Object.fromEntries(
    deps.map((dep) => {
      // Handle "dda" (original game identifier) as "bn"
      const modId = dep === "dda" ? "bn" : dep
      const version = modId === "bn" ? BN_DEFAULT_VERSION : DEFAULT_VERSION
      return [modId, version]
    }),
  )
}

/**
 * Converts a ModInfo to our registry format basics.
 * Additional fields must be filled in manually.
 * @param modinfo - Source modinfo
 * @param sourceUrl - Download URL for the mod
 * @returns Partial ModManifest-compatible object
 */
export const modInfoToManifestBase = (
  modinfo: ModInfo,
  _sourceUrl: string,
): {
  id: string
  displayName: string
  description?: string
  author: string
  dependencies?: Dependencies
} => ({
  id: getModId(modinfo),
  displayName: modinfo.name,
  description: modinfo.description,
  author: modinfo.authors?.join(", ") ?? "Unknown",
  dependencies: convertDependencies(modinfo.dependencies),
})
