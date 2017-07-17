const { joinPath, withBasePath } = require(`../path`)
const os = require(`os`)

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
})
