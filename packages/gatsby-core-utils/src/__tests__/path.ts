import { joinPath, isNodeInternalModulePath, slash } from "../path"
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
  describe(`isNodePath`, () => {
    it(`Matches common node files`, () => {
      expect(isNodeInternalModulePath(`console.js`)).toBe(true)
      expect(isNodeInternalModulePath(`http.js`)).toBe(true)
      expect(isNodeInternalModulePath(`internal/foo`)).toBe(true)
      const modulePath = `/Users/username/dev/project/node_modules/package-name/index.js`
      expect(isNodeInternalModulePath(modulePath)).toBe(false)
    })
  })

  describe(`slash path`, () => {
    it(`can correctly slash path`, () => {
      ;[
        [`foo\\bar`, `foo/bar`],
        [`foo/bar`, `foo/bar`],
        [`foo\\中文`, `foo/中文`],
        [`foo/中文`, `foo/中文`],
        [`foo/жä`, `foo/жä`],
        [`foo\\жä`, `foo/жä`],
      ].forEach(([path, expectRes]) => {
        expect(slash(path)).toBe(expectRes)
      })
    })

    it(`does not modify extended length paths`, () => {
      const extended = `\\\\?\\some\\path`
      expect(slash(extended)).toBe(extended)
    })
  })
})
