let options = {}

type RenamedLangCode = {
  langCode: string
  as: string
}

type Options = {
  // TODO: type all options
  [key: string]: any
} & {
  languageConfig?: {
    enabledLanguages?: Array<string | RenamedLangCode>
    complexEnabledLanguages?: Array<RenamedLangCode>
    defaultLanguage?: string
    translatableEntities?: Array<string>
    nonTranslatableEntities?: Array<string>
  }
}

const mutateOptions = (options: Options) => {
  // Support renamed language codes in Drupal
  options?.languageConfig?.enabledLanguages?.forEach?.((lang, index) => {
    if (typeof lang === `object`) {
      // move the as langcode of the complex code to the enabled languages array
      options!.languageConfig!.enabledLanguages!.push(lang.as)
      // then move the complex lang-code to a different array
      options!.languageConfig!.complexEnabledLanguages ||= []
      options!.languageConfig!.complexEnabledLanguages.push(lang)
      // and remove it from enabledLanguages
      delete options!.languageConfig!.enabledLanguages![index]
    }
  })

  return options
}

export const setOptions = (newOptions: Options) => {
  options = mutateOptions(newOptions)
}

export const getOptions = () => options
