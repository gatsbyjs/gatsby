import { resolve } from "path"

import { exists, readFile, writeFile } from "fs-extra"
import { sqip } from "sqip"

import generateSqip from "../generate-sqip.js"

jest.mock(`sqip`, () => {
  return {
    sqip: jest.fn(() => {
      return {
        content: Buffer.from(`<svg><!-- Mocked SQIP SVG --></svg>`),
        metadata: {
          dataURI: `data:image/svg+xml,dataURI`,
        },
      }
    }),
  }
})

jest.mock(`fs-extra`, () => {
  return {
    exists: jest.fn(() => false),
    readFile: jest.fn(() =>
      JSON.stringify({
        svg: `<svg><!-- Cached SVG --></svg>`,
        metadata: {
          dataURI: `data:image/svg+xml,dataURI`,
          anyOther: `metadata-value`,
        },
      })
    ),
    writeFile: jest.fn(),
  }
})

afterEach(() => {
  sqip.mockClear()
  exists.mockClear()
  readFile.mockClear()
  writeFile.mockClear()
})

describe(`gatsby-transformer-sqip`, () => {
  const absolutePath = resolve(
    __dirname,
    `images`,
    `this-file-does-not-need-to-exist-for-the-test.jpg`
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
      expect(sqipArgs.input).toMatch(absolutePath)
      delete sqipArgs.input
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
    it(`returns null for unsupported files`, async () => {
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
        absolutePath: absolutePath.replace(`.jpg`, `.svg`),
        numberOfPrimitives,
        blur,
        mode,
      })

      expect(result).toBe(null)

      expect(sqip).toHaveBeenCalledTimes(0)
      expect(exists).toHaveBeenCalledTimes(0)
      expect(writeFile).toHaveBeenCalledTimes(0)
      expect(readFile).toHaveBeenCalledTimes(0)
    })
  })
})
