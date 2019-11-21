"use strict"

const fs = require(`fs`)
const { extname, resolve, parse, join } = require(`path`)
const readdir = require(`recursive-readdir`)
const normalizePath = require(`normalize-path`)

const {
  OPTION_DEFAULT_REPL_DIRECTORY,
  OPTION_DEFAULT_CODEPEN,
} = require(`./constants`)

exports.createPages = async (
  { actions, reporter },
  {
    directory = OPTION_DEFAULT_REPL_DIRECTORY,
    codepen = OPTION_DEFAULT_CODEPEN,
  } = {}
) => {
  codepen = { ...OPTION_DEFAULT_CODEPEN, ...codepen }
  if (!directory.endsWith(`/`)) {
    directory += `/`
  }

  const { createPage } = actions

  if (!fs.existsSync(directory)) {
    reporter.panic(`Invalid REPL directory specified: "${directory}"`)
  }

  if (!fs.existsSync(codepen.redirectTemplate)) {
    reporter.panic(
      `Invalid REPL redirectTemplate specified: "${codepen.redirectTemplate}"`
    )
  }

  try {
    const files = await readdir(directory)
    if (files.length === 0) {
      console.warn(`Specified REPL directory "${directory}" contains no files`)

      return
    }

    // escape backslashes for windows
    const resolvedDirectory = resolve(directory)
    files.forEach(file => {
      if (extname(file) === `.js` || extname(file) === `.jsx`) {
        const parsedFile = parse(file)
        const relativeDir = parsedFile.dir.replace(`${resolvedDirectory}`, ``)
        const slug = `redirect-to-codepen${normalizePath(relativeDir)}/${
          parsedFile.name
        }`

        const code = fs.readFileSync(file, `utf8`)

        let css
        if (codepen.includeMatchingCSS === true) {
          try {
            css = fs.readFileSync(
              join(parsedFile.dir, `${parsedFile.name}.css`),
              `utf8`
            )
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
          html: codepen.html,
          js: code,
          js_external: codepen.externals.join(`;`),
          js_pre_processor: `babel`,
          layout: `left`,
          css,
        })
        createPage({
          path: slug,
          component: normalizePath(resolve(codepen.redirectTemplate)),
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
