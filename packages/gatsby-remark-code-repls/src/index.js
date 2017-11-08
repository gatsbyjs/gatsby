const fs = require(`fs`)
const LZString = require(`lz-string`)
const path = require(`path`)
const map = require(`unist-util-map`)

const BABEL_REPL_PROTOCOL = `babel-repl://`
const CODEPEN_PROTOCOL = `codepen://`

const DEFAULT_LINK_TEXT = `REPL`
const DEFAULT_DIRECTORY = `examples/`

// Matches compression used in Babel REPL
// https://github.com/babel/website/blob/master/js/repl/UriUtils.js
const compress = string =>
  LZString.compressToBase64(string)
    .replace(/\+/g, `-`) // Convert '+' to '-'
    .replace(/\//g, `_`) // Convert '/' to '_'
    .replace(/=+$/, ``) // Remove ending '='

function createLinkNodes(text, href, target) {
  target = target ? `target="${target}"` : ``

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

module.exports = ({ markdownAST }, { defaultText = DEFAULT_LINK_TEXT, directory = DEFAULT_DIRECTORY, target } = {}) => {
  if (!directory.endsWith(`/`)) {
    directory += `/`
  }

  const getFilePath = (url, protocol, directory) => {
    let filePath = url.replace(protocol, ``)
    if (!filePath.endsWith(`.js`)) {
      filePath += `.js`
    }
    filePath = path.join(directory, filePath)
    return filePath
  }

  const verifyFile = (path) => {
    if (!fs.existsSync(path)) {
      throw Error(`Invalid REPL link specified; no such file "${path}"`)
    }
  }

  map(markdownAST, (node, index, parent) => {
    if (node.type === `link`) {
      if (node.url.startsWith(BABEL_REPL_PROTOCOL)) {
        const filePath = getFilePath(node.url, BABEL_REPL_PROTOCOL, directory)

        verifyFile(filePath)

        const code = compress(fs.readFileSync(filePath, `utf8`))
        const href = `https://babeljs.io/repl/#?presets=react&code_lz=${code}`
        const text = node.children.length === 0 ? defaultText : node.children[0].value

        parent.children.splice(
          index,
          1,
          ...createLinkNodes(text, href, target),
        )
      } else if (node.url.startsWith(CODEPEN_PROTOCOL)) {
        const filePath = getFilePath(node.url, CODEPEN_PROTOCOL, directory)

        verifyFile(filePath)

        const href = node.url.replace(CODEPEN_PROTOCOL, directory)
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
