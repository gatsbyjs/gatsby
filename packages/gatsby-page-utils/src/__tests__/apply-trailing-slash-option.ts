import { applyTrailingSlashOption } from "../apply-trailing-slash-option"

describe(`applyTrailingSlashOption`, () => {
  const indexPage = `/`
  const withoutSlash = `/nested/path`
  const withSlash = `/nested/path/`

  it(`returns / for root index page`, () => {
    expect(applyTrailingSlashOption(indexPage)).toEqual(indexPage)
  })
  it(`should leave non-trailing paths for certain suffixes`, () => {
    expect(applyTrailingSlashOption(`/nested/path.html`)).toEqual(
      `/nested/path.html`
    )
    expect(applyTrailingSlashOption(`/nested/path.xml`)).toEqual(
      `/nested/path.xml`
    )
  })
  describe(`always`, () => {
    it(`should add trailing slash`, () => {
      expect(applyTrailingSlashOption(withoutSlash, `always`)).toEqual(
        withSlash
      )
    })
    it(`should leave existing slash`, () => {
      expect(applyTrailingSlashOption(withSlash, `always`)).toEqual(withSlash)
    })
  })
  describe(`never`, () => {
    it(`should leave root index`, () => {
      expect(applyTrailingSlashOption(indexPage, `never`)).toEqual(indexPage)
    })
    it(`should remove trailing slashes`, () => {
      expect(applyTrailingSlashOption(withSlash, `never`)).toEqual(withoutSlash)
    })
    it(`should leave non-trailing paths`, () => {
      expect(applyTrailingSlashOption(withoutSlash, `never`)).toEqual(
        withoutSlash
      )
    })
  })
  describe(`ignore`, () => {
    it(`should return input (trailing)`, () => {
      expect(applyTrailingSlashOption(withSlash, `ignore`)).toEqual(withSlash)
    })
    it(`should return input (non-trailing)`, () => {
      expect(applyTrailingSlashOption(withoutSlash, `ignore`)).toEqual(
        withoutSlash
      )
    })
  })
})
