var rangeParser = require("parse-numeric-range")

module.exports = language => {
  if (!language) {
    return ``
  }
  if (language.split(`{`).length > 1) {
    let [splitLanguage, rangeStr] = language.split(`{`)
    rangeStr = rangeStr.slice(0, -1)
    return {
      splitLanguage,
      highlightLines: rangeParser.parse(rangeStr).filter(n => n > 0),
    }
  }

  return { splitLanguage: language }
}
