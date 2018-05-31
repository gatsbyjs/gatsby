const { resolve } = require(`path`)

const { exists, readFile, writeFile } = require(`fs-extra`)
const sqip = require(`sqip`)

const generateSqip = require(`../generate-sqip.js`)

jest.mock(`sqip`, () =>
  jest.fn(() => {
    return {
      final_svg: `<svg><!-- Mocked SQIP SVG --></svg>`,
    }
  })
)

jest.mock(`fs-extra`, () => {
  return {
    exists: jest.fn(() => false),
    readFile: jest.fn(() => `<svg><!-- Cached SQIP SVG --></svg>`),
    writeFile: jest.fn(),
  }
})

afterEach(() => {
  sqip.mockClear()
  exists.mockClear()
  readFile.mockClear()
  writeFile.mockClear()
})

describe(`gatsby-transformer-sqip`, async () => {
  const absolutePath = resolve(
    __dirname,
    `images`,
    `this-file-does-not-neet-to-exist-for-the-test.jpg`
  )
  const cacheDir = __dirname

  describe(`generateSqip`, () => {
    it(`not cached`, async () => {
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
      expect(result).toMatchSnapshot()

      expect(sqip).toHaveBeenCalledTimes(1)
      const sqipArgs = sqip.mock.calls[0][0]
      expect(sqipArgs.filename).toMatch(absolutePath)
      delete sqipArgs.filename
      expect(sqipArgs).toMatchSnapshot()

      expect(exists).toHaveBeenCalledTimes(1)
      expect(writeFile).toHaveBeenCalledTimes(1)
      expect(readFile).toHaveBeenCalledTimes(0)
    })
    it(`cached`, async () => {
      exists.mockImplementationOnce(() => true)
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

      expect(result).toMatchSnapshot()

      expect(sqip).toHaveBeenCalledTimes(0)

      expect(exists).toHaveBeenCalledTimes(1)
      expect(writeFile).toHaveBeenCalledTimes(0)
      expect(readFile).toHaveBeenCalledTimes(1)
    })
  })
})
