/**
 * CLI Module for BN Mod Registry
 *
 * Provides command-line interface for managing manifests using @cliffy/command.
 */

import { Command } from "@cliffy/command"
import { generateCommand } from "./commands/generate.ts"
import { fetchCommand } from "./commands/fetch.ts"
import { validateCommand } from "./commands/validate.ts"

/** Main CLI application */
export const cli = new Command()
  .name("bn-registry")
  .version("0.1.0")
  .description("Cataclysm: Bright Nights Mod Registry CLI")
  .action(() => {
    cli.showHelp()
  })
  .command("generate", generateCommand)
  .command("fetch", fetchCommand)
  .command("validate", validateCommand)

/** Run CLI if executed directly */
if (import.meta.main) {
  await cli.parse(Deno.args)
}
