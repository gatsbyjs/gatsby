import path from "path"
import { getConfigFile } from "../get-config-file"
import { testRequireError } from "../../utils/test-require-error"
import reporter from "gatsby-cli/lib/reporter"

jest.mock(`path`, () => {
  const actual = jest.requireActual(`path`)
  return {
    ...actual,
    join: jest.fn((...arg) => actual.join(...arg)),
  }
})

jest.mock(`../../utils/test-require-error`, () => {
  return {
    testRequireError: jest.fn(),
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

const testRequireErrorMock = testRequireError as jest.MockedFunction<
  typeof testRequireError
>

const reporterPanicMock = reporter.panic as jest.MockedFunction<
  typeof reporter.panic
>

// Separate config directories so cases can be tested separately
const dir = path.resolve(__dirname, `../__mocks__/get-config`)
const compiledDir = `${dir}/compiled-dir`
const userRequireDir = `${dir}/user-require-dir`
const tsDir = `${dir}/ts-dir`
const tsxDir = `${dir}/tsx-dir`
const nearMatchDir = `${dir}/near-match-dir`
const srcDir = `${dir}/src-dir`

describe(`getConfigFile`, () => {
  beforeEach(() => {
    reporterPanicMock.mockClear()
  })

  it(`should get an uncompiled gatsby-config.js`, async () => {
    const { configModule, configFilePath } = await getConfigFile(
      dir,
      `gatsby-config`
    )
    expect(configFilePath).toBe(path.join(dir, `gatsby-config.js`))
    expect(configModule.siteMetadata.title).toBe(`uncompiled`)
  })

  it(`should get a compiled gatsby-config.js`, async () => {
    const { configModule, configFilePath } = await getConfigFile(
      compiledDir,
      `gatsby-config`
    )
    expect(configFilePath).toBe(
      path.join(compiledDir, `compiled`, `gatsby-config.js`)
    )
    expect(configModule.siteMetadata.title).toBe(`compiled`)
  })

  it(`should handle user require errors found in compiled gatsby-config.js`, async () => {
    await getConfigFile(userRequireDir, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `11902`,
      error: expect.toBeObject(),
      context: {
        configName: `gatsby-config`,
        message: expect.toBeString(),
      },
    })
  })

  it(`should handle non-require errors`, async () => {
    testRequireErrorMock.mockImplementationOnce(() => false)

    await getConfigFile(nearMatchDir, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10123`,
      error: expect.toBeObject(),
      context: {
        configName: `gatsby-config`,
        message: expect.toBeString(),
      },
    })
  })

  it(`should handle case where gatsby-config.ts exists but no compiled gatsby-config.js exists`, async () => {
    // Force outer and inner errors so we can hit the code path that checks if gatsby-config.ts exists
    pathJoinMock
      .mockImplementationOnce(() => `force-outer-error`)
      .mockImplementationOnce(() => `force-inner-error`)
    testRequireErrorMock.mockImplementationOnce(() => true)

    await getConfigFile(tsDir, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10127`,
      error: expect.toBeObject(),
      context: {
        configName: `gatsby-config`,
      },
    })
  })

  it(`should handle near matches`, async () => {
    testRequireErrorMock.mockImplementationOnce(() => true)

    await getConfigFile(nearMatchDir, `gatsby-config`)

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

  it(`should handle .tsx extension`, async () => {
    testRequireErrorMock.mockImplementationOnce(() => true)

    await getConfigFile(tsxDir, `gatsby-config`)

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

  it(`should handle gatsby config incorrectly located in src dir`, async () => {
    testRequireErrorMock.mockImplementationOnce(() => true)

    await getConfigFile(srcDir, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10125`,
      context: {
        configName: `gatsby-config`,
      },
    })
  })
})
