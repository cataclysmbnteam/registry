/// <reference lib="dom" />
/**
 * Output section showing the generated YAML manifest.
 */

interface ManifestOutputProps {
  manifestYaml: string
  copied: boolean
  onCopy: () => void
}

export const ManifestOutput = (
  { manifestYaml, copied, onCopy }: ManifestOutputProps,
) => (
  <aside class="manifest-output">
    <div class="output-header">
      <h3>Generated Manifest</h3>
      <button type="button" class="button is-secondary" onClick={onCopy}>
        {copied ? "✓ Copied!" : "Copy"}
      </button>
    </div>
    <pre class="language-yaml">
      <code class="language-yaml">{manifestYaml}</code>
    </pre>
  </aside>
)
