'use strict'

const fs = require(`fs`)
const LZString = require(`lz-string`)
const { join } = require(`path`)
const map = require(`unist-util-map`)

const {
  OPTION_DEFAULT_LINK_TEXT,
  PROTOCOL_BABEL,
  PROTOCOL_CODEPEN,
} = require(`./constants`)

// Matches compression used in Babel REPL
// https://github.com/babel/website/blob/master/js/repl/UriUtils.js
const compress = string =>
  LZString.compressToBase64(string)
    .replace(/\+/g, `-`) // Convert '+' to '-'
    .replace(/\//g, `_`) // Convert '/' to '_'
    .replace(/=+$/, ``) // Remove ending '='

function createLinkNodes(text, href, target) {
  target = target ? `target="${target}" rel="noreferrer"` : ``

  return [
    {
      type: `html`,
      value: `<a href="${href}" ${target}>`,
    },
    {
      type: `text`,
      value: text,
    },
    {
      type: `html`,
      value: `</a>`,
    },
  ]
}

module.exports = ({ markdownAST }, { defaultText = OPTION_DEFAULT_LINK_TEXT, directory, target } = {}) => {
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
    filePath = join(directory, filePath)
    return filePath
  }

  const verifyFile = (path) => {
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
        const text = node.children.length === 0 ? defaultText : node.children[0].value

        parent.children.splice(
          index,
          1,
          ...createLinkNodes(text, href, target),
        )
      } else if (node.url.startsWith(PROTOCOL_CODEPEN)) {
        const filePath = getFilePath(node.url, PROTOCOL_CODEPEN, directory)

        verifyFile(filePath)

        const href = node.url.replace(PROTOCOL_CODEPEN, `/redirect-to-codepen/`)
        const text = node.children.length === 0 ? defaultText : node.children[0].value

        parent.children.splice(
          index,
          1,
          ...createLinkNodes(text, href, target),
        )
      }
    }

    // No change
    return node
  })

  return markdownAST
}
