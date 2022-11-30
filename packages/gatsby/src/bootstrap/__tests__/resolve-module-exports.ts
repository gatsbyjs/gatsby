import path from "path"
import reporter from "gatsby-cli/lib/reporter"
import { resolveModuleExports } from "../resolve-module-exports"

const mockDir = path.resolve(
  __dirname,
  `..`,
  `__mocks__`,
  `resolve-module-exports`
)
const cjsMockDir = path.join(mockDir, `cjs`)
const esmMockDir = path.join(mockDir, `esm`)

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    panic: jest.fn(),
  }
})

const reporterPanicMock = reporter.panic as jest.MockedFunction<
  typeof reporter.panic
>

beforeEach(() => {
  reporterPanicMock.mockClear()
})

describe(`Resolve module exports`, () => {
  it(`returns empty array for file paths that don't exist`, async () => {
    const moduleFilePath = path.join(`file`, `path`, `does`, `not`, `exist`)
    const result = await resolveModuleExports(mockDir, moduleFilePath)
    expect(result).toEqual([])
  })

  it(`returns empty array for directory paths that don't exist`, async () => {
    const moduleFilePath = path.join(
      `directory`,
      `path`,
      `does`,
      `not`,
      `exist`
    )
    const result = await resolveModuleExports(mockDir, moduleFilePath)
    expect(result).toEqual([])
  })

  describe(`cjs`, () => {
    it(`shows a meaningful error message for files with errors in them`, async () => {
      const moduleFilePath = path.join(cjsMockDir, `error-in-file`)
      await resolveModuleExports(cjsMockDir, moduleFilePath)
      expect(
        // @ts-ignore Don't bother mocking jest mock object
        reporter.panic.mock.calls.map(c =>
          // Remove console colors + trim whitespace
          // eslint-disable-next-line
          c[0].replace(/\x1B[[(?);]{0,2}(;?\d)*./g, ``).trim()
        )
      ).toMatchInlineSnapshot(`
        Array [
          "We encountered an error while trying to resolve exports from \\"<PROJECT_ROOT>/packages/gatsby/src/bootstrap/__mocks__/resolve-module-exports/cjs/error-in-file\\". Please fix the error and try again.",
        ]
      `)
    })

    it(`resolves an export`, async () => {
      const moduleFilePath = path.join(cjsMockDir, `simple-export`)
      const result = await resolveModuleExports(cjsMockDir, moduleFilePath)
      expect(result).toEqual([`foo`])
    })

    it(`resolves multiple exports`, async () => {
      const moduleFilePath = path.join(cjsMockDir, `multiple-exports`)
      const result = await resolveModuleExports(cjsMockDir, moduleFilePath)
      expect(result).toEqual([`bar`, `baz`, `foo`])
    })

    it(`resolves module.exports`, async () => {
      const moduleFilePath = path.join(cjsMockDir, `module-exports`)
      const result = await resolveModuleExports(cjsMockDir, moduleFilePath)
      expect(result).toEqual([`barExports`])
    })

    it(`ignores exports.__esModule`, async () => {
      const moduleFilePath = path.join(cjsMockDir, `esmodule-export`)
      const result = await resolveModuleExports(cjsMockDir, moduleFilePath)
      expect(result).toEqual([`foo`])
    })
  })

  describe(`esm`, () => {
    it(`resolves an exported const`, async () => {
      const moduleFilePath = path.join(esmMockDir, `export-const`)
      const result = await resolveModuleExports(esmMockDir, moduleFilePath)
      expect(result).toEqual([`fooConst`])
    })

    it(`resolves a named export`, async () => {
      const moduleFilePath = path.join(esmMockDir, `named`)
      const result = await resolveModuleExports(esmMockDir, moduleFilePath)
      expect(result).toEqual([`foo`])
    })

    it(`resolves a named export from`, async () => {
      const moduleFilePath = path.join(esmMockDir, `named-from`)
      const result = await resolveModuleExports(esmMockDir, moduleFilePath)
      expect(result).toEqual([`Component`])
    })

    it(`resolves a named export as`, async () => {
      const moduleFilePath = path.join(esmMockDir, `named-as`)
      const result = await resolveModuleExports(esmMockDir, moduleFilePath)
      expect(result).toEqual([`bar`])
    })

    it(`resolves multiple named exports`, async () => {
      const moduleFilePath = path.join(esmMockDir, `named-multiple`)
      const result = await resolveModuleExports(esmMockDir, moduleFilePath)
      expect(result).toContain(`foo`)
      expect(result).toContain(`bar`)
      expect(result).toContain(`baz`)
    })

    it(`resolves default export`, async () => {
      const moduleFilePath = path.join(esmMockDir, `export-default`)
      const result = await resolveModuleExports(esmMockDir, moduleFilePath)
      expect(result).toEqual([`export default`])
    })

    it(`resolves default export with name`, async () => {
      const moduleFilePath = path.join(esmMockDir, `export-default-name`)
      const result = await resolveModuleExports(esmMockDir, moduleFilePath)
      expect(result).toEqual([`export default foo`])
    })

    it(`resolves default function`, async () => {
      const moduleFilePath = path.join(esmMockDir, `export-default-function`)
      const result = await resolveModuleExports(esmMockDir, moduleFilePath)
      expect(result).toEqual([`export default`])
    })

    it(`resolves default function with name`, async () => {
      const moduleFilePath = path.join(
        esmMockDir,
        `export-default-function-name`
      )
      const result = await resolveModuleExports(esmMockDir, moduleFilePath)
      expect(result).toEqual([`export default foo`])
    })

    it(`resolves function declaration`, async () => {
      const moduleFilePath = path.join(esmMockDir, `export-function-name`)
      const result = await resolveModuleExports(esmMockDir, moduleFilePath)
      expect(result).toEqual([`foo`])
    })
  })

  // TODO: Categorize, adjust paths
  describe.skip(`rest`, () => {
    it(`Resolves exports when using require mode - simple case`, async () => {
      jest.mock(`require/exports`)

      const result = await resolveModuleExports(mockDir, `require/exports`)
      expect(result).toEqual([`foo`, `bar`])
    })

    it(`Resolves exports when using require mode - unusual case`, async () => {
      jest.mock(`require/unusual-exports`)

      const result = await resolveModuleExports(
        mockDir,
        `require/unusual-exports`
      )
      expect(result).toEqual([`foo`])
    })

    it(`Resolves exports when using require mode - returns empty array when module doesn't exist`, async () => {
      const result = await resolveModuleExports(
        mockDir,
        `require/not-existing-module`
      )
      expect(result).toEqual([])
    })

    it(`Resolves exports when using require mode - panic on errors`, async () => {
      jest.mock(`require/module-error`)

      await resolveModuleExports(mockDir, `require/module-error`)

      expect(reporter.panic).toBeCalled()
    })
  })
})
