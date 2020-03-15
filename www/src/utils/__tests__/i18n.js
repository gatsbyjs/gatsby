import { localizedPath, getLanguages, getLocaleAndBasePath } from "../i18n"

describe("getLanguages", () => {
  it("returns an empty list when no languages are passed in", () => {
    expect(getLanguages("")).toEqual([])
  })

  it("returns a list of languages", () => {
    expect(
      getLanguages("es ja id pl pt-BR zh-Hans").map(lang => lang.code)
    ).toEqual(["es", "ja", "id", "pl", "pt-BR", "zh-Hans"])
  })

  it("throws an error if the default language is defined", () => {
    expect(() => getLanguages("en ja")).toThrow(/default locale/i)
  })

  it("throws an error if an invalid locale is defined and references the languages file", () => {
    expect(() => getLanguages("simlish")).toThrow(/invalid locale/i)
    expect(() => getLanguages("simlish")).toThrow("i18n.json")
  })
})

describe("localizedPath", () => {
  it("returns the path when locale === defaultLang", () => {
    expect(localizedPath("en", "/")).toEqual("/")
    expect(localizedPath("en", "/docs/")).toEqual("/docs/")
    expect(localizedPath("en", "/docs/quick-start/")).toEqual(
      "/docs/quick-start/"
    )
  })

  it("returns a path prefixed with a locale for other languages", () => {
    expect(localizedPath("es", "/")).toEqual("/es/")
    expect(localizedPath("es", "/docs/")).toEqual("/es/docs/")
    expect(localizedPath("es", "/docs/quick-start/")).toEqual(
      "/es/docs/quick-start/"
    )
  })

  it("returns the path when a locale is already in the path", () => {
    expect(localizedPath("es", "/es/docs/")).toEqual("/es/docs/")
  })
})

describe("getLocaleAndBasePath", () => {
  const codes = ["es", "ja"]
  it("returns the locale and base path when passed a path with a locale", () => {
    expect(getLocaleAndBasePath("/es/", codes)).toEqual({
      locale: "es",
      basePath: "/",
    })
    expect(getLocaleAndBasePath("/es/docs/", codes)).toEqual({
      locale: "es",
      basePath: "/docs/",
    })
    expect(getLocaleAndBasePath("/es/docs/quick-start/", codes)).toEqual({
      locale: "es",
      basePath: "/docs/quick-start/",
    })
  })

  it("returns defaultLang when passed a path with no locale", () => {
    expect(getLocaleAndBasePath("/", codes)).toEqual({
      locale: "en",
      basePath: "/",
    })
    expect(getLocaleAndBasePath("/docs/", codes)).toEqual({
      locale: "en",
      basePath: "/docs/",
    })
    expect(getLocaleAndBasePath("/docs/quick-start/", codes)).toEqual({
      locale: "en",
      basePath: "/docs/quick-start/",
    })
  })
})
