import { joinPath } from "gatsby-core-utils"
import {
  withBasePath,
  getCommonDir,
  truncatePath,
  tooLongSegmentsInPath,
} from "../path"
import os from "os"

describe(`paths`, () => {
  describe(`joinPath`, () => {
    if (os.platform() !== `win32`) {
      it(`joins paths like path.join on Unix-type platforms.`, () => {
        const paths = [`/foo`, `bar`, `baz`]
        const expected = paths.join(`/`)
        const actual = joinPath(...paths)
        expect(actual).toBe(expected)
      })
    }

    if (os.platform() === `win32`) {
      it(`replaces '\\' with '\\\\' on Windows.`, () => {
        const paths = [`foo`, `bar`, `baz`]
        const expected = paths.join(`\\\\`)
        const actual = joinPath(...paths)
        expect(actual).toBe(expected)
      })
    }
  })

  describe(`withBasePath`, () => {
    it(`returns a function.`, () => {
      const withEmptyBasePath = withBasePath(``)
      const expected = `function`
      const actual = typeof withEmptyBasePath
      expect(actual).toBe(expected)
    })

    if (os.platform() !== `win32`) {
      it(`behaves like joinPath() on Unix-type platforms, but prepends a basePath`, () => {
        const basePath = `/foo`
        const subPath = `bar`
        const withFooPath = withBasePath(basePath)
        const expected = `${basePath}/${subPath}`
        const actual = withFooPath(subPath)
        expect(actual).toBe(expected)
      })
    }

    if (os.platform() === `win32`) {
      it(`behaves like joinPath() on Windows, but prepends a basePath`, () => {
        const basePath = `foo`
        const subPath = `bar`
        const withFooPath = withBasePath(basePath)
        const expected = `${basePath}\\\\${subPath}`
        const actual = withFooPath(subPath)
        expect(actual).toBe(expected)
      })
    }
  })

  describe(`getCommonDir`, () => {
    it.each<[string, { path1: string; path2: string; expected: string }]>([
      [
        `posix: path2 is sub-path of path1`,
        {
          path1: `/Users/misiek/dev/gatsby-project`,
          path2: `/Users/misiek/dev/gatsby-project/src/pages/index.js`,
          expected: `/Users/misiek/dev/gatsby-project`,
        },
      ],
      [
        `posix: path1 is sub-path of path2`,
        {
          path1: `/Users/misiek/dev/gatsby-project/src/pages/index.js`,
          path2: `/Users/misiek/dev/gatsby-project`,
          expected: `/Users/misiek/dev/gatsby-project`,
        },
      ],
      [
        `posix: paths are not sub-paths of one another`,
        {
          path1: `/Users/misiek/dev/gatsby-project/monorepo-packages/site`,
          path2: `/Users/misiek/dev/gatsby-project/node_modules/gatsby-theme-foo/src/pages/index.js`,
          expected: `/Users/misiek/dev/gatsby-project`,
        },
      ],
      [
        `win32: path2 is sub-path of path1`,
        {
          path1: `C:\\Users\\misiek\\dev\\gatsby-project`,
          path2: `C:\\Users\\misiek\\dev\\gatsby-project/src/pages/index.js`,
          expected: `C:/Users/misiek/dev/gatsby-project`,
        },
      ],
      [
        `win32: path1 is sub-path of path2`,
        {
          path1: `C:\\Users\\misiek\\dev\\gatsby-project/src/pages/index.js`,
          path2: `C:\\Users\\misiek\\dev\\gatsby-project`,
          expected: `C:/Users/misiek/dev/gatsby-project`,
        },
      ],
      [
        `win32: paths are not sub-paths of one another`,
        {
          path1: `C:\\Users\\misiek\\dev\\gatsby-project\\monorepo-packages\\site`,
          path2: `C:\\Users\\misiek\\dev\\gatsby-project\\node_modules\\gatsby-theme-foo\\src\\pages\\index.js`,
          expected: `C:/Users/misiek/dev/gatsby-project`,
        },
      ],
    ])(`%s`, (_label, { path1, path2, expected }) => {
      expect(getCommonDir(path1, path2)).toBe(expected)
    })
  })

  describe(`tooLongSegmentsInPath`, () => {
    it.each<[string, { input: string; expected: Array<string> }]>([
      [
        `doesn't touch short paths`,
        {
          input: `/short/path/`,
          expected: [],
        },
      ],
      [
        `finds long segments`,
        {
          input: `/lo${`o`.repeat(500)}ng/path/`,
          expected: [`lo${`o`.repeat(500)}ng`],
        },
      ],
    ])(`%s`, (_label, { input, expected }) => {
      expect(tooLongSegmentsInPath(input)).toEqual(expected)
    })
  })

  describe(`truncatePath`, () => {
    const SHORT_PATH = `/short/path/without/trailing/slash`
    const SHORT_PATH_TRAILING = `/short/path/with/trailing/slash/`
    const VERY_LONG_PATH = `/` + `x`.repeat(256) + `/`
    const VERY_LONG_PATH_NON_LATIN = `/` + `あ`.repeat(255) + `/`

    it(`Truncates long paths correctly`, () => {
      const truncatedPathLatin = truncatePath(VERY_LONG_PATH)
      const truncatedPathNonLatin = truncatePath(VERY_LONG_PATH_NON_LATIN)
      for (const segment of truncatedPathLatin) {
        expect(segment.length).toBeLessThanOrEqual(255)
      }
      for (const segment of truncatedPathNonLatin) {
        expect(segment.length).toBeLessThanOrEqual(255)
      }
    })

    it(`Preserves trailing slash`, () => {
      const truncatedPathLong = truncatePath(VERY_LONG_PATH)
      const truncatedPathShort = truncatePath(SHORT_PATH_TRAILING)
      expect(truncatedPathLong.substring(truncatedPathLong.length - 1)).toEqual(
        `/`
      )
      expect(
        truncatedPathShort.substring(truncatedPathShort.length - 1)
      ).toEqual(`/`)
    })

    it(`Does not truncate short paths`, () => {
      const truncatedPath = truncatePath(SHORT_PATH)
      expect(truncatedPath).toEqual(SHORT_PATH)
    })
  })
})
