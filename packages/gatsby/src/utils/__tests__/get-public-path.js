const getPublicPath = require(`../get-public-path`)

const assetPrefix = `https://cdn.example.com`
const pathPrefix = `/blog`

describe(`basic functionality`, () => {
  it(`returns assetPrefix`, () => {
    expect(
      getPublicPath({
        assetPrefix,
        prefixPaths: true,
      })
    ).toBe(assetPrefix)
  })

  it(`returns pathPrefix`, () => {
    expect(
      getPublicPath({
        pathPrefix,
        prefixPaths: true,
      })
    ).toBe(`/blog`)
  })

  it(`joins assetPrefix and pathPrefix`, () => {
    expect(
      getPublicPath({
        pathPrefix,
        assetPrefix,
        prefixPaths: true,
      })
    ).toBe(`${assetPrefix}${pathPrefix}`)
  })
})
