/**
 * Manifest Generator Web App
 *
 * Interactive tool for generating mod manifest YAML files.
 * Uses Preact with signals for reactivity.
 */
import "preact/debug"
import { render } from "preact"
import { ManifestGenerator } from "./components/ManifestGenerator.tsx"

// Mount the app
const root = document.getElementById("manifest-generator")
if (root) render(<ManifestGenerator />, root)
