const { resolve } = require(`path`)

const { remove } = require(`fs-extra`)

const generateSqip = require(`../generate-sqip.js`)

describe(`gatsby-transformer-sqip`, async () => {
  const absolutePath = resolve(
    __dirname,
    `images`,
    `alisa-anton-166247-unsplash-400px.jpg`
  )
  const cacheDir = __dirname

  // const file = getFileObject(absolutePath)

  describe(`generateSqip`, () => {
    it(`generates sqip`, async () => {
      const cache = {
        get: jest.fn(),
        set: jest.fn(),
      }
      const numberOfPrimitives = 5
      const blur = 0
      const mode = 3
      const result = await generateSqip({
        cache,
        cacheDir,
        absolutePath,
        numberOfPrimitives,
        blur,
        mode,
      })
      // @todo snapshots won't help here since primitive changes it's output every time. Consider counting primitives and checking blur setting via cheerio
      expect(result).toMatchSnapshot()
      // @todo delete properly
      await remove(resolve(cacheDir, `alisa-anton-166247-unsplash-400px.svg`))
    })
  })
})
