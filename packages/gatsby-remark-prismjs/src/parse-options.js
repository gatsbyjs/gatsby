const rangeParser = require(`parse-numeric-range`)

module.exports = language => {
  if (!language) {
    return ``
  }
  if (language.split(`{`).length > 1) {
    let [splitLanguage] = language.split(`{`)

    let options = language
      .substring(language.lastIndexOf(`{`) + 1, language.lastIndexOf(`}`))
      .split(`;`)
    let highlightLines = [],
      outputLines = [],
      showLineNumbersLocal = false,
      numberLinesStartAt
    // Options can be given in any order and are optional
    // console.log(options.split(`;`))

    options.forEach(option => {
      // Test if the option is for line hightlighting
      if (rangeParser.parse(option).length > 0) {
        highlightLines = rangeParser.parse(option).filter(n => n > 0)
      }
      option = option.replace(/ /g, ``).split(`:`)
      // Test if the option is for line numbering
      // Option must look like `numberLines: true` or `numberLines: <integer>`
      // Otherwise we disable line numbering

      if (
        option.length === 2 &&
        option[0] === `numberLines` &&
        (option[1].trim() === `true` ||
          Number.isInteger(parseInt(option[1].trim(), 10)))
      ) {
        showLineNumbersLocal = true
        numberLinesStartAt =
          option[1].trim() === `true` ? 1 : parseInt(option[1].trim(), 10)
      }
      if (option.length === 2 && option[0] === `outputLines`) {
        outputLines = rangeParser.parse(option[1].trim()).filter(n => n > 0)
      }
    })

    return {
      splitLanguage,
      highlightLines,
      showLineNumbersLocal,
      numberLinesStartAt,
      outputLines,
    }
  }

  return { splitLanguage: language }
}
