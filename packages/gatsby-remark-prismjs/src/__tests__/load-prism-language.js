const loadPrismLanguage = require(`../load-prism-language`)

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

  it(`loads languages when referred by their aliases (set as a String in components)`, () => {
    const language = `python`
    const languageAlias = `py`
    const Prism = require(`prismjs`)

    expect(Prism.languages).not.toHaveProperty(language)
    expect(Prism.languages).not.toHaveProperty(languageAlias)

    loadPrismLanguage(languageAlias)

    expect(Prism.languages).toHaveProperty(language)
    expect(Prism.languages).toHaveProperty(languageAlias)
  })

  it(`loads languages when referred by their aliases (set as as Array in components)`, () => {
    const language = `lisp`
    const languageAlias = `emacs-lisp`
    const Prism = require(`prismjs`)

    expect(Prism.languages).not.toHaveProperty(language)
    expect(Prism.languages).not.toHaveProperty(languageAlias)

    loadPrismLanguage(languageAlias)

    expect(Prism.languages).toHaveProperty(language)
    expect(Prism.languages).toHaveProperty(languageAlias)
  })
})
