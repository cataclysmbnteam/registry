/**
 * Validate Command - Validates manifest files
 */

import { Command } from "@cliffy/command"
import * as YAML from "@std/yaml"
import { walk } from "@std/fs"
import { checkManifest } from "../../utils/validator.ts"
import { stringifyManifest } from "../../utils/stringify.ts"

interface FileResult {
  file: string
  valid: boolean
  errors: number
  written: boolean
}

/** Check a single manifest file, optionally writing sorted YAML */
const checkManifestFile = async (
  { filePath, quiet, write }: { filePath: string; quiet: boolean; write: boolean },
): Promise<FileResult> => {
  const content = await Deno.readTextFile(filePath)
  const manifest = YAML.parse(content)

  const result = checkManifest(manifest, filePath)
  if (!quiet) {
    console.log(result.output)
  }

  let written = false
  if (write && result.valid) {
    const sortedYaml = stringifyManifest(manifest)
    if (sortedYaml !== content) {
      await Deno.writeTextFile(filePath, sortedYaml)
      written = true
      if (!quiet) {
        console.log(`  ↻ Reformatted (keys sorted)`)
      }
    }
  }

  return {
    file: filePath,
    valid: result.valid,
    errors: result.errorCount,
    written,
  }
}

/** Check all manifests in a directory */
const checkAllManifests = async (
  manifestDir: string,
  quiet: boolean,
  write: boolean,
): Promise<{ total: number; valid: number; errors: number; skipped: number; written: number }> => {
  let total = 0
  let valid = 0
  let errors = 0
  let skipped = 0
  let written = 0

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
      const result = await checkManifestFile({ filePath: entry.path, quiet, write })
      total++
      if (result.valid) valid++
      if (result.written) written++
      errors += result.errors
    } catch (error) {
      console.error(`Error processing ${entry.path}: ${error}`)
      total++
      errors++
    }
  }

  return { total, valid, errors, skipped, written }
}

/** Check command for manifest validity */
export const validateCommand = new Command()
  .description("Check manifest files for structural and content validity")
  .arguments("[target:string]")
  .option("-q, --quiet", "Only show summary, not individual file results")
  .option("-w, --write", "Reformat valid manifests with sorted keys")
  .action(async ({ quiet = true, write = false }, target = "manifests") => {
    try {
      const stat = await Deno.stat(target)

      if (stat.isDirectory) {
        if (!quiet) {
          console.log(`Checking manifests in ${target}/\n`)
        }
        const result = await checkAllManifests(target, quiet, write)

        console.log(`\nSummary:`)
        console.log(`  Total: ${result.total}`)
        console.log(`  Valid: ${result.valid}`)
        console.log(`  Errors: ${result.errors}`)
        if (result.skipped > 0) {
          console.log(`  Skipped: ${result.skipped} (example files)`)
        }
        if (write && result.written > 0) {
          console.log(`  Reformatted: ${result.written}`)
        }

        if (result.errors > 0) {
          Deno.exit(1)
        }
      } else {
        const result = await checkManifestFile({
          filePath: target,
          quiet: quiet,
          write,
        })
        if (!result.valid) {
          Deno.exit(1)
        }
      }
    } catch (error) {
      console.error(`Error: ${error}`)
      Deno.exit(1)
    }
  })
