import report from "gatsby-cli/lib/reporter"
import { trackFeatureIsUsed } from "gatsby-telemetry"

import { findPageByPath } from "../find-page-by-path"
import { renderDevHTML } from "./render-dev-html"
import { appendPreloadHeaders } from "../develop-preload-headers"

export const route = ({ app, program, store }): any =>
  // Render an HTML page and serve it.
  app.get(`*`, async (req, res, next) => {
    trackFeatureIsUsed(`GATSBY_EXPERIMENTAL_DEV_SSR`)

    const pathObj = findPageByPath(store.getState(), decodeURI(req.path))

    if (!pathObj) {
      return next()
    }

    await appendPreloadHeaders(pathObj.path, res)

    const htmlActivity = report.phantomActivity(`building HTML for path`, {})
    htmlActivity.start()

    try {
      const renderResponse = await renderDevHTML({
        path: pathObj.path,
        page: pathObj,
        skipSsr: req.query[`skip-ssr`] || false,
        store,
        htmlComponentRendererPath: `${program.directory}/public/render-page.js`,
        directory: program.directory,
      })
      res.status(200).send(renderResponse)
    } catch (error) {
      // THe page errored but couldn't read the page component.
      // This is a race condition when a page is deleted but its requested
      // immediately after before anything can recompile.
      if (error === `404 page`) {
        return next()
      }

      report.error({
        id: `11614`,
        filePath: error.filename,
        location: {
          start: {
            line: error.line,
            column: error.row,
          },
        },
        context: {
          path: pathObj.path,
          filePath: error.filename,
          line: error.line,
          column: error.row,
        },
      })
      let errorHtml = `<head>
       <title>Develop SSR Error</title>
       <style>
          * {
            --gatsby: #663399;
            --gatsbyLight: #9158ca;
            --dimmedWhite: rgba(255, 255, 255, 0.8);
            --white: #ffffff;
            --black: #000000;
            --color-ansi-selection: rgba(95, 126, 151, 0.48);
            --color-ansi-bg: #fafafa;
            --color-ansi-fg: #545454;
            --color-ansi-white: #969896;
            --color-ansi-black: #141414;
            --color-ansi-blue: #183691;
            --color-ansi-cyan: #007faa;
            --color-ansi-green: #008000;
            --color-ansi-magenta: #795da3;
            --color-ansi-red: #d91e18;
            --color-ansi-yellow: #aa5d00;
            --color-ansi-bright-white: #ffffff;
            --color-ansi-bright-black: #545454;
            --color-ansi-bright-blue: #183691;
            --color-ansi-bright-cyan: #007faa;
            --color-ansi-bright-green: #008000;
            --color-ansi-bright-magenta: #795da3;
            --color-ansi-bright-red: #d91e18;
            --color-ansi-bright-yellow: #aa5d00;
            --radii: 5px;
            --z-index-normal: 5;
            --z-index-elevated: 10;
            --space: 1.5em;
            --space-sm: 1em;
            --space-lg: 2.5em;
          }
          [data-gatsby-overlay="backdrop"] {
            background: rgba(72, 67, 79, 0.5);
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            height: 100%;
            width: 100%;
            z-index: var(--z-index-normal);
            backdrop-filter: blur(10px);
          }
          body {
            font: 18px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
              "Segoe UI Symbol" !important;
            background: var(--color-ansi-bright-white);
            padding: var(--space);
            overflow: auto;
          }
          h1,
          h2,
          h3 {
            display: flex;
            align-items: center;
            color: var(--dimmedWhite);
            background: var(--gatsby);
            padding: var(--space);
            border-top-left-radius: var(--radii);
            border-top-right-radius: var(--radii);
          }
          code {
            font-family: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;
          }
          pre {
            margin: 0;
            color: var(--color-ansi-fg);
            padding: var(--space-sm);
            border-radius: var(--radii);
          }
          button {
            cursor: pointer;
            border: 1px;
            padding: 10px;
            background-color: var(--gatsbyLight);
            color: var(--white);
            appearance: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radii);
          }
        </style>
       </head>
        <h1>Error</h1>
        <h2>The page didn't server render (SSR) correctly</h2>
        <p style="padding-left: var(--space-sm);">
          React components in Gatsby must render successfully in the browser and in a
          node.js environment. When we tried to render your page component in
          node.js, it errored.
        </p>
        <ul>
          <li><strong>URL path:</strong> <code>${pathObj.path}</code></li>
          <li><strong>File path:</strong> <code>${error.filename}</code></li>
        </ul>
        <h3>error</h3>
        <code style="padding: var(--space);padding-left: var(--space-sm);">${error.message}</code>
        `

      if (error.codeFrame) {
        errorHtml += `<pre>${error.codeFrame}</pre>`
      }

      // Add link to help page
      errorHtml += `
      <p>For help debugging SSR errors, see this docs page: <a
      href="https://www.gatsbyjs.com/docs/debugging-html-builds/">https://www.gatsbyjs.com/docs/debugging-html-builds/</a></p>`

      // Add skip ssr button
      errorHtml += `
        <h3>Skip SSR</h3>
        <p style="padding-left: var(--space-sm);">
        If you don't wish to fix the SSR error at the moment, press the
        button below to reload the page without attempting SSR</p>
        <p style="padding-left: var(--space-sm);">
        <strong>Note</strong>: this error will show up in when you build your site so must be fixed before then.</p>
        <p style="padding-left: var(--space-sm);">
        <strong>Caveat</strong>: SSR errors in module scope i.e. outside of your components can't be skipped so will need fixed before you can continue</p>
        <button style="margin-left: var(--space-sm);" onclick='refreshWithQueryString()'>Skip SSR</button>
        <script>
          function refreshWithQueryString() {
            if ('URLSearchParams' in window) {
              var searchParams = new URLSearchParams(window.location.search);
              searchParams.set("skip-ssr", "true");
              window.location.search = searchParams.toString();
            }
          }
          </script>
        `
      res.status(500).send(errorHtml)
    }

    htmlActivity.end()

    // Make eslint happy
    return null
  })
