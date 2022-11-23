const loadLanguageExtension = require(`../load-prism-language-extension`)
const Prism = require(`prismjs`)

describe(`extend/add prism language`, () => {
  it(`should throw an error if the request is not an array or an object`, () => {
    let request = 4

    expect(() => loadLanguageExtension(request)).toThrow()

    request = `A weird string value, instead of an object or array`

    expect(() => loadLanguageExtension(request)).toThrow()
  })
  it(`should not throw an error if the request is an array`, () => {
    const request = []

    expect(() => loadLanguageExtension(request)).not.toThrow()
  })
  it(`should not throw an error if the request is a valid object (containing 'language' and 'definition')`, () => {
    const request = {
      language: `aTypicalLanguage`,
      definition: /aRegexp/,
    }

    expect(() => loadLanguageExtension(request)).not.toThrow()
  })
  it(`should throw an error if the request is not a valid object (containing 'language' and 'definition')`, () => {
    const request = {}

    expect(() => loadLanguageExtension(request)).toThrow()
  })
  it(`should throw an error if the request is an array containing an invalid object (not containing 'language' and 'definition')`, () => {
    const request = [
      {
        language: `aTypicalLanguage`,
        definition: /aRegexp/,
      },
      {},
    ]

    expect(() => loadLanguageExtension(request)).toThrow()
  })
  it(`should extend pre-loaded language`, () => {
    const request = {
      extend: `clike`,
      definition: {
        flexc_keyword: `(__cm|__circ|_lpp_indirect|__accum|__size_t|__ptrdiff_t|__wchar_t|__fixed|__abscall|__extcall|__stkcall|__sat|__i64_t|__i32_t|__i16_t|__r32_t|__r16_t|__u64_t|__u32_t|__u16_t|__a40_t|__a24_t)`,
      },
    }

    loadLanguageExtension(request)

    expect(Prism.languages[request.extend]).toBeDefined()
    expect(Prism.languages[request.extend]).toHaveProperty(`flexc_keyword`)
    expect(Prism.languages[request.extend][`flexc_keyword`]).toEqual(
      request.definition.flexc_keyword
    )
  })
  it(`should extend not pre-loaded language`, () => {
    const request = {
      extend: `c`,
      definition: {
        flexc_keyword: `(__cm|__circ|_lpp_indirect|__accum|__size_t|__ptrdiff_t|__wchar_t|__fixed|__abscall|__extcall|__stkcall|__sat|__i64_t|__i32_t|__i16_t|__r32_t|__r16_t|__u64_t|__u32_t|__u16_t|__a40_t|__a24_t)`,
      },
    }

    loadLanguageExtension(request)

    expect(Prism.languages[request.extend]).toBeDefined()
    expect(Prism.languages[request.extend]).toHaveProperty(`flexc_keyword`)
    expect(Prism.languages[request.extend][`flexc_keyword`]).toEqual(
      request.definition.flexc_keyword
    )
  })
  it(`should add new language from existing language`, () => {
    const request = {
      language: `flexc`,
      extend: `c`,
      definition: {
        flexc_keyword: `(__cm|__circ|_lpp_indirect|__accum|__size_t|__ptrdiff_t|__wchar_t|__fixed|__abscall|__extcall|__stkcall|__sat|__i64_t|__i32_t|__i16_t|__r32_t|__r16_t|__u64_t|__u32_t|__u16_t|__a40_t|__a24_t)`,
      },
    }

    const languagesBeforeLoaded = Object.keys(Prism.languages)
    expect(Prism.languages).not.toHaveProperty(request.language)

    loadLanguageExtension(request)

    const languagesAfterLoaded = Object.keys(Prism.languages)
    expect(Prism.languages).toHaveProperty(request.language)
    expect(languagesAfterLoaded.length).toBe(languagesBeforeLoaded.length + 1)
    expect(Prism.languages[request.language][`flexc_keyword`]).toEqual(
      request.definition.flexc_keyword
    )
  })
  it(`should add new language`, () => {
    const request = {
      language: `flexc2`, // Check if it is possible to reset scope somehow, instead of giving a new name.
      definition: {
        flexc_keyword: `(__cm|__circ|_lpp_indirect|__accum|__size_t|__ptrdiff_t|__wchar_t|__fixed|__abscall|__extcall|__stkcall|__sat|__i64_t|__i32_t|__i16_t|__r32_t|__r16_t|__u64_t|__u32_t|__u16_t|__a40_t|__a24_t)`,
      },
    }

    const languagesBeforeLoaded = Object.keys(Prism.languages)
    expect(Prism.languages).not.toHaveProperty(request.language)

    loadLanguageExtension(request)

    const languagesAfterLoaded = Object.keys(Prism.languages)
    expect(Prism.languages).toHaveProperty(request.language)
    expect(languagesAfterLoaded.length).toBe(languagesBeforeLoaded.length + 1)
    expect(Prism.languages[request.language][`flexc_keyword`]).toEqual(
      request.definition.flexc_keyword
    )
  })
  it(`should work to make two requests by sending an array`, () => {
    const request = [
      {
        language: `flexc3`, // Check if it is possible to reset scope somehow, instead of giving a new name.
        definition: {
          flexc_keyword: `(__cm|__circ|_lpp_indirect|__accum|__size_t|__ptrdiff_t|__wchar_t|__fixed|__abscall|__extcall|__stkcall|__sat|__i64_t|__i32_t|__i16_t|__r32_t|__r16_t|__u64_t|__u32_t|__u16_t|__a40_t|__a24_t)`,
        },
      },
      {
        extend: `c`,
        definition: {
          new_token: `(__cm|__circ|_lpp_indirect|__accum|__size_t|__ptrdiff_t|__wchar_t|__fixed|__abscall|__extcall|__stkcall|__sat|__i64_t|__i32_t|__i16_t|__r32_t|__r16_t|__u64_t|__u32_t|__u16_t|__a40_t|__a24_t)`,
        },
      },
    ]

    const languagesBeforeLoaded = Object.keys(Prism.languages)
    expect(Prism.languages).not.toHaveProperty(`flexc3`)
    expect(Prism.languages[`c`]).not.toHaveProperty(`new_token`)

    loadLanguageExtension(request)

    const languagesAfterLoaded = Object.keys(Prism.languages)
    expect(Prism.languages).toHaveProperty(`flexc3`)
    expect(languagesAfterLoaded.length).toBe(languagesBeforeLoaded.length + 1)
    expect(Prism.languages[`c`]).toHaveProperty(`new_token`)
  })
})
