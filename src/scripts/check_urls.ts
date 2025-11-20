#!/usr/bin/env -S deno run --allow-read --allow-net
/**
 * Check URLs in all manifests.
 * Verifies that download URLs and icon URLs are reachable.
 */

import { Command } from "@cliffy/command"
import * as YAML from "@std/yaml"
import { walk } from "@std/fs"
import type { ModManifest } from "../schema/manifest.ts"
import { checkUrl, extractManifestUrls } from "../utils/url_checker.ts"

interface CheckResult {
  file: string
  urls: Array<{
    url: string
    ok: boolean
    status?: number
    error?: string
  }>
}

/**
 * Check all URLs in a manifest file.
 */
const checkManifestFile = async (filePath: string): Promise<CheckResult> => {
  const content = await Deno.readTextFile(filePath)
  const manifest = YAML.parse(content) as ModManifest

  console.log(`Checking ${filePath}`)

  const urls = extractManifestUrls(manifest)
  const results = await Promise.all(
    urls.map(async (url) => {
      const result = await checkUrl(url)
      const status = result.ok
        ? `  OK\t${result.status}`
        : `  ERROR\t${result.status ?? result.error}`
      console.log(`${status}\t${url}`)
      return result
    }),
  )

  return {
    file: filePath,
    urls: results,
  }
}

/**
 * Check all manifests in a directory.
 */
const checkAllManifests = async (
  manifestDir: string,
): Promise<{ total: number; failed: number; failedUrls: string[] }> => {
  const failedUrls: string[] = []
  let total = 0
  let failed = 0

  for await (
    const entry of walk(manifestDir, {
      exts: [".yaml", ".yml", ".json"],
      includeDirs: false,
      maxDepth: 1,
    })
  ) {
    // Skip example files
    if (entry.name.startsWith("_")) continue

    try {
      const result = await checkManifestFile(entry.path)
      total += result.urls.length

      for (const urlResult of result.urls) {
        if (!urlResult.ok) {
          failed++
          failedUrls.push(
            `  ${urlResult.status ?? urlResult.error}\t${urlResult.url}`,
          )
        }
      }
    } catch (error) {
      console.error(`Error processing ${entry.path}: ${error}`)
    }
  }

  return { total, failed, failedUrls }
}

// CLI entry point
if (import.meta.main) {
  await new Command()
    .name("check-urls")
    .version("1.0.0")
    .description("Check that manifest URLs (download and icon) are reachable")
    .arguments("[target:string]")
    .action(async (_options, target = "manifests") => {
      try {
        const stat = await Deno.stat(target)

        if (stat.isDirectory) {
          console.log(`Checking URLs in ${target}/\n`)
          const result = await checkAllManifests(target)

          console.log(`\nChecked ${result.total} URLs`)

          if (result.failed > 0) {
            console.log(`\nFailed URLs (${result.failed}):`)
            for (const url of result.failedUrls) {
              console.log(url)
            }
            Deno.exit(1)
          } else {
            console.log("All URLs OK!")
          }
        } else {
          const result = await checkManifestFile(target)
          const failed = result.urls.filter((u) => !u.ok)

          if (failed.length > 0) {
            console.log("\nFailed URLs:")
            for (const url of failed) {
              console.log(`  ${url.status ?? url.error}\t${url.url}`)
            }
            Deno.exit(1)
          }
        }
      } catch (error) {
        console.error(`Error: ${error}`)
        Deno.exit(1)
      }
    })
    .parse(Deno.args)
}
