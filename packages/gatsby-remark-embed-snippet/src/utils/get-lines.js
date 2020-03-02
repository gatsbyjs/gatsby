"use strict"

// Get the lines from a code snippet. One number in lines array
// to display one line, two numbers to capture a range.
const getLines = (snippetPath, code, lines) => {
  if (lines.length !== 1 && lines.length !== 2) {
    throw Error(
      `Invalid snippet line numbers specified in ${snippetPath}; Syntax is #Lx or #Lx-Ly`
    )
  }

  const codeLines = code.split(`\n`)

  lines.forEach(line => {
    if (codeLines.length < line) {
      throw Error(
        `Invalid snippet line numbers specified in ${snippetPath}; Lines do not exist`
      )
    }
  })

  if (lines.length === 1) {
    return codeLines[lines[0] - 1]
  }

  return codeLines.slice(lines[0] - 1, lines[1]).join(`\n`)
}

module.exports = getLines
