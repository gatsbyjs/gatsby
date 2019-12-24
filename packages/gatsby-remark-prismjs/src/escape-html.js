module.exports = (code, additionalHtmlEscapes = {}) => {
  const baseHTMLEscapes = {
    "&": `&amp;`,
    ">": `&gt;`,
    "<": `&lt;`,
    '"': `&quot;`,
    "'": `&#39;`,
  }

  const htmlEscapes = {
    ...additionalHtmlEscapes,
    ...baseHTMLEscapes,
  }

  const escapedChars = char => htmlEscapes[char]

  const chars = Object.keys(htmlEscapes)

  const charsRe = new RegExp(`[${chars.join('')}]`, `g`)

  const rehasUnescapedChars = new RegExp(charsRe.source)

  return code && rehasUnescapedChars.test(code)
    ? code.replace(charsRe, escapedChars)
    : code
}
