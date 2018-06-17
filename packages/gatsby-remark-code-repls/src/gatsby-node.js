"use strict"

const fs = require(`fs`)
const { extname, resolve } = require(`path`)
const recursiveReaddir = require(`recursive-readdir-synchronous`)
const normalizePath = require(`normalize-path`)

const {
  OPTION_DEFAULT_LINK_TEXT,
  OPTION_DEFAULT_HTML,
  OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH,
} = require(`./constants`)

exports.createPages = (
  { actions },
  {
    directory = OPTION_DEFAULT_LINK_TEXT,
    externals = [],
    html = OPTION_DEFAULT_HTML,
    redirectTemplate = OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH,
  } = {}
) => {
  if (!directory.endsWith(`/`)) {
    directory += `/`
  }

  const { createPage } = actions

  if (!fs.existsSync(directory)) {
    throw Error(`Invalid REPL directory specified: "${directory}"`)
  }

  if (!fs.existsSync(redirectTemplate)) {
    throw Error(
      `Invalid REPL redirectTemplate specified: "${redirectTemplate}"`
    )
  }

  // TODO We could refactor this to use 'recursive-readdir' instead,
  // And wrap with Promise.all() to execute createPage() in parallel.
  // I'd need to find a way to reliably test error handling though.
  const files = recursiveReaddir(directory)

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
}
