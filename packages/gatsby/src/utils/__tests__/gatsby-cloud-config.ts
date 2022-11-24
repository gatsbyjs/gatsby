import { constructConfigObject } from "../gatsby-cloud-config"

describe(`constructConfigObject`, () => {
  it(`should return defaults with empty config`, () => {
    expect(constructConfigObject({})).toEqual({
      trailingSlash: `always`,
      pathPrefix: ``,
    })
  })
  it(`should pass defined keys to output`, () => {
    expect(
      constructConfigObject({
        trailingSlash: `always`,
        pathPrefix: `/blog`,
        assetPrefix: `https://cdn.example.com`,
        jsxRuntime: `automatic`,
        plugins: [],
        siteMetadata: { title: `ACME` },
      })
    ).toEqual({
      trailingSlash: `always`,
      pathPrefix: `/blog`,
      assetPrefix: `https://cdn.example.com`,
    })
  })
})
