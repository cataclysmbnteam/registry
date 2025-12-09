/// <reference lib="dom" />

import { computed } from "@preact/signals"
import hljs from "npm:highlight.js/lib/core"
import lang_yaml from "npm:highlight.js/lib/languages/yaml"
import { manifestYaml } from "../ManifestGenerator.tsx"

hljs.registerLanguage("yaml", lang_yaml)

interface ManifestOutputProps {
  copied: boolean
  onCopy: () => void
}

const codeBlock = computed(() => hljs.highlight(manifestYaml.value, { language: "yaml" }).value)

/**
 * Output section showing the generated YAML manifest.
 */
export const ManifestOutput = (
  { copied, onCopy }: ManifestOutputProps,
) => {
  return (
    <aside class="manifest-output">
      <div class="output-header">
        <h3>Generated Manifest</h3>
        <button type="button" class="button is-secondary" onClick={onCopy}>
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <pre>
        <code class="language-yaml" dangerouslySetInnerHTML={{__html:codeBlock.value}}></code>
      </pre>
    </aside>
  )
}
