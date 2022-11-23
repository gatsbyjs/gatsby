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
  csproj: `xml`,
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
      const file = value.slice(6)
      let snippetPath = normalizePath(path.join(directory, file))

      // Embed specific lines numbers of a file
      let lines = []
      let sname = ``
      const rangePrefixIndex = snippetPath.indexOf(`#L`)
      if (rangePrefixIndex > -1) {
        const range = snippetPath.slice(rangePrefixIndex + 2)
        if (range.length === 1) {
          lines = [Number.parseInt(range, 10)]
        } else {
          lines = rangeParser(range)
        }
        // Remove everything after the range prefix from file path
        snippetPath = snippetPath.slice(0, rangePrefixIndex)
      } else {
        // Check to see if there is a {snippet: "snippetName"} following the file path.
        // This syntax could support additional options in the future - for now, only
        // handle a string that contains a `snippet :` option.
        const optionIndex = snippetPath.indexOf(`{`)
        if (optionIndex > -1) {
          const optionStr = snippetPath.slice(optionIndex)
          snippetPath = snippetPath.slice(0, optionIndex)
          try {
            const optVal = JSON.parse(
              optionStr.replace(/snippet\s*:/, `"snippet":`)
            )
            if (
              typeof optVal != `undefined` &&
              typeof optVal.snippet != `undefined`
            ) {
              sname = optVal.snippet
            } else {
              throw Error(`Invalid snippet options specified: ${optionStr}`)
            }
          } catch (err) {
            throw Error(`Invalid snippet options specified: ${optionStr}`)
          }
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
        const startSnippetMatcher = new RegExp(
          `start-snippet{${sname}}[^\r\n]*[\r\n](.*)`,
          `gs`
        )
        const startSnippetMatch = startSnippetMatcher.exec(code)
        if (startSnippetMatch?.length >= 2) {
          code = startSnippetMatch[1]

          const endSnippetMatcher = new RegExp(
            `(.*)[\r\n][^\r\n]*end-snippet{${sname}}`,
            `gs`
          )
          const endSnippetMatch = endSnippetMatcher.exec(code)
          if (endSnippetMatch?.length >= 2) {
            code = endSnippetMatch[1]
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
