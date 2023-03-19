import { pagesGlob } from "../find-collection-page-files"
import micromatch from "micromatch"

describe(`pagesGlob`, () => {
  it(`will match files with collection routes in their or any parent directory's name.`, async () => {
    const pathPatterns = [`a/{b}/c.tsx`, `a/{b}.tsx`]
    expect(micromatch(pathPatterns, pagesGlob)).toEqual(pathPatterns)
  })
})
