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

Create a new YAML file in the `manifests/` folder named after your mod ID:

```yaml
# manifests/your_mod_id.yaml
schemaVersion: "1.0"

id: your_mod_id
displayName: "Your Mod Name"
shortDescription: "A brief description of your mod (max 200 chars)"

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

| Field              | Description                                               |
| ------------------ | --------------------------------------------------------- |
| `schemaVersion`    | Always `"1.0"`                                            |
| `id`               | Unique identifier (lowercase, underscores)                |
| `displayName`      | Human-readable name                                       |
| `shortDescription` | Brief description (max 200 chars)                         |
| `author`           | Mod author(s)                                             |
| `license`          | SPDX license ID or `"ALL-RIGHTS-RESERVED"`                |
| `version`          | Current version                                           |
| `source.type`      | `"github_archive"`, `"gitlab_archive"`, or `"direct_url"` |
| `source.url`       | Direct download URL for the mod archive                   |

### Optional Fields

| Field                | Description                      |
| -------------------- | -------------------------------- |
| `description`        | Full mod description             |
| `homepage`           | Link to repo or documentation    |
| `dependencies`       | List of required mod IDs         |
| `conflicts`          | List of incompatible mod IDs     |
| `categories`         | Organization categories          |
| `tags`               | Search tags                      |
| `iconUrl`            | 160x160 PNG icon                 |
| `source.extractPath` | Path inside archive for modpacks |
| `source.commitSha`   | Git commit SHA for verification  |

## Modpack Extraction

If your mod is part of a larger modpack, use `extractPath`:

```yaml
source:
  type: github_archive
  url: "https://github.com/user/modpack/archive/abc123.zip"
  extractPath: "modpack-abc123/Mods/YourMod"
```

## Auto-Updates

To enable automatic version updates:

```yaml
autoupdate:
  type: tag # or "commit"
  url: "https://github.com/user/repo/archive/$version.zip"
```
