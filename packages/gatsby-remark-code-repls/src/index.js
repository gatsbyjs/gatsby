"use strict"

const URI = require(`urijs`)

const fs = require(`fs`)
const LZString = require(`lz-string`)
const { join } = require(`path`)
const map = require(`unist-util-map`)
const normalizePath = require(`normalize-path`)

const {
  OPTION_DEFAULT_LINK_TEXT,
  OPTION_DEFAULT_HTML,
  PROTOCOL_BABEL,
  PROTOCOL_CODEPEN,
  PROTOCOL_CODE_SANDBOX,
  PROTOCOL_RAMDA,
} = require(`./constants`)

// Matches compression used in Babel and CodeSandbox REPLs
// https://github.com/babel/website/blob/master/js/repl/UriUtils.js
const compress = string =>
  LZString.compressToBase64(string)
    .replace(/\+/g, `-`) // Convert '+' to '-'
    .replace(/\//g, `_`) // Convert '/' to '_'
    .replace(/=+$/, ``) // Remove ending '='

function convertNodeToLink(node, text, href, target) {
  target = target ? `target="${target}" rel="noreferrer"` : ``

  delete node.children
  delete node.position
  delete node.title
  delete node.url

  node.type = `html`
  node.value = `<a href="${href}" ${target}>${text}</a>`
}

module.exports = (
  { markdownAST },
  {
    defaultText = OPTION_DEFAULT_LINK_TEXT,
    dependencies = [],
    directory,
    html = OPTION_DEFAULT_HTML,
    target,
  } = {}
) => {
  if (!directory) {
    throw Error(`Required REPL option "directory" not specified`)
  } else if (!fs.existsSync(directory)) {
    throw Error(`Invalid REPL directory specified "${directory}"`)
  } else if (!directory.endsWith(`/`)) {
    directory += `/`
  }

  const getFilePath = (url, protocol, directory) => {
    let filePath = url.replace(protocol, ``)
    if (!filePath.endsWith(`.js`)) {
      filePath += `.js`
    }
    filePath = normalizePath(join(directory, filePath))
    return filePath
  }

  const verifyFile = path => {
    if (!fs.existsSync(path)) {
      throw Error(`Invalid REPL link specified; no such file "${path}"`)
    }
  }

  map(markdownAST, (node, index, parent) => {
    if (node.type === `link`) {
      if (node.url.startsWith(PROTOCOL_BABEL)) {
        const filePath = getFilePath(node.url, PROTOCOL_BABEL, directory)

        verifyFile(filePath)

        const code = compress(fs.readFileSync(filePath, `utf8`))
        const href = `https://babeljs.io/repl/#?presets=react&code_lz=${code}`
        const text =
          node.children.length === 0 ? defaultText : node.children[0].value

        convertNodeToLink(node, text, href, target)
      } else if (node.url.startsWith(PROTOCOL_CODEPEN)) {
        const filePath = getFilePath(node.url, PROTOCOL_CODEPEN, directory)

        verifyFile(filePath)

        const href = node.url.replace(PROTOCOL_CODEPEN, `/redirect-to-codepen/`)
        const text =
          node.children.length === 0 ? defaultText : node.children[0].value

        convertNodeToLink(node, text, href, target)
      } else if (node.url.startsWith(PROTOCOL_CODE_SANDBOX)) {
        const filePath = getFilePath(node.url, PROTOCOL_CODE_SANDBOX, directory)

        verifyFile(filePath)

        const code = fs.readFileSync(filePath, `utf8`)

        // CodeSandbox GET API requires a list of "files" keyed by name
        let parameters = {
          files: {
            "package.json": {
              content: {
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
              content: code,
            },
            "index.html": {
              content: html,
            },
          },
        }

        // This config JSON must then be lz-string compressed
        parameters = compress(JSON.stringify(parameters))

        const href = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`
        const text =
          node.children.length === 0 ? defaultText : node.children[0].value

        convertNodeToLink(node, text, href, target)
      } else if (node.url.startsWith(PROTOCOL_RAMDA)) {
        const filePath = getFilePath(node.url, PROTOCOL_RAMDA, directory)

        verifyFile(filePath)

        // Don't use `compress()` as the Ramda REPL won't understand the output.
        // It uses URI to encode the code for its urls, so we do the same.
        const code = URI.encode(fs.readFileSync(filePath, `utf8`))
        const href = `http://ramdajs.com/repl/#?${code}`
        const text =
          node.children.length === 0 ? defaultText : node.children[0].value
        convertNodeToLink(node, text, href, target)
      }
    }

    // No change
    return node
  })

  return markdownAST
}
