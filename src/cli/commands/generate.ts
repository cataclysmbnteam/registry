/**
 * Generate Command - Generates index files from manifests
 */

import { Command } from "@cliffy/command"
import { generateAll } from "../../scripts/generate.ts"

/** Generate command for creating index files from manifests */
export const generateCommand = new Command()
  .description("Generate JSON index and Markdown table from manifest files")
  .arguments("[manifestDir:string] [outputDir:string]")
  .option("-v, --verbose", "Show verbose output")
  .action(async (options, manifestDir = "manifests", outputDir = "generated") => {
    if (options.verbose) {
      console.log(`Generating from ${manifestDir} to ${outputDir}...`)
    }

    await generateAll(manifestDir, outputDir)

    console.log("✓ Generation complete")
  })
