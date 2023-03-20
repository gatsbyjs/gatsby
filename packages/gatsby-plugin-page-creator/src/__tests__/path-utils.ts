import { pagesGlob } from "../path-utils"
import micromatch from "micromatch"

describe(`pagesGlob`, () => {
  it(`will match files with collection routes in any segment of their file path.`, async () => {
    const pathPatterns = [
      `{a.slug}.tsx`,
      `a/{b.slug}.tsx`,
      `a/{b.slug}/c.tsx`,
      `a/{b.slug}/c/d.tsx`,
    ]
    expect(micromatch(pathPatterns, pagesGlob)).toHaveLength(
      pathPatterns.length
    )
  })
})
