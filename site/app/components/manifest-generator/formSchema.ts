/**
 * Valibot schema for the manifest generator form.
 * Reuses validation from the main manifest schema to avoid redundancy.
 */

import * as v from "valibot"
import {
  AutoupdateType,
  ModIdPattern,
  semVerCheck,
  SourceType,
} from "../../../../src/schema/manifest.ts"

/**
 * Form schema for the manifest generator.
 * Uses the same validation rules as the main ModManifest schema
 * but with a flat structure suitable for form inputs.
 */
export const ManifestFormSchema = v.object({
  // Identity - URL-representable mod ID
  id: v.pipe(
    v.string(),
    v.nonEmpty("ID is required"),
    v.regex(
      ModIdPattern,
      "ID must be URL-representable: lowercase alphanumeric with underscores/dashes",
    ),
  ),
  displayName: v.pipe(
    v.string(),
    v.nonEmpty("Display name is required"),
  ),
  shortDescription: v.pipe(
    v.string(),
    v.nonEmpty("Short description is required"),
    v.maxLength(200, "Short description must be 200 characters or less"),
  ),
  description: v.optional(v.string()),

  // Attribution
  author: v.pipe(
    v.string(),
    v.nonEmpty("Author is required"),
  ),
  license: v.string(),
  homepage: v.optional(v.pipe(
    v.string(),
    v.url("Must be a valid URL"),
  )),

  // Versioning - reuses SemVer validation from manifest.ts
  version: v.pipe(
    v.string(),
    v.nonEmpty("Version is required"),
    semVerCheck(),
  ),
  dependencies: v.optional(v.string()),

  // Source - reuses SourceType from manifest.ts
  sourceType: SourceType,
  sourceUrl: v.pipe(
    v.string(),
    v.nonEmpty("Source URL is required"),
    v.url("Must be a valid URL"),
  ),
  commitSha: v.optional(v.pipe(
    v.string(),
    v.regex(/^[a-f0-9]{40}$/, "Must be a valid 40-character git SHA"),
  )),
  extractPath: v.optional(v.string()),

  // Categories & Tags
  categories: v.array(v.string()),
  tags: v.optional(v.string()),

  // Autoupdate - reuses AutoupdateType from manifest.ts
  enableAutoupdate: v.boolean(),
  autoupdateType: AutoupdateType,
  autoupdateBranch: v.optional(v.string()),
})

export type ManifestFormData = v.InferOutput<typeof ManifestFormSchema>

/**
 * Default values for the form.
 */
export const defaultFormValues: ManifestFormData = {
  id: "",
  displayName: "",
  shortDescription: "",
  description: "",
  author: [],
  license: "ALL-RIGHTS-RESERVED",
  homepage: "",
  version: "0.0.0",
  dependencies: "",
  sourceType: "github_archive",
  sourceUrl: "",
  commitSha: "",
  extractPath: "",
  categories: [],
  tags: "",
  enableAutoupdate: true,
  autoupdateType: "commit",
  autoupdateBranch: "main",
}
