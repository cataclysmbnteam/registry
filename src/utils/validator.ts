/**
 * Manifest check utilities.
 * Uses Valibot schema for validation with v.summarize for error formatting.
 */

import * as v from "valibot"
import { ModManifest as ModManifestSchema } from "../schema/manifest.ts"

/** Result of checking a manifest */
export interface CheckResult {
  valid: boolean
  errorCount: number
  output: string
}

/**
 * Check a manifest using valibot and return formatted output.
 * Uses v.safeParse and v.summarize directly.
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

  if (result.success) {
    lines.push("  ✓ Valid")
    return { valid: true, errorCount: 0, output: lines.join("\n") }
  }

  // Use v.summarize for pretty error output
  const summary = v.summarize(result.issues)
  lines.push(summary.split("\n").map((line) => `  ✗ ${line}`).join("\n"))

  return { valid: false, errorCount: result.issues.length, output: lines.join("\n") }
}
