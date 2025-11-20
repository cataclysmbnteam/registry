# Cataclysm: Bright Nights Mod Manifests

This directory contains mod manifests for the BN mod registry.

## File Naming

- Use the mod's `id` as the filename (e.g., `dino_mod.yaml`)
- Use `.yaml` extension (preferred) or `.json`
- Prefixed files (`_*.yaml`) are examples/templates and will be skipped

## Adding a New Mod

1. Create a new YAML file with your mod's ID
2. Fill in all required fields (see schema below)
3. Run `deno task validate` to check your manifest
4. Submit a pull request

## Required Fields

```yaml
schemaVersion: "1.0"
id: your_mod_id # lowercase, underscores only
displayName: "Your Mod" # Human-readable name
shortDescription: "..." # Max 200 chars
author: "Your Name"
license: "MIT" # SPDX identifier
version: "1.0.0"
source:
  type: github_archive
  url: "https://..." # Direct download URL
```

## Optional Fields

- `description`: Full description
- `homepage`: Repository or documentation URL
- `dependencies`: List of required mod IDs
- `conflicts`: List of incompatible mod IDs
- `categories`: Organization categories
- `tags`: Search tags
- `iconUrl`: 160x160 PNG icon URL
- `source.extractPath`: For modpacks, path inside archive
- `source.commitSha`: Git commit for verification
- `autoupdate`: Auto-update configuration

## Modpack Extraction

For mods inside larger modpacks (like Kenan's), use `extractPath`:

```yaml
source:
  type: github_archive
  url: "https://github.com/user/modpack/archive/abc123.zip"
  extractPath: "modpack-abc123/Mods/YourMod"
```

## Autoupdate

For automatic version updates, add:

```yaml
autoupdate:
  type: tag # or "commit"
  branch: main # for commit type
  regex: "^v[0-9]" # optional: filter tags
  url: "https://github.com/user/repo/archive/$version.zip"
  iconUrl: "https://raw.githubusercontent.com/user/repo/$version/icon.png"
```

## Validation

Run these commands to validate your manifest:

```bash
deno task validate           # Check manifest structure
deno task check-urls         # Verify URLs are reachable
```
