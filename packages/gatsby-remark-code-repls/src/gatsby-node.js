"use strict"

const fs = require(`fs`)
const { extname, resolve } = require(`path`)
const recursiveReaddir = require(`recursive-readdir-synchronous`)
const normalizePath = require(`normalize-path`)

const {
  OPTION_DEFAULT_LINK_TEXT,
  OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH,
} = require(`./constants`)

function createCodepenPage({
  code,
  directory,
  externals,
  file,
  redirectTemplate,
}) {
  const path = file
    .substring(0, file.length - extname(file).length)
    .replace(new RegExp(`^${directory}`), `redirect-to-codepen/`)

  // Codepen configuration.
  // https://blog.codepen.io/documentation/api/prefill/
  const action = `https://codepen.io/pen/define`
  const payload = JSON.stringify({
    editors: `0010`,
    html: `<div id="root"></div>`,
    js: code,
    js_external: externals.join(`;`),
    js_pre_processor: `babel`,
    layout: `left`,
  })

  return {
    path,
    // Normalize the path so tests pass on Linux + Windows
    component: normalizePath(resolve(redirectTemplate)),
    context: {
      action,
      payload,
    },
  }
}

function createCodeSandboxPage({
  code,
  dependencies,
  directory,
  file,
  redirectTemplate,
}) {
  const path = file
    .substring(0, file.length - extname(file).length)
    .replace(new RegExp(`^${directory}`), `redirect-to-code-sandbox/`)

  // CodeSandbox configuration.
  // TODO Add link to API documentation once it's available
  const action = `https://codesandbox.io/api/v1/define`
  const payload = JSON.stringify({
    files: {
      "package.json": {
        contents: {
          dependencies: dependencies.reduce((map, dependency) => {
            if (dependency.includes(`@`)) {
              const [name, version] = dependency.split(`@`)
              map[name] = version
            } else {
              map[dependency] = `latest`
            }

            return map
          }, {}),
        },
      },
      "index.js": {
        contents: code,
      },
    },
  })

  return {
    path,
    // Normalize the path so tests pass on Linux + Windows
    component: normalizePath(resolve(redirectTemplate)),
    context: {
      action,
      payload,
    },
  }
}

exports.createPages = (
  { boundActionCreators },
  {
    dependencies = [],
    directory = OPTION_DEFAULT_LINK_TEXT,
    externals = [],
    redirectTemplate = OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH,
  } = {}
) => {
  if (!directory.endsWith(`/`)) {
    directory += `/`
  }

  const { createPage } = boundActionCreators

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
      const code = fs.readFileSync(file, `utf8`)

      createPage(
        createCodepenPage({
          code,
          dependencies,
          directory,
          externals,
          file,
          redirectTemplate,
        })
      )
      createPage(
        createCodeSandboxPage({
          code,
          dependencies,
          directory,
          externals,
          file,
          redirectTemplate,
        })
      )
    }
  })
}
