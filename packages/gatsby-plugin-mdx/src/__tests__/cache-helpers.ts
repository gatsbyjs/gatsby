import { createFileToMdxCacheKey } from "../cache-helpers"

describe(`cache helpers`, () => {
  it(`create mdx file cache key`, () => {
    expect(createFileToMdxCacheKey(`/mocked/path`)).toBe(
      `fileToMdx-/mocked/path`
    )
  })
})
