// @ts-check
import { createUrl } from "../image-helpers"

describe(`Contentful Image API helpers`, () => {
  describe(`createUrl`, () => {
    it(`allows you to create URls`, () => {
      expect(
        createUrl(`//images.contentful.com/dsf/bl.jpg`, { width: 100 })
      ).toMatchInlineSnapshot(
        `"https://images.contentful.com/dsf/bl.jpg?w=100"`
      )
    })
    it(`ignores options it doesn't understand`, () => {
      expect(
        createUrl(`//images.contentful.com/dsf/bl.jpg`, { happiness: 100 })
      ).toMatchInlineSnapshot(`"https://images.contentful.com/dsf/bl.jpg?"`)
    })
  })
})
