import * as YAML from "@std/yaml/unstable-stringify"

export const stringifyManifest = (manifest: unknown) =>
  YAML.stringify(manifest, { quoteStyle: '"' })
