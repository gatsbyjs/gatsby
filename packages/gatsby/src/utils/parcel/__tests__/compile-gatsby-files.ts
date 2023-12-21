import { Parcel } from "@parcel/core"
import {
  constructParcel,
  compileGatsbyFiles,
  gatsbyFileRegex,
  COMPILED_CACHE_DIR,
  PARCEL_CACHE_DIR,
} from "../compile-gatsby-files"
import { siteMetadata } from "./fixtures/utils/site-metadata"
import { moreDataConfig } from "./fixtures/utils/more-data-config"
import { readFile, remove, pathExists } from "fs-extra"
import reporter from "gatsby-cli/lib/reporter"

const dir = {
  js: `${__dirname}/fixtures/js`,
  ts: `${__dirname}/fixtures/ts`,
  tsOnlyInLocal: `${__dirname}/fixtures/ts-only-in-local-plugin`,
  misnamedJS: `${__dirname}/fixtures/misnamed-js`,
  misnamedTS: `${__dirname}/fixtures/misnamed-ts`,
  gatsbyNodeAsDirectory: `${__dirname}/fixtures/gatsby-node-as-directory`,
  errorInCode: `${__dirname}/fixtures/error-in-code-ts`,
}

jest.setTimeout(60_000)

jest.mock(`@parcel/core`, () => {
  const parcelCore = jest.requireActual(`@parcel/core`)

  const { Parcel: OriginalParcel } = parcelCore

  class MockedParcel extends OriginalParcel {
    constructor(options) {
      super(options)
      this.options = options // Expose for assertions
    }
  }

  return {
    ...parcelCore,
    Parcel: MockedParcel,
  }
})

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    panic: jest.fn(),
  }
})

const reporterPanicMock = reporter.panic as jest.MockedFunction<
  typeof reporter.panic
>

interface IMockedParcel extends Parcel {
  options: unknown
}

let cwdToRestore
beforeAll(() => {
  cwdToRestore = process.cwd()
})

afterAll(() => {
  process.chdir(cwdToRestore)
})

