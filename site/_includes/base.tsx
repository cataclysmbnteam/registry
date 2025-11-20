export const layout = undefined

export default (
  { title, description, siteName, siteDescription, children }: Lume.Data,
  _helpers: Lume.Helpers,
) => (
  <>
    {{ __html: "<!DOCTYPE html>" }}
    <html lang="en" data-theme="dark">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} | {siteName}</title>
        <meta name="description" content={description || siteDescription} />
        {/* Google Font - Open Sans for classless.css */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Classless CSS framework */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/tacit-css@1.9.5/dist/tacit-css.min.css"
          integrity="sha384-QF+7u3GMRHdbU5nzxyNvTNkV0xQtQXEbAraWZcussxwNUsY3zrmDeAKc8jZ5jfTb"
          crossorigin="anonymous"
        />
        {/* Our customizations */}
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div id="search"></div>
        <nav>
          <ul>
            <li class="logo">
              <a href="/">Home</a>
            </li>
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
        </nav>

        <main>{children}</main>

        <footer>
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
