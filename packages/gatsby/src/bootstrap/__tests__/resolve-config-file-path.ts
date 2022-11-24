import path from "path"
import reporter from "gatsby-cli/lib/reporter"
import { resolveConfigFilePath } from "../resolve-config-file-path"

const mockDir = path.resolve(
  __dirname,
  `..`,
  `__mocks__`,
  `resolve-config-file-path`
)

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    warn: jest.fn(),
  }
})

const reporterWarnMock = reporter.warn as jest.MockedFunction<
  typeof reporter.warn
>

beforeEach(() => {
  reporterWarnMock.mockClear()
})

it(`resolves gatsby-config.js if it exists`, () => {
  const configFilePath = path.join(mockDir, `cjs`, `gatsby-config`)
  const resolvedConfigFilePath = resolveConfigFilePath(mockDir, configFilePath)
  expect(resolvedConfigFilePath).toBe(`${configFilePath}.js`)
})

it(`resolves gatsby-config.mjs if it exists`, () => {
  const configFilePath = path.join(mockDir, `esm`, `gatsby-config`)
  const resolvedConfigFilePath = resolveConfigFilePath(mockDir, configFilePath)
  expect(resolvedConfigFilePath).toBe(`${configFilePath}.mjs`)
})

it(`warns if both variants exist and defaults to the gatsby-config.js variant`, () => {
  const configFilePath = path.join(mockDir, `both`, `gatsby-config`)
  const relativeFilePath = path.relative(mockDir, configFilePath)
  const resolvedConfigFilePath = resolveConfigFilePath(mockDir, configFilePath)
  expect(reporterWarnMock).toBeCalledWith(
    `The file '${relativeFilePath}' has both .js and .mjs variants, please use one or the other. Using .js by default.`
  )
  expect(resolvedConfigFilePath).toBe(`${configFilePath}.js`)
})

it(`returns an empty string if no file exists`, () => {
  const configFilePath = path.join(mockDir)
  const resolvedConfigFilePath = resolveConfigFilePath(mockDir, configFilePath)
  expect(resolvedConfigFilePath).toBe(``)
})
