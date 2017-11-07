const { existsSync, readFileSync } = require(`fs`)
const LZString = require(`lz-string`)
const { join } = require(`path`)
const map = require(`unist-util-map`)

const BABEL_REPL_PROTOCOL = `babel-repl://`
const CODEPEN_PROTOCOL = `codepen://`

// Matches compression used in Babel REPL
// https://github.com/babel/website/blob/master/js/repl/UriUtils.js
const compress = string =>
  LZString.compressToBase64(string)
    .replace(/\+/g, `-`) // Convert '+' to '-'
    .replace(/\//g, `_`) // Convert '/' to '_'
    .replace(/=+$/, ``) // Remove ending '='

function createLink(text, href, target) {
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

function verifyFile(path) {
  if (!existsSync(path)) {
    console.error(
      `Invalid REPL link specified; no such file "${path}"`,
    )
    process.exit(1)
  }
}

module.exports = ({ markdownAST }, { directory, target }) => {
  map(markdownAST, (node, index, parent) => {
    if (!directory.endsWith(`/`)) {
      directory += `/`
    }

    if (node.type === `link`) {
      if (node.url.startsWith(BABEL_REPL_PROTOCOL)) {
        let filePath = node.url.replace(BABEL_REPL_PROTOCOL, directory)
        if (!filePath.endsWith(`.js`)) {
          filePath += `.js`
        }
        filePath = join(__dirname, `../..`, filePath)

        verifyFile(filePath)

        const code = compress(readFileSync(filePath, `utf8`))
        const href = `https://babeljs.io/repl/#?presets=react&code_lz=${code}`
        const text = node.children[0].value

        parent.children.splice(
          index,
          1,
          ...createLink(text, href, target),
        )
      } else if (node.url.startsWith(CODEPEN_PROTOCOL)) {
        // TODO
      }
    }

    // No change
    return node
  })

  return markdownAST
}
