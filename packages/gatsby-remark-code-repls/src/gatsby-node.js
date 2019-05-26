"use strict"

const fs = require(`fs`)
const { extname, resolve } = require(`path`)
const readdir = require(`recursive-readdir`)
const normalizePath = require(`normalize-path`)

const {
  OPTION_DEFAULT_LINK_TEXT,
  OPTION_DEFAULT_HTML,
  OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH,
  OPTION_DEFAULT_INCLUDE_MATCHING_CSS,
} = require(`./constants`)

exports.createPages = async (
  { actions, reporter },
  {
    directory = OPTION_DEFAULT_LINK_TEXT,
    externals = [],
    html = OPTION_DEFAULT_HTML,
    redirectTemplate = OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH,
    includeMatchingCSS = OPTION_DEFAULT_INCLUDE_MATCHING_CSS,
  } = {}
) => {
  if (!directory.endsWith(`/`)) {
    directory += `/`
  }

  const { createPage } = actions

  if (!fs.existsSync(directory)) {
    reporter.panic(`Invalid REPL directory specified: "${directory}"`)
  }

  if (!fs.existsSync(redirectTemplate)) {
    reporter.panic(
      `Invalid REPL redirectTemplate specified: "${redirectTemplate}"`
    )
  }

  try {
    const files = await readdir(directory)
    if (files.length === 0) {
      console.warn(`Specified REPL directory "${directory}" contains no files`)

      return
    }

    files.forEach(file => {
      if (extname(file) === `.js` || extname(file) === `.jsx`) {
        const slug = file
          .substring(0, file.length - extname(file).length)
          .replace(new RegExp(`^${directory}`), `redirect-to-codepen/`)
        const code = fs.readFileSync(file, `utf8`)

        let css
        if (includeMatchingCSS === true) {
          try {
            css = fs.readFileSync(file.replace(extname(file), `.css`), `utf8`)
          } catch (err) {
            // If the file doesn't exist, we gracefully ignore the error
            if (err.code !== `ENOENT`) {
              throw err
            }
          }
        }

        // Codepen configuration.
        // https://blog.codepen.io/documentation/api/prefill/
        const action = `https://codepen.io/pen/define`
        const payload = JSON.stringify({
          editors: `0010`,
          html,
          js: code,
          js_external: externals.join(`;`),
          js_pre_processor: `babel`,
          layout: `left`,
          css,
        })

        createPage({
          path: slug,
          // Normalize the path so tests pass on Linux + Windows
          component: normalizePath(resolve(redirectTemplate)),
          context: {
            action,
            payload,
          },
        })
      }
    })
  } catch (error) {
    reporter.panic(
      `
      Error in gatsby-remark-code-repls plugin: cannot read directory ${directory}.
      More details can be found in the error reporting below.
      `,
      error
    )
  }
}
