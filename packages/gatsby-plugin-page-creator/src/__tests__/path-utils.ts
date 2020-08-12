import { extractModel } from "../path-utils"

describe(`Path Utils`, () => {
  it(`extractModel`, () => {
    expect(
      extractModel(
        `/Users/blainekasten/Sites/unified-routes/src/pages/assets/{DatoCmsWork.slug}.js`
      )
    ).toBe(`DatoCmsWork`)
  })
})
