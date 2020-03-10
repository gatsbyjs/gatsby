import { joinPath } from "gatsby-core-utils"
import { withBasePath, getCommonDir } from "../path"
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
})
