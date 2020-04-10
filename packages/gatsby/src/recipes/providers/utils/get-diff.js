const isNewline = require(`is-newline`)
const { diffLinesUnified } = require(`jest-diff`)
const chalk = require(`chalk`)

module.exports = async (oldString = `\n`, newString = `\n`) => {
  if (!isNewline(oldString.slice(-1))) {
    oldString += `\n`
  }
  if (!isNewline(newString.slice(-1))) {
    newString += `\n`
  }

  const oldStringSplits = oldString.split(/\r?\n/)
  const newStringSplits = newString.split(/\r?\n/)

  const options = {
    aAnnotation: `Original`,
    bAnnotation: `Modified`,
    aColor: chalk.red,
    bColor: chalk.green,
    includeChangeCounts: true,
    contextLines: 3,
    expand: false,
  }

  const diffText = diffLinesUnified(oldStringSplits, newStringSplits, options)

  return diffText
}
