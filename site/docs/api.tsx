export const title = "API Documentation"
export const description = "OpenAPI specification and API endpoints for the BN Mod Registry"
export const layout = "base.tsx"

const SWAGGER_UI_CSS = "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
const SWAGGER_UI_JS = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"

export default () => {
  const initScript = `
    window.addEventListener('DOMContentLoaded', () => {
      window.SwaggerUIBundle({
        url: "/generated/openapi.json",
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        deepLinking: true,
        tryItOutEnabled: false
      });
    });
  `

  return (
    <>
      <h1>API Documentation</h1>
      <p>
        The BN Mod Registry provides a simple JSON API for accessing mod metadata.
      </p>

      <h2>Available Endpoints</h2>
      <ul>
        <li>
          <a href="/generated/mods.json">
            <code>mods.json</code>
          </a>{" "}
          - All mods as JSON array
        </li>
        <li>
          <a href="/generated/mods.md">
            <code>mods.md</code>
          </a>{" "}
          - All mods as Markdown table
        </li>
        <li>
          <a href="/generated/openapi.json">
            <code>openapi.json</code>
          </a>{" "}
          - OpenAPI specification
        </li>
        <li>
          <a href="/generated/mod_manifest.schema.json">
            <code>mod_manifest.schema.json</code>
          </a>{" "}
          - JSON Schema for mod manifests
        </li>
      </ul>

      <h2>OpenAPI Specification</h2>
      <link rel="stylesheet" href={SWAGGER_UI_CSS} />
      <script src={SWAGGER_UI_JS}></script>
      <script dangerouslySetInnerHTML={{ __html: initScript }} />
      <div id="swagger-ui"></div>
    </>
  )
}
