"use strict"

const fs = require(`fs`)
const normalizePath = require(`normalize-path`)
const visit = require(`unist-util-visit`)

// Language defaults to extension.toLowerCase();
// This map tracks languages that don't match their extension.
const FILE_EXTENSION_TO_LANGUAGE_MAP = {
  js: `jsx`,
  md: `markup`,
  sh: `bash`,
  rb: `ruby`,
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

module.exports = ({ markdownAST }, { directory } = {}) => {
  if (!directory) {
    throw Error(`Required option "directory" not specified`)
  } else if (!fs.existsSync(directory)) {
    throw Error(`Invalid directory specified "${directory}"`)
  } else if (!directory.endsWith(`/`)) {
    directory += `/`
  }

  visit(markdownAST, `inlineCode`, node => {
    const { value } = node

    if (value.startsWith(`embed:`)) {
      const file = value.substr(6)
      const path = normalizePath(`${directory}${file}`)

      if (!fs.existsSync(path)) {
        throw Error(`Invalid snippet specified; no such file "${path}"`)
      }

      // Change the node type to code, insert our file as value and set language.
      try {
        node.type = `code`
        node.value = code
        node.lang = language
      } catch (e) {
        // rethrow error pointing to a file
        throw Error(`${e.message}\nFile: ${file}`)
      }
    }
  })

  return markdownAST
}
