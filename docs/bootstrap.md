# AGENTS.md

Mod Registry for https://github.com/cataclysmbnteam/Cataclysm-BN

ALWAYS RE-READ `AGENTS.md` before doing next step as this is the only way user
can asynchronously communicate with ongoing agent session.

reference https://github.com/endless-sky/endless-sky-plugins heavily for project
structure and ideas.

## 1. Project Overview

- **Mission:** Create a centralized, community-driven mod registry for
  _Cataclysm: Bright Nights_ (BN).
- **Core Philosophy:** "Decoupled Management." We do not host mod code. We host
  metadata (Manifests) that point to immutable snapshots (Commits/Tags) of
  external repositories.
- **Key Challenge:** Unlike _Endless Sky_ (1 repo = 1 plugin), BN heavily
  utilizes **Modpacks** (1 repo = N mods). The system must handle extracting
  specific sub-directories from large archives.

## 2. Domain Context & Knowledge

- **Target Game:** Cataclysm: Bright Nights (Open source, C++, JSON-data
  driven).
- **Mod Structure:**
  - Mods are defined by a `modinfo.json` file inside the mod folder.
  - Heavy use of `copy-from` (JSON inheritance).
  - Mods often depend on the core game (`dda`) or other mods in the same pack.
- **Ecosystem State:**
  - Distribution is fragmented (Discord, GitHub releases, loose ZIPs).
  - Versioning is inconsistent. Modders rarely use SemVer strictly.
  - **Kenan’s Modpack** is the de-facto standard, containing dozens of mods in
    one repo.

## 3. Architectural Decisions

### A. The "External Manifest" Model

We cannot force modders to standardize their `modinfo.json`. We will create a
wrapper `registry.json` (or individual `.json` manifests) that defines:

1. **Source of Truth:** A specific Commit Hash or Release Tag URL (GitHub
   Archive).
2. **Target Path:** Which sub-folder inside the ZIP constitutes the actual mod.
3. **Virtual Versioning:** We assign CalVer (e.g., `2025.12.07`) if the modder
   doesn't provide SemVer.

### B. Client-Side Logic (Launcher/Installer)

- **No Sparse Checkout:** To avoid Git complexity on user machines, we download
  the full repo ZIP (via GitHub API/Archive).
- **Smart Caching:** The client must cache downloaded ZIPs. If Mod A and Mod B
  are in the same Modpack (same Commit SHA), download the ZIP once, extract
  twice.

## 4. Data Specification (Manifest Schema)

Agents generating or validating manifests must adhere to this JSON structure.
This supersedes internal `modinfo.json` data for installation purposes.

```json
{
  "schema_version": "1.0",
  "id": "unique_mod_id_internal",
  "display_name": "Dino Mod (Kenan Pack Variant)",
  "description": "Adds dinosaurs. Part of the larger modpack.",
  "author": "Kenan & Contributors",
  "license": "CC-BY-SA-4.0",

  // COMPATIBILITY
  "game_version_min": "0.9.1",
  "conflicts": ["dino_mod_legacy"],

  // INSTALLATION SOURCE
  "source": {
    "type": "github_archive",
    "url": "https://github.com/Kenan2000/CDDA-Structured-Kenan-Modpack/archive/a1b2c3d.zip",
    "commit_sha": "a1b2c3d4e5...",

    // CRITICAL: The path INSIDE the zip where the mod lives.
    // If root_dir is ".", the zip root is the mod.
    // If part of a modpack, specify the folder.
    "extract_path": "Kenan-Modpack/Mods/Dino_Mod"
  },

  // AUTO-UPDATE STRATEGY (For Bots)
  "autoupdate": {
    "type": "commit", // or "release"
    "branch": "master"
  }
}
```
