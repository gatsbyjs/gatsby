import path from "path"
import { isNearMatch, getConfigFile } from "../get-config-file"
import { testRequireError } from "../../utils/test-require-error"
import reporter from "gatsby-cli/lib/reporter"

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

const testRequireErrorMock = testRequireError as jest.MockedFunction<
  typeof testRequireError
>

const reporterPanicMock = reporter.panic as jest.MockedFunction<
  typeof reporter.panic
>

describe(`isNearMatch`, () => {
  it(`should NOT find a near match if file name is undefined or null`, () => {
    const nearMatchA = isNearMatch(undefined, `gatsby-config`, 1)
    const nearMatchB = isNearMatch(null, `gatsby-config`, 1)
    expect(nearMatchA).toBeFalse()
    expect(nearMatchB).toBeFalse()
  })

  it(`should NOT find a near match if config name is undefined or null`, () => {
    const nearMatchA = isNearMatch(`gatsby-config`, undefined, 1)
    const nearMatchB = isNearMatch(`gatsby-config`, null, 1)
    expect(nearMatchA).toBeFalse()
    expect(nearMatchB).toBeFalse()
  })

  it(`should calculate near matches based on distance`, () => {
    const nearMatchA = isNearMatch(`gatsby-config`, `gatsby-conf`, 2)
    const nearMatchB = isNearMatch(`gatsby-config`, `gatsby-configur`, 2)
    expect(nearMatchA).toBeTrue()
    expect(nearMatchB).toBeTrue()
  })
})

// Separate config directories so cases can be tested separately
const mockDir = path.resolve(__dirname, `../__mocks__/get-config-file`)
const compiledMockDir = `${mockDir}/compiled-dir`
const nearMatchDir = `${mockDir}/near-match-dir`
const srcDir = `${mockDir}/src-dir`

describe(`getConfigFile`, () => {
  beforeEach(() => {
    reporterPanicMock.mockClear()
  })

  it(`should get an uncompiled gatsby-config.js`, async () => {
    const { configModule, configFilePath } = await getConfigFile(
      mockDir,
      `gatsby-config`
    )
    expect(configFilePath).toBe(`${mockDir}/gatsby-config.js`)
    expect(configModule.siteMetadata.title).toBe(`uncompiled`)
  })

  it(`should get a compiled gatsby-config.js`, async () => {
    const { configModule, configFilePath } = await getConfigFile(
      compiledMockDir,
      `gatsby-config`
    )
    expect(configFilePath).toBe(`${compiledMockDir}/compiled/gatsby-config.js`)
    expect(configModule.siteMetadata.title).toBe(`compiled`)
  })

  /**
   * TODO - Ask Lennart about this since the case is handled in a recent PR
   * @see @link {https://github.com/gatsbyjs/gatsby/pull/35038}
   */
  it.skip(`should handle compiled file errors`, async () => {})

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

  it(`should handle near matches`, async () => {
    testRequireErrorMock.mockImplementationOnce(() => true)

    await getConfigFile(nearMatchDir, `gatsby-config`)

    expect(reporterPanicMock).toBeCalledWith({
      id: `10124`,
      error: expect.toBeObject(),
      context: {
        configName: `gatsby-config`,
        nearMatch: `gatsby-confi.js`,
      },
    })
  })

  it(`should handle gatsby config in src dir`, async () => {
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
