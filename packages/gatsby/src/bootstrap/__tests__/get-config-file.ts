import path from "path"
import { getConfigFile } from "../get-config-file"
import reporter from "gatsby-cli/lib/reporter"

jest.mock(`path`, () => {
  const actual = jest.requireActual(`path`)
  return {
    ...actual,
    join: jest.fn((...arg) => actual.join(...arg)),
  }
})

jest.mock(`../../utils/test-import-error`, () => {
  return {
    testImportError: jest.fn(),
  }
})

jest.mock(`../../utils/parcel/compile-gatsby-files`, () => {
  const actual = jest.requireActual(`../../utils/parcel/compile-gatsby-files`)
  return {
    ...actual,
    COMPILED_CACHE_DIR: `compiled`, // .cache is git ignored
  }
})

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    panic: jest.fn(),
  }
})

const pathJoinMock = path.join as jest.MockedFunction<typeof path.join>

const reporterPanicMock = reporter.panic as jest.MockedFunction<
  typeof reporter.panic
>

// Separate config directories so cases can be tested separately
const baseDir = path.resolve(__dirname, `..`, `__mocks__`, `get-config`)
const cjsDir = path.join(baseDir, `cjs`)
const esmDir = path.join(baseDir, `esm`)

const configDir = {
  cjs: {
    compiled: path.join(cjsDir, `compiled`),
    userRequireCompiled: path.join(cjsDir, `user-require-compiled`),
    userRequire: path.join(cjsDir, `user-require`),
    nearMatch: path.join(cjsDir, `near-match`),
    src: path.join(cjsDir, `src`),
  },
  esm: {
    userImport: path.join(esmDir, `user-import`),
    nearMatch: path.join(esmDir, `near-match`),
    src: path.join(esmDir, `src`),
  },
  ts: path.join(baseDir, `ts`),
  tsx: path.join(baseDir, `tsx`),
}

describe(`getConfigFile with cjs files`, () => {
  beforeEach(() => {
    reporterPanicMock.mockClear()
  })

  it(`should get an uncompiled gatsby-config.js`, async () => {
    const { configModule, configFilePath } = await getConfigFile(
      cjsDir,
      `gatsby-config`
    )
    expect(configFilePath).toBe(path.join(cjsDir, `gatsby-config.js`))
    expect(configModule.siteMetadata.title).toBe(`uncompiled`)
  })

  it(`should get a compiled gatsby-config.js`, async () => {
    const { configModule, configFilePath } = await getConfigFile(
      configDir.cjs.compiled,
      `gatsby-config`
    )
    expect(configFilePath).toBe(
      path.join(configDir.cjs.compiled, `compiled`, `gatsby-config.js`)
    )
    expect(configModule.siteMetadata.title).toBe(`compiled`)
  })

  it(`should handle user require errors found in compiled gatsby-config.js`, async () => {
    await getConfigFile(configDir.cjs.userRequireCompiled, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `11902`,
      error: expect.toBeObject(),
      context: {
        configName: `gatsby-config`,
        message: expect.toBeString(),
      },
    })
  })

  it(`should handle user require errors found in uncompiled gatsby-config.js`, async () => {
    await getConfigFile(configDir.cjs.userRequire, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10123`,
      error: expect.toBeObject(),
      context: {
        configName: `gatsby-config`,
        message: expect.toBeString(),
      },
    })
  })

  it(`should handle near matches`, async () => {
    await getConfigFile(configDir.cjs.nearMatch, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10124`,
      error: expect.toBeObject(),
      context: {
        configName: `gatsby-config`,
        isTSX: false,
        nearMatch: `gatsby-confi.js`,
      },
    })
  })

  it(`should handle gatsby config incorrectly located in src dir`, async () => {
    await getConfigFile(configDir.cjs.src, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10125`,
      context: {
        configName: `gatsby-config`,
      },
    })
  })
})

describe(`getConfigFile with esm files`, () => {
  beforeEach(() => {
    reporterPanicMock.mockClear()
  })

  it(`should get an uncompiled gatsby-config.mjs`, async () => {
    const { configModule, configFilePath } = await getConfigFile(
      esmDir,
      `gatsby-config`
    )
    expect(configFilePath).toBe(path.join(esmDir, `gatsby-config.mjs`))
    expect(configModule.siteMetadata.title).toBe(`uncompiled`)
  })

  it(`should handle user require errors found in uncompiled gatsby-config.mjs`, async () => {
    await getConfigFile(configDir.esm.userImport, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10123`,
      error: expect.toBeObject(),
      context: {
        configName: `gatsby-config`,
        message: expect.toBeString(),
      },
    })
  })

  it(`should handle near matches`, async () => {
    await getConfigFile(configDir.esm.nearMatch, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10124`,
      error: expect.toBeObject(),
      context: {
        configName: `gatsby-config`,
        isTSX: false,
        nearMatch: `gatsby-confi.mjs`,
      },
    })
  })

  it(`should handle gatsby config incorrectly located in src dir`, async () => {
    await getConfigFile(configDir.esm.src, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10125`,
      context: {
        configName: `gatsby-config`,
      },
    })
  })
})

describe(`getConfigFile with ts/tsx files`, () => {
  it(`should handle case where gatsby-config.ts exists but no compiled gatsby-config.js exists`, async () => {
    // Force outer and inner errors so we can hit the code path that checks if gatsby-config.ts exists
    pathJoinMock
      .mockImplementationOnce(() => `force-outer-error`)
      .mockImplementationOnce(() => `force-inner-error`)

    await getConfigFile(configDir.ts, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10127`,
      error: expect.toBeObject(),
      context: {
        configName: `gatsby-config`,
      },
    })
  })

  it(`should handle .tsx extension`, async () => {
    await getConfigFile(configDir.tsx, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10124`,
      error: expect.toBeObject(),
      context: {
        configName: `gatsby-config`,
        isTSX: true,
        nearMatch: `gatsby-confi.tsx`,
      },
    })
  })
})
