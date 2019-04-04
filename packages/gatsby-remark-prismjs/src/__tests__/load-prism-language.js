const loadPrismLanguage = require(`../load-prism-language`)

const { getBaseLanguageName } = loadPrismLanguage

describe(`load prism language`, () => {
  afterEach(() => {
    jest.resetModules()
  })

  it(`throw if language not support`, () => {
    expect(() => loadPrismLanguage(`imnotalanguage`)).toThrow(
      `Prism doesn't support language 'imnotalanguage'.`
    )
  })

  it(`load supported language`, () => {
    const language = `c`
    const Prism = require(`prismjs`)

    const languagesBeforeLoaded = Object.keys(Prism.languages)
    expect(Prism.languages).not.toHaveProperty(language)

    loadPrismLanguage(language)

    const languagesAfterLoaded = Object.keys(Prism.languages)
    expect(Prism.languages).toHaveProperty(language)
    expect(languagesAfterLoaded.length).toBe(languagesBeforeLoaded.length + 1)
  })

  it(`also load the required language`, () => {
    const language = `cpp`
    const requiredLanguage = `c`
    const Prism = require(`prismjs`)

    const languagesBeforeLoaded = Object.keys(Prism.languages)
    expect(Prism.languages).not.toHaveProperty(language)
    expect(Prism.languages).not.toHaveProperty(requiredLanguage)

    loadPrismLanguage(language)

    const languagesAfterLoaded = Object.keys(Prism.languages)
    expect(Prism.languages).toHaveProperty(language)
    expect(Prism.languages).toHaveProperty(requiredLanguage)
    expect(languagesAfterLoaded.length).toBe(languagesBeforeLoaded.length + 2)
  })

  describe(`aliasing`, () => {
    it(`returns undefined if language does not exist`, () => {
      const baseLanguage = getBaseLanguageName(`suhdude`, {
        languages: {
          python: {},
        },
      })

      expect(baseLanguage).toBe(undefined)
    })

    it(`defaults to language, if exists in lookup`, () => {
      const language = `python`

      const baseLanguage = getBaseLanguageName(language, {
        languages: {
          [language]: {},
        },
      })

      expect(baseLanguage).toBe(language)
    })

    it(`loads language that has a single alias`, () => {
      const language = `python`
      const alias = `py`

      const baseLanguage = getBaseLanguageName(alias, {
        languages: {
          [language]: {
            alias,
          },
        },
      })

      expect(baseLanguage).toBe(language)
    })

    it(`loads language that has an array of aliases`, () => {
      const language = `lisp`
      const alias = `emacs-lisp`

      const baseLanguage = getBaseLanguageName(alias, {
        languages: {
          [language]: {
            alias: [alias],
          },
        },
      })

      expect(baseLanguage).toBe(language)
    })
  })
})
