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
  <article>
    <div>
      <h3>Generated Manifest</h3>
      <button type="button" onClick={onCopy}>
        {copied ? "Copied!" : "Copy to Clipboard"}
      </button>
    </div>
    <pre>
      <code>{manifestYaml}</code>
    </pre>
  </article>
)
