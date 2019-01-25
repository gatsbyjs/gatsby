const Prism = require(`prismjs`)
const loadPrismLanguage = require(`./load-prism-language`)
const replaceStringWithRegex = require(`./replace-string-with-regexp`)

module.exports = languageExtensions => {
  //  We only accept array or object as the 'languageExtensions' config property
  //  (Note that 'instanceof Object' will return true for both Array and Object)
  if (!(languageExtensions instanceof Object)) {
    console.log(
      `'languageExtensions' needs to be defined as an array or a JSON object: `,
      languageExtensions
    )
    throw new Error(
      `'languageExtensions' needs to be defined as an array or a JSON object.`
    )
  }

  //If an object is given in the config we convert it to an array with a single object.
  if (!(languageExtensions instanceof Array)) {
    languageExtensions = [languageExtensions]
  }

  languageExtensions.forEach(l => {
    loadLanguageExtension(l)
  })
}

let loadLanguageExtension = languageExtension => {
  if (!containsMandatoryProperties(languageExtension)) {
    console.log(
      `A languageExtension needs to contain 'language' and 'extend' or both and a 'definition'. Given config will not be loaded: `,
      languageExtension
    )
    return
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

const containsMandatoryProperties = languageExtension =>
  (languageExtension.hasOwnProperty(`language`) ||
    languageExtension.hasOwnProperty(`extend`)) &&
  languageExtension.hasOwnProperty(`definition`)
