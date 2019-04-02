const Prism = require(`prismjs`)
const loadPrismLanguage = require(`./load-prism-language`)
const replaceStringWithRegex = require(`./replace-string-with-regexp`)

module.exports = languageExtensions => {
  //Create array of languageExtensions (if input is object)
  languageExtensions = [].concat(languageExtensions)

  languageExtensions.forEach(l => {
    loadLanguageExtension(l)
  })
}

let loadLanguageExtension = languageExtension => {
  if (!isObjectAndNotArray(languageExtension)) {
    throw new Error(
      `A languageExtension needs to be defined as an object. Given config is not valid: ${JSON.stringify(
        languageExtension
      )}`
    )
  }

  if (!containsMandatoryProperties(languageExtension)) {
    throw new Error(
      `A languageExtension needs to contain 'language' and 'extend' or both and a 'definition'. Given config is not valid: ${JSON.stringify(
        languageExtension
      )}`
    )
  }

  //If only 'extend' property is given, we extend the given extend language.
  if (!languageExtension.hasOwnProperty(`language`)) {
    languageExtension.language = languageExtension.extend
  }

  //To allow RegEx as 'string' in the config, we replace all strings with a regex object.
  languageExtension.definition = replaceStringWithRegex(
    languageExtension.definition
  )

  //If 'extend' property is given we start from that language, otherwise we add a language from scratch.
  if (languageExtension.hasOwnProperty(`extend`)) {
    //Loads language if not already loaded.
    loadPrismLanguage(languageExtension.extend)

    Prism.languages[languageExtension.language] = Prism.languages.extend(
      languageExtension.extend,
      languageExtension.definition
    )
  } else {
    Prism.languages[languageExtension.language] = languageExtension.definition
  }
}

const isObjectAndNotArray = extension =>
  //Array is an Object in javascript
  !(extension instanceof Array) && extension instanceof Object

const containsMandatoryProperties = languageExtension =>
  (languageExtension.language || languageExtension.extend) &&
  languageExtension.definition
