const isEmpty = require(`lodash/isEmpty`)

module.exports = (code, additionalEscapeCharacters = {}) => {
  if (isEmpty(additionalEscapeCharacters)) return code
  const escapedChars = char => additionalEscapeCharacters[char]
  const chars = Object.keys(additionalEscapeCharacters)

  const charsRe = new RegExp(`[${chars.join()}]`, `g`)

  const rehasUnescapedChars = new RegExp(charsRe.source)

  return code && rehasUnescapedChars.test(code)
    ? code.replace(charsRe, escapedChars)
    : code
}