describe(`gatsby file compilation`, () => {
  describe(`constructBundler`, () => {
    it(`should construct Parcel relative to passed directory`, () => {
      const { options } = constructParcel(dir.js) as IMockedParcel

      expect(options).toMatchObject({
        entries: [
          `${dir.js}/${gatsbyFileRegex}`,
          `${dir.js}/plugins/**/${gatsbyFileRegex}`,
        ],
        targets: {
          root: {
            distDir: `${dir.js}/${COMPILED_CACHE_DIR}`,
            engines: {
              node: _CFLAGS_.GATSBY_MAJOR !== `5` ? `>= 14.15.0` : `>= 18.0.0`,
            },
          },
        },
        cacheDir: `${dir.js}/${PARCEL_CACHE_DIR}`,
      })
    })
  })

  describe(`compileGatsbyFiles`, () => {
    describe(`js files are not touched`, () => {
      beforeAll(async () => {
        process.chdir(dir.js)
        await remove(`${dir.js}/.cache`)
        await compileGatsbyFiles(dir.js)
      })

      beforeEach(() => {
        reporterPanicMock.mockClear()
      })

      it(`should not compile gatsby-config.js`, async () => {
        const isCompiled = await pathExists(
          `${dir.js}/.cache/compiled/gatsby-config.js`
        )
        expect(isCompiled).toEqual(false)
        expect(reporterPanicMock).not.toHaveBeenCalled()
      })

      it(`should not compile gatsby-node.js`, async () => {
        const isCompiled = await pathExists(
          `${dir.js}/.cache/compiled/gatsby-node.js`
        )
        expect(isCompiled).toEqual(false)
        expect(reporterPanicMock).not.toHaveBeenCalled()
      })
    })

    describe(`ts files are compiled`, () => {
      beforeAll(async () => {
        process.chdir(dir.ts)
        await remove(`${dir.ts}/.cache`)
        await compileGatsbyFiles(dir.ts)
      })

      beforeEach(() => {
        reporterPanicMock.mockClear()
      })

      it(`should compile gatsby-config.ts`, async () => {
        const compiledGatsbyConfig = await readFile(
          `${dir.ts}/.cache/compiled/gatsby-config.js`,
          `utf-8`
        )

        expect(compiledGatsbyConfig).toContain(siteMetadata.title)
        expect(compiledGatsbyConfig).toContain(siteMetadata.siteUrl)
        expect(compiledGatsbyConfig).toContain(moreDataConfig.options.name)
        expect(reporterPanicMock).not.toHaveBeenCalled()
      })

      it(`should compile gatsby-node.ts`, async () => {
        const compiledGatsbyNode = await readFile(
          `${dir.ts}/.cache/compiled/gatsby-node.js`,
          `utf-8`
        )

        expect(compiledGatsbyNode).toContain(`I am working!`)
        expect(reporterPanicMock).not.toHaveBeenCalled()
      })
    })

    describe(`ts only in local plugin files are compiled and outputted where expected`, () => {
      beforeAll(async () => {
        process.chdir(dir.tsOnlyInLocal)
        await remove(`${dir.tsOnlyInLocal}/.cache`)
        await compileGatsbyFiles(dir.tsOnlyInLocal)
      })

      it(`should compile gatsby-config.ts`, async () => {
        const compiledGatsbyConfig = await readFile(
          `${dir.tsOnlyInLocal}/.cache/compiled/plugins/gatsby-plugin-local/gatsby-config.js`,
          `utf-8`
        )

        expect(compiledGatsbyConfig).toContain(`gatsby-config is working`)
      })

      it(`should compile gatsby-node.ts`, async () => {
        const compiledGatsbyNode = await readFile(
          `${dir.tsOnlyInLocal}/.cache/compiled/plugins/gatsby-plugin-local/gatsby-node.js`,
          `utf-8`
        )

        expect(compiledGatsbyNode).toContain(`gatsby-node is working`)
      })
    })
  })

  it(`handles errors in TS code`, async () => {
    process.chdir(dir.errorInCode)
    await remove(`${dir.errorInCode}/.cache`)
    await compileGatsbyFiles(dir.errorInCode)

    expect(reporterPanicMock).toMatchInlineSnapshot(`
      [MockFunction] {
        "calls": Array [
          Array [
            Object {
              "context": Object {
                "filePath": "<PROJECT_ROOT>/gatsby-node.ts",
                "generalMessage": "Expected ';', '}' or <eof>",
                "hints": null,
                "origin": "@parcel/transformer-js",
                "specificMessage": "This is the expression part of an expression statement",
              },
              "id": "11901",
            },
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": undefined,
          },
        ],
      }
    `)
  })
})

describe(`gatsby-node directory is allowed`, () => {
  beforeAll(async () => {
    process.chdir(dir.gatsbyNodeAsDirectory)
    await remove(`${dir.gatsbyNodeAsDirectory}/.cache`)
  })
  beforeEach(() => {
    reporterPanicMock.mockClear()
  })
  it(`should not panic on gatsby-node dir`, async () => {
    await compileGatsbyFiles(dir.gatsbyNodeAsDirectory)
    expect(reporterPanicMock).not.toHaveBeenCalled()
  })

  it(`should compile gatsby-node file and its dir files`, async () => {
    const compiledGatsbyNode = await readFile(
      `${dir.gatsbyNodeAsDirectory}/.cache/compiled/gatsby-node.js`,
      `utf-8`
    )

    expect(compiledGatsbyNode).toContain(`I am working!`)
    expect(reporterPanicMock).not.toHaveBeenCalled()
  })
})

describe(`misnamed gatsby-node files`, () => {
  beforeEach(() => {
    reporterPanicMock.mockClear()
  })
  it(`should panic on gatsby-node.jsx`, async () => {
    process.chdir(dir.misnamedJS)
    await remove(`${dir.misnamedJS}/.cache`)
    await compileGatsbyFiles(dir.misnamedJS)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10128`,
      context: {
        configName: `gatsby-node`,
        isTSX: false,
        nearMatch: `gatsby-node.jsx`,
      },
    })
  })
  it(`should panic on gatsby-node.tsx`, async () => {
    process.chdir(dir.misnamedTS)
    await remove(`${dir.misnamedTS}/.cache`)
    await compileGatsbyFiles(dir.misnamedTS)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10128`,
      context: {
        configName: `gatsby-node`,
        isTSX: true,
        nearMatch: `gatsby-node.tsx`,
      },
    })
  })
})
