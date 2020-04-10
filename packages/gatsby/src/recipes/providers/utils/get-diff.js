const gitDiff = require(`git-diff/async`)
const isNewline = require(`is-newline`)

module.exports = async (oldString = `\n`, newString = `\n`) => {
  if (!isNewline(oldString.slice(-1))) {
    oldString += `\n`
  }
  if (!isNewline(newString.slice(-1))) {
    newString += `\n`
  }

  let diff = await gitDiff(oldString, newString, {
    color: true,
    noHeaders: true,
    flags: `--diff-algorithm=minimal`,
  })

  if (!diff) {
    diff = ``
  }

  return diff
}
