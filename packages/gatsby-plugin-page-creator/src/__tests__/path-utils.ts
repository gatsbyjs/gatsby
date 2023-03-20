import { pagesGlob } from "../path-utils"
import micromatch from "micromatch"

// We test pagesGlob with micromatch in order to test glob logic without having to mock the filesystem to generate patterns.
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
