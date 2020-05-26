"use strict"

const path = require(`path`)
const fs = require(`fs`)
const normalizePath = require(`normalize-path`)
const visit = require(`unist-util-visit`)
const rangeParser = require(`parse-numeric-range`)

// Language defaults to extension.toLowerCase();
// This map tracks languages that don't match their extension.
const FILE_EXTENSION_TO_LANGUAGE_MAP = {
  js: `jsx`,
  md: `markup`,
  sh: `bash`,
  rb: `ruby`,
  rs: `rust`,
  py: `python`,
  ps1: `powershell`,
  psm1: `powershell`,
  bat: `batch`,
  h: `c`,
  tex: `latex`,
}

const getLanguage = file => {
  if (!file.includes(`.`)) {
    return `none`
  }

  const extension = file.split(`.`).pop()

  return FILE_EXTENSION_TO_LANGUAGE_MAP.hasOwnProperty(extension)
    ? FILE_EXTENSION_TO_LANGUAGE_MAP[extension]
    : extension.toLowerCase()
}

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
      var sname = "";
      const rangePrefixIndex = snippetPath.indexOf(`#L`)
      if (rangePrefixIndex > -1) {
        const range = snippetPath.slice(rangePrefixIndex + 2)
        if (range.length === 1) {
          lines = [Number.parseInt(range, 10)]
        } else {
          lines = rangeParser.parse(range)
        }
        // Remove everything after the range prefix from file path
        snippetPath = snippetPath.slice(0, rangePrefixIndex)
      } else {
        var snamePrefixIndex = snippetPath.indexOf(`#SN`)
        if (snamePrefixIndex > -1) {
          sname = snippetPath.slice(snamePrefixIndex + 3)
          snippetPath = snippetPath.slice(0, snamePrefixIndex)
        }
      }


      if (!fs.existsSync(snippetPath)) {
        throw Error(`Invalid snippet specified; no such file "${snippetPath}"`)
      }

      let code = fs.readFileSync(snippetPath, `utf8`).trim()
      if (lines.length) {
        code = code
          .split(`\n`)
          .filter((_, lineNumber) => lines.includes(lineNumber + 1))
          .join(`\n`)
      } else if (sname.length) {
        let index1 = code.indexOf(`START SNIPPET ${sname}`)
        if (index1 > -1) {
          let index2 = code.indexOf(`\n`, index1)
          if (index2 > -1) {
            index2 = index2 + 1  // skip the newline
            let index3 = code.indexOf(`END SNIPPET ${sname}`, index2)
            if (index3 > -1) {
              let index4 = code.lastIndexOf(`\n`, index3)
              code = code.slice(index2, index4)
            } else {
              code = code.slice(index2)
            }
          } else {
            code = ``
          }
        } else {
          code = ``
        }
      }

      // PrismJS's theme styles are targeting pre[class*="language-"]
      // to apply its styles. We do the same here so that users
      // can apply a PrismJS theme and get the expected, ready-to-use
      // outcome without any additional CSS.
      //
      // @see https://github.com/PrismJS/prism/blob/1d5047df37aacc900f8270b1c6215028f6988eb1/themes/prism.css#L49-L54
      const language = getLanguage(snippetPath)

      // Change the node type to code, insert our file as value and set language.
      node.type = `code`
      node.value = code
      node.lang = language
    }
  })

  return markdownAST
}
