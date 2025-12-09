import lume from "lume/mod.ts"
import date from "lume/plugins/date.ts"
import pagefind from "lume/plugins/pagefind.ts"
import jsx from "lume/plugins/jsx.ts"
import metas from "lume/plugins/metas.ts"
import sitemap from "lume/plugins/sitemap.ts"
import esbuild from "lume/plugins/esbuild.ts"
import relativeUrls from "lume/plugins/relative_urls.ts"

const site = lume({ src: "./site", dest: "./_site" })

// Bundle Preact app for manifest generator (must be before metas)
site.add("app/main.tsx")
site.use(esbuild({ denoConfig: "site/app/deno.json", options: { sourcemap: "both" } }))

// Core plugins
site.use(relativeUrls())
site.use(date())

// Pagefind search - use two container IDs for different sections
// The 'search' container shows mods only, 'docs-search' shows docs only
site.use(pagefind({
  ui: {
    containerId: "search",
    showImages: false,
    showEmptyFilters: false,
    resetStyles: true,
  },
}))

// Process HTML to add a second search instance for docs
site.process([".html"], (pages) => {
  for (const page of pages) {
    const { document } = page
    if (!document) continue

    // Find docs-search container and initialize it with docs filter
    const docsSearch = document.getElementById("docs-search")
    if (docsSearch) {
      // Add CSS
      const styles = document.createElement("link")
      styles.setAttribute("rel", "stylesheet")
      styles.setAttribute("href", "/pagefind/pagefind-ui.css")
      const firstStyle = document.head.querySelector("link[rel=stylesheet],style")
      if (firstStyle) {
        document.head.insertBefore(styles, firstStyle)
      } else {
        document.head.append(styles)
      }

      // Add script
      const script = document.createElement("script")
      script.setAttribute("type", "text/javascript")
      script.setAttribute("src", "/pagefind/pagefind-ui.js")
      document.head.append(script)

      // Initialize with docs filter
      const init = document.createElement("script")
      init.setAttribute("type", "text/javascript")
      init.innerHTML = `
        window.addEventListener('DOMContentLoaded', () => {
          new PagefindUI({
            element: "#docs-search",
            showImages: false,
            showEmptyFilters: false,
            resetStyles: true,
            bundlePath: "/pagefind/",
            baseUrl: "/",
            filters: { section: "docs" }
          });
        });
      `
      document.head.append(init)
    }

    // For the main search, add filter for mods only
    const mainSearch = document.getElementById("search")
    if (mainSearch) {
      // Find existing PagefindUI initialization and modify it
      const scripts = document.querySelectorAll("script")
      for (const s of scripts) {
        if (s.innerHTML?.includes("new PagefindUI")) {
          // Replace to add mods filter
          s.innerHTML = s.innerHTML.replace(
            /new PagefindUI\(\{/,
            'new PagefindUI({ filters: { section: "mod" },',
          )
        }
      }
    }
  }
})

site.use(jsx())
site.use(metas())
site.use(sitemap())

site.copy("generated")
site.copy("assets")
site.copy("styles.css")
site.copy("manifest-generator.css")

// Global data
site.data("siteName", "BN Mod Registry")
site.data(
  "siteDescription",
  "Community mod registry for Cataclysm: Bright Nights",
)
site.data("siteUrl", "https://cataclysmbnteam.github.io/registry")

export default site
