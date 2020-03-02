"use strict"

const path = require(`path`)
const fs = require(`fs`)
const normalizePath = require(`normalize-path`)
const visit = require(`unist-util-visit`)

const getLanguage = require(`./utils/getLanguage`)
const getLines = require(`./utils/getLines`)

module.exports = ({ markdownAST, markdownNode }, { directory } = {}) => {
  if (!directory) {
    directory = path.dirname(markdownNode.fileAbsolutePath)
  }

  if (!fs.existsSync(directory)) {
    throw Error(`Invalid directory specified "${directory}"`)
  }

  visit(markdownAST, `inlineCode`, node => {
    const { value } = node

    if (value.startsWith(`embed:`)) {
      const file = value.substr(6)
      let snippetPath = normalizePath(path.join(directory, file))

      // Embed specific lines numbers of a file
      let lines = []
      if (snippetPath.indexOf(`#L`) > -1) {
        lines = snippetPath.match(/L\d+/g).map(l => l.replace(`L`, ``))
        // Remove everything after line hash from file path
        snippetPath = snippetPath.slice(0, snippetPath.indexOf(`#L`))
      }

      if (!fs.existsSync(snippetPath)) {
        throw Error(`Invalid snippet specified; no such file "${snippetPath}"`)
      }

      let code = fs.readFileSync(snippetPath, `utf8`).trim()
      if (lines.length) {
        code = getLines(snippetPath, code, lines)
      }

      // PrismJS's theme styles are targeting pre[class*="language-"]
      // to apply its styles. We do the same here so that users
      // can apply a PrismJS theme and get the expected, ready-to-use
      // outcome without any additional CSS.
      //
      // @see https://github.com/PrismJS/prism/blob/1d5047df37aacc900f8270b1c6215028f6988eb1/themes/prism.css#L49-L54
      const language = getLanguage(file)

      // Change the node type to code, insert our file as value and set language.
      node.type = `code`
      node.value = code
      node.lang = language
    }
  })

  return markdownAST
}
