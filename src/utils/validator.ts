/**
 * Manifest check utilities.
 * Uses Valibot schema for validation with v.summarize for error formatting.
 */

import * as v from "valibot"
import { ModManifest, ModManifest as ModManifestSchema } from "../schema/manifest.ts"

/** Result of checking a manifest */
export interface CheckResult {
  valid: boolean
  errorCount: number
  output: string
}

/** Separators used to detect submod naming patterns */
const ID_SEPARATORS = /[ @_/|\\-]/

/**
 * Check if a mod ID starts with a parent ID followed by a separator.
 * e.g., "arcana_foo_patch" starts with "arcana" with separator "_"
 */
export const hasParentIdPrefix = (modId: string, parentId: string): boolean => {
  if (!modId.startsWith(parentId)) return false
  if (modId === parentId) return false

  const afterParent = modId.slice(parentId.length)
  return ID_SEPARATORS.test(afterParent[0])
}

/**
 * Auto-detect parent mod from dependencies and naming pattern.
 * Returns the parent mod ID if:
 * 1. Mod has a dependency on another mod
 * 2. Mod ID starts with that dependency's ID followed by a separator
 */
export const detectParentMod = (manifest: ModManifest): string | undefined => {
  if (!manifest.dependencies) return undefined

  const depIds = Object.keys(manifest.dependencies).map((id) => id.toLowerCase())

  for (const depId of depIds) {
    if (hasParentIdPrefix(manifest.id.toLowerCase(), depId.toLowerCase())) {
      return depId
    }
  }

  return undefined
}

/**
 * Check a manifest using valibot and return formatted output.
 * Uses v.safeParse and v.summarize directly.
 * Semantic checks (parent in deps, not own parent, no conflict-dep overlap)
 * are built into the ModManifest schema using v.check().
 *
 * @param manifest - The manifest to check (unknown data)
 * @param manifestId - Optional manifest ID for context in output
 * @returns CheckResult with valid flag, error count, and formatted output
 */
export const checkManifest = (manifest: unknown, manifestId?: string): CheckResult => {
  const result = v.safeParse(ModManifestSchema, manifest)

  const lines: string[] = []
  if (manifestId) {
    lines.push(`Checking: ${manifestId}`)
  }

  if (!result.success) {
    // Use v.summarize for pretty error output
    const summary = v.summarize(result.issues)
    lines.push(summary.split("\n").map((line) => `  ✗ ${line}`).join("\n"))

    return { valid: false, errorCount: result.issues.length, output: lines.join("\n") }
  }

  lines.push("  ✓ Valid")
  return { valid: true, errorCount: 0, output: lines.join("\n") }
}
