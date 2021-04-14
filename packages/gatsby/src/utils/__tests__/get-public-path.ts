import { getPublicPath } from "../get-public-path"

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

  describe(`assetPrefix variations`, () => {
    it(`handles relative assetPrefix`, () => {
      const localAssetPrefix = `/assets`
      expect(
        getPublicPath({
          pathPrefix,
          assetPrefix: localAssetPrefix,
          prefixPaths: true,
        })
      ).toBe(`${localAssetPrefix}${pathPrefix}`)
    })

    it(`handles URL assetPrefix, e.g. a CDN`, () => {
      const cdn = `https://cdn.example.org`
      expect(
        getPublicPath({
          pathPrefix,
          assetPrefix: cdn,
          prefixPaths: true,
        })
      ).toBe(`${cdn}${pathPrefix}`)
    })

    it(`handles double slashes`, () => {
      const cdn = `//cdn.example.org`
      expect(
        getPublicPath({
          pathPrefix,
          assetPrefix: cdn,
          prefixPaths: true,
        })
      ).toBe(`${cdn}${pathPrefix}`)
    })

    it(`handles trailing slashes`, () => {
      ;[`/assets/`, `https://cdn.example.org/`].forEach(prefix => {
        expect(
          getPublicPath({
            pathPrefix,
            assetPrefix: prefix,
            prefixPaths: true,
          })
        ).toBe(`${prefix.slice(0, -1)}${pathPrefix}`)
      })
    })
  })
})
