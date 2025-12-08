---
layout: base.tsx
title: Submit a Mod
---

# Submit Your Mod to the Registry

Adding your mod to the registry is easy! Follow these steps:

## Prerequisites

- Your mod must be hosted on GitHub (or another git host)
- You need a GitHub account to submit pull requests

## Step 1: Fork the Registry

1. Go to
   [github.com/cataclysmbnteam/registry](https://github.com/cataclysmbnteam/registry)
2. Click "Fork" to create your own copy

## Step 2: Create a Manifest File

You can create a manifest file in one of three ways:

### Option A: Web Generator (Recommended)

Use the [Manifest Generator](/docs/generator/) to create your manifest file interactively.
It can automatically fetch mod information from your GitHub repository.

### Option B: CLI Fetch Command

If you prefer working from the command line, clone the registry and use the `fetch` command:

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/registry.git
cd registry

# Fetch mods from a GitHub repository
deno task fetch https://github.com/yourname/your-mod

# Or use the shorthand format
deno task fetch yourname/your-mod
```

The CLI will:

1. Scan the repository for `modinfo.json` files
2. Let you select which mods to generate manifests for
3. Create/update YAML manifest files in the `manifests/` folder
4. Automatically detect parent mods for patchmods

**Fetch Options:**

| Option                | Description                             |
| --------------------- | --------------------------------------- |
| `-o, --output <dir>`  | Output directory (default: `manifests`) |
| `-a, --all`           | Generate all mods without prompting     |
| `--filter <pattern>`  | Filter mods by path (regex)             |
| `--exclude <pattern>` | Exclude mods by path (regex)            |
| `--dry-run`           | Preview without writing files           |

**Example: Fetch all mods from a repository:**

```bash
deno task fetch --all https://github.com/Chaosvolt/Cataclysm-BN-Modular-Mods
```

**Example: Filter for a specific mod:**

```bash
deno task fetch --filter "arcana" https://github.com/Chaosvolt/Cataclysm-BN-Modular-Mods
```

### Option C: Manual Creation

Create a new YAML file in the `manifests/` folder named after your mod ID:

```yaml
# manifests/your_mod_id.yaml
schema_version: "1.0"

id: your_mod_id
display_name: "Your Mod Name"
short_description: "A brief description of your mod (max 200 chars)"

author: "Your Name"
license: "MIT" # Use SPDX identifier
homepage: "https://github.com/yourname/your-mod"

version: "1.0.0"

dependencies:
  - bn: ">=0.9.1"

categories:
  - content

source:
  type: github_archive
  url: "https://github.com/yourname/your-mod/archive/refs/tags/v1.0.0.zip"
```

## Step 3: Validate Your Manifest

Run the validation tool to check your manifest:

```bash
deno task validate manifests/your_mod_id.yaml
deno task check-urls manifests/your_mod_id.yaml
```

## Step 4: Submit a Pull Request

1. Commit your manifest file
2. Push to your fork
3. Open a pull request to the main repository

## Manifest Fields Reference

### Required Fields

| Field               | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `schema_version`    | Always `"1.0"`                                            |
| `id`                | Unique identifier (lowercase, underscores)                |
| `display_name`      | Human-readable name                                       |
| `short_description` | Brief description (max 200 chars)                         |
| `author`            | Mod author(s)                                             |
| `license`           | SPDX license ID or `"ALL-RIGHTS-RESERVED"`                |
| `version`           | Current version                                           |
| `source.type`       | `"github_archive"`, `"gitlab_archive"`, or `"direct_url"` |
| `source.url`        | Direct download URL for the mod archive                   |

### Optional Fields

| Field                 | Description                      |
| --------------------- | -------------------------------- |
| `description`         | Full mod description             |
| `homepage`            | Link to repo or documentation    |
| `dependencies`        | List of required mod IDs         |
| `conflicts`           | List of incompatible mod IDs     |
| `categories`          | Organization categories          |
| `tags`                | Search tags                      |
| `icon_url`            | 160x160 PNG icon                 |
| `source.extract_path` | Path inside archive for modpacks |
| `source.commit_sha`   | Git commit SHA for verification  |

## Modpack Extraction

If your mod is part of a larger modpack, use `extract_path`:

```yaml
source:
  type: github_archive
  url: "https://github.com/user/modpack/archive/abc123.zip"
  extract_path: "modpack-abc123/Mods/YourMod"
```

## Auto-Updates

To enable automatic version updates:

```yaml
autoupdate:
  type: tag # or "commit"
  url: "https://github.com/user/repo/archive/$version.zip"
```
