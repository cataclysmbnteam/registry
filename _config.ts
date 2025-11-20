import lume from "lume/mod.ts"
import date from "lume/plugins/date.ts"
import code_highlight from "lume/plugins/code_highlight.ts"
import pagefind from "lume/plugins/pagefind.ts"
import jsx from "lume/plugins/jsx.ts"
import metas from "lume/plugins/metas.ts"
import sitemap from "lume/plugins/sitemap.ts"
import esbuild from "lume/plugins/esbuild.ts"
import relativeUrls from "lume/plugins/relative_urls.ts"

const site = lume({
  src: "./site",
  dest: "./_site",
})

// Bundle Preact app for manifest generator (must be before metas)
site.add("app/main.tsx")
site.use(esbuild({ denoConfig: "site/app/deno.json" }))

// Core plugins
site.use(relativeUrls())
site.use(date())
site.use(code_highlight())
site.use(pagefind())
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
