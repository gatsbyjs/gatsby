import { createFilepathSlug } from "../create-filepath-slug"

describe(`createFilepathSlug`, () => {
  describe(`createPath`, () => {
    it(`generates path`, () => {
      const actual = createFilepathSlug(`add-filepath-slug.ts`)
      const expected = `add-filepath-slug`
      expect(actual).toBe(expected)
    })

    it(`handles directories`, () => {
      const actual = createFilepathSlug(`blog/post.md`)
      const expected = `blog/post`
      expect(actual).toBe(expected)
    })

    it(`handles illegal characters`, () => {
      const actual = createFilepathSlug("some illegal? \\ { } ` characters")
      const expected = `some-illegal-characters`
      expect(actual).toBe(expected)
    })

    it(`handles index pages`, () => {
      const actual = createFilepathSlug(`index.html`)
      const expected = ``
      expect(actual).toBe(expected)
    })

    it(`handles nested index pages`, () => {
      const actual = createFilepathSlug(`blog/index.html`)
      const expected = `blog/`
      expect(actual).toBe(expected)
    })
  })
})
