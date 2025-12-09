export const layout = undefined

export default (
  { title, description, siteName, siteDescription, children, url }: Lume.Data,
  _helpers: Lume.Helpers,
) => {
  // Determine page type for search indexing
  const isMod = url?.startsWith("/mods/") && url !== "/mods/"
  const isDoc = url?.startsWith("/docs/")
  // Only index mod and doc pages, not index/list pages
  const shouldIndex = isMod || isDoc
  // Determine search container ID based on section
  const searchId = isDoc ? "docs-search" : "search"

  // Theme initialization script (runs immediately to prevent flash)
  const themeScript = `
    const changeHighlight = () => {
      const light = document.getElementById("highlight-theme-light")
      if (light) light.disabled = theme === "dark"
      const dark = document.getElementById("highlight-theme-dark")
      if (dark) dark.disabled = theme === "light"
    }
    let theme = localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    changeHighlight()
    document.documentElement.dataset.theme = theme
    function changeTheme() {
      theme = theme === "dark" ? "light" : "dark"
      localStorage.setItem("theme", theme)
      document.documentElement.dataset.theme = theme
      changeHighlight()
    }
    function toggleMenu() {
      const menu = document.getElementById("nav-menu")
      const hamburger = document.querySelector(".hamburger")
      if (menu) {
        menu.classList.toggle("open")
        hamburger?.classList.toggle("open")
      }
    }
  `

  return (
    <>
      {{ __html: "<!DOCTYPE html>" }}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{title} | {siteName}</title>
          <meta name="description" content={description || siteDescription} />
          {/* Theme color meta tags for browser chrome */}
          <meta name="supported-color-schemes" content="light dark" />
          <meta
            name="theme-color"
            content="hsl(220, 20%, 100%)"
            media="(prefers-color-scheme: light)"
          />
          <meta
            name="theme-color"
            content="hsl(220, 20%, 10%)"
            media="(prefers-color-scheme: dark)"
          />
          {/* Pagefind section filter */}
          {isMod && <meta data-pagefind-filter="section:mod" />}
          {isDoc && <meta data-pagefind-filter="section:docs" />}
          {/* Theme script - must run before body to prevent flash */}
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
          {/* Our styles (imports @lumeland/ds) */}
          <link rel="stylesheet" href="/assets/styles.css" />
          <link
            id="highlight-theme-light"
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.6.0/build/styles/github.min.css"
          />
          <link
            id="highlight-theme-dark"
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.6.0/build/styles/dark.min.css"
          />
        </head>
        <body>
          <div id={searchId}></div>
          <nav data-pagefind-ignore>
            <ul>
              <li class="logo">
                <a href="/">Home</a>
              </li>
              <li class="nav-menu-wrapper">
                <ul class="nav-menu" id="nav-menu">
                  <li>
                    <a href="/mods/">Mods</a>
                  </li>
                  <li>
                    <a href="/docs/">Docs</a>
                  </li>
                  <li>
                    <a href="/generated/mods.json">mods.json</a>
                  </li>
                  <li class="sticky">
                    <a href="/docs/generator/" class="btn-add">Add Mod</a>
                  </li>
                </ul>
              </li>
              <li class="theme-toggle">
                <button
                  type="button"
                  aria-label="Toggle dark/light theme"
                  class="btn-theme"
                  onclick="changeTheme()"
                >
                  {/* Half-moon icon (circle with half filled) */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill="currentColor"
                      fill-rule="evenodd"
                      d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0Zm9 10a9 9 0 0 1-9 9V1a9 9 0 0 1 9 9Z"
                    />
                  </svg>
                </button>
              </li>
              <li class="hamburger-wrapper">
                <button
                  type="button"
                  aria-label="Toggle menu"
                  class="hamburger"
                  onclick="toggleMenu()"
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </button>
              </li>
            </ul>
          </nav>

          <main data-pagefind-body={shouldIndex ? "" : undefined}>
            {children}
          </main>

          <footer data-pagefind-ignore>
            <p>
              <a href="https://github.com/cataclysmbnteam/registry">BN Mod Registry</a>
              {" · "}
              <a href="https://github.com/cataclysmbnteam/Cataclysm-BN">
                Play Cataclysm: Bright Nights
              </a>
              {" · "}
              <a href="https://discord.gg/XW7XhXuZ89">Discord</a>
            </p>
            <p>
              2025 © Cataclysm: Bright Nights Contributors
            </p>
          </footer>
        </body>
      </html>
    </>
  )
}
