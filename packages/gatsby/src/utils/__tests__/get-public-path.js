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

describe(`fallback behavior`, () => {
  it(`uses default if prefixPaths is not specified`, () => {
    expect(
      getPublicPath({
        assetPrefix,
        pathPrefix,
        prefixPaths: false,
      })
    ).toBe(`/`)
  })

  it(`can customize the default`, () => {
    const fallback = ``
    expect(
      getPublicPath(
        {
          assetPrefix,
          pathPrefix,
          prefixPaths: false,
        },
        fallback
      )
    ).toBe(fallback)
  })
})
