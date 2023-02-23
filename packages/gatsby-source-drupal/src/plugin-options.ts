let options: Options = {}

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
    renamedEnabledLanguages?: Array<RenamedLangCode>
    filterByLanguages?: boolean
    defaultLanguage?: string
    translatableEntities?: Array<string>
    nonTranslatableEntities?: Array<string>
  }
}

const mutateOptions = (options: Options) => {
  if (options?.languageConfig?.enabledLanguages?.length) {
    // Support renamed language codes in Drupal
    options.languageConfig.enabledLanguages.forEach(lang => {
      if (typeof lang === `object`) {
        // move the as langcode of the complex code to the enabled languages array
        options!.languageConfig!.enabledLanguages!.push(lang.as)
        // then move the complex lang-code to a different array
        options!.languageConfig!.renamedEnabledLanguages ||= []
        options!.languageConfig!.renamedEnabledLanguages.push(lang)
      }
    })

    // since we moved all the object enabled languages to a new array, we can remove them from enabledLanguages
    options.languageConfig.enabledLanguages =
      options.languageConfig.enabledLanguages.filter(
        lang => typeof lang === `string`
      )
  }

  return options
}

export const setOptions = (newOptions: Options) => {
  options = mutateOptions(newOptions)
}

export const getOptions = () => options
