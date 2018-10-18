jest.mock(`../../redux`, () => {
  return {
    store: { getState: jest.fn() },
  }
})

const getAssetPath = require(`../get-asset-path`)
const { store } = require(`../../redux`)

describe(`getAssetPath function`, () => {
  describe(`default configuration`, () => {
    beforeEach(() => {
      store.getState.mockReturnValue({
        config: {
          pathPrefix: ``,
          assetPath: ``,
        },
      })
    })

    it(`should return correct output path`, () => {
      const path = `some--component--1234.js`
      const result = getAssetPath(path).asOutputPath()
      expect(result).toBe(`static/${path}`)
    })
  
    it(`should return correct data output path`, () => {
      const path = `data.json`
      const result = getAssetPath(path).forData().asOutputPath()
      expect(result).toBe(`static/d/${path}`)
    })

    it(`should return correct data route`, () => {
      const path = `data.json`
      const result = getAssetPath(path).forData().asRoute()
      expect(result).toBe(`/static/d/${path}`)
    })

    it(`should return correct route`, () => {
      const path = `some--component--1234.js`
      const result = getAssetPath(path).asRoute()
      expect(result).toBe(`/static/${path}`)
    })
  })

  describe(`when assetPath is configured`, () => {
    const assetPath = `/assets`

    beforeEach(() => {
      store.getState.mockReturnValue({
        config: {
          assetPath,
          pathPrefix: ``,
        },
      })
    })

    it(`should return correct output path`, () => {
      const path = `some--component--1234.js`
      const result = getAssetPath(path).asOutputPath()
      expect(result).toBe(`${assetPath}/static/${path}`)
    })
  
    it(`should return correct data output path`, () => {
      const path = `data.json`
      const result = getAssetPath(path).forData().asOutputPath()
      expect(result).toBe(`${assetPath}/static/d/${path}`)
    })

    it(`should return correct data route`, () => {
      const path = `data.json`
      const result = getAssetPath(path).forData().asRoute()
      expect(result).toBe(`${assetPath}/static/d/${path}`)
    })

    it(`should return correct route`, () => {
      const path = `some--component--1234.js`
      const result = getAssetPath(path).asRoute()
      expect(result).toBe(`${assetPath}/static/${path}`)
    })
  })

  describe(`when only pathPrefix is configured`, () => {
    const pathPrefix = `/blog`

    beforeEach(() => {
      store.getState.mockReturnValue({
        config: {
          pathPrefix,
          assetPath: ``,
        },
      })
    })

    it(`should return correct output path`, () => {
      const path = `some--component--1234.js`
      const result = getAssetPath(path).asOutputPath()
      expect(result).toBe(`static/${path}`)
    })
  
    it(`should return correct data output path`, () => {
      const path = `data.json`
      const result = getAssetPath(path).forData().asOutputPath()
      expect(result).toBe(`static/d/${path}`)
    })

    it(`should return correct data route`, () => {
      const path = `data.json`
      const result = getAssetPath(path).forData().asRoute()
      expect(result).toBe(`${pathPrefix}/static/d/${path}`)
    })

    it(`should return correct route`, () => {
      const path = `some--component--1234.js`
      const result = getAssetPath(path).asRoute()
      expect(result).toBe(`${pathPrefix}/static/${path}`)
    })
  })
})