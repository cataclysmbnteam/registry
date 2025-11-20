/**
 * Validate Command - Validates manifest files
 */

import { Command } from "@cliffy/command"
import * as YAML from "@std/yaml"
import { walk } from "@std/fs"
import { checkManifest } from "../../utils/validator.ts"

interface FileResult {
  file: string
  valid: boolean
  errors: number
}

/** Check a single manifest file */
const checkManifestFile = async (filePath: string, quiet: boolean): Promise<FileResult> => {
  const content = await Deno.readTextFile(filePath)
  const manifest = YAML.parse(content)

  const result = checkManifest(manifest, filePath)
  if (!quiet) {
    console.log(result.output)
  }

  return {
    file: filePath,
    valid: result.valid,
    errors: result.errorCount,
  }
}

/** Check all manifests in a directory */
const checkAllManifests = async (
  manifestDir: string,
  quiet: boolean,
): Promise<{ total: number; valid: number; errors: number; skipped: number }> => {
  let total = 0
  let valid = 0
  let errors = 0
  let skipped = 0

  for await (
    const entry of walk(manifestDir, {
      exts: [".yaml", ".yml", ".json"],
      includeDirs: false,
      maxDepth: 1,
    })
  ) {
    // Skip example files (starting with underscore) and dotfiles
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) {
      skipped++
      continue
    }

    try {
      const result = await checkManifestFile(entry.path, quiet)
      total++
      if (result.valid) valid++
      errors += result.errors
    } catch (error) {
      console.error(`Error processing ${entry.path}: ${error}`)
      total++
      errors++
    }
  }

  return { total, valid, errors, skipped }
}

/** Check command for manifest validity */
export const validateCommand = new Command()
  .description("Check manifest files for structural and content validity")
  .arguments("[target:string]")
  .option("-q, --quiet", "Only show summary, not individual file results")
  .action(async (options, target = "manifests") => {
    try {
      const stat = await Deno.stat(target)

      if (stat.isDirectory) {
        if (!options.quiet) {
          console.log(`Checking manifests in ${target}/\n`)
        }
        const result = await checkAllManifests(target, options.quiet ?? false)

        console.log(`\nSummary:`)
        console.log(`  Total: ${result.total}`)
        console.log(`  Valid: ${result.valid}`)
        console.log(`  Errors: ${result.errors}`)
        if (result.skipped > 0) {
          console.log(`  Skipped: ${result.skipped} (example files)`)
        }

        if (result.errors > 0) {
          Deno.exit(1)
        }
      } else {
        const result = await checkManifestFile(target, options.quiet ?? false)
        if (!result.valid) {
          Deno.exit(1)
        }
      }
    } catch (error) {
      console.error(`Error: ${error}`)
      Deno.exit(1)
    }
  })
