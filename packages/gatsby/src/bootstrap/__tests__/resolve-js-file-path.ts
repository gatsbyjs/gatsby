import path from "path"
import reporter from "gatsby-cli/lib/reporter"
import { resolveJSFilepath } from "../resolve-js-file-path"

const mockDir = path.resolve(
  __dirname,
  `..`,
  `__mocks__`,
  `resolve-js-file-path`
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

it(`resolves gatsby-config.js if it exists`, async () => {
  const configFilePath = path.join(mockDir, `cjs`, `gatsby-config`)
  const resolvedConfigFilePath = await resolveJSFilepath({
    rootDir: mockDir,
    filePath: configFilePath,
  })
  expect(resolvedConfigFilePath).toBe(`${configFilePath}.js`)
})

it(`resolves gatsby-config.js the same way if a file path with extension is provided`, async () => {
  const configFilePath = path.join(mockDir, `cjs`, `gatsby-config.js`)
  const resolvedConfigFilePath = await resolveJSFilepath({
    rootDir: mockDir,
    filePath: configFilePath,
  })
  expect(resolvedConfigFilePath).toBe(configFilePath)
})

it(`resolves gatsby-config.mjs if it exists`, async () => {
  const configFilePath = path.join(mockDir, `esm`, `gatsby-config`)
  const resolvedConfigFilePath = await resolveJSFilepath({
    rootDir: mockDir,
    filePath: configFilePath,
  })
  expect(resolvedConfigFilePath).toBe(`${configFilePath}.mjs`)
})

it(`resolves gatsby-config.mjs the same way if a file path with extension is provided`, async () => {
  const configFilePath = path.join(mockDir, `esm`, `gatsby-config.mjs`)
  const resolvedConfigFilePath = await resolveJSFilepath({
    rootDir: mockDir,
    filePath: configFilePath,
  })
  expect(resolvedConfigFilePath).toBe(configFilePath)
})

it(`warns by default if both variants exist and defaults to the gatsby-config.js variant`, async () => {
  const configFilePath = path.join(mockDir, `both`, `gatsby-config`)
  const relativeFilePath = path.relative(mockDir, configFilePath)
  const resolvedConfigFilePath = await resolveJSFilepath({
    rootDir: mockDir,
    filePath: configFilePath,
  })
  expect(reporterWarnMock).toBeCalledWith(
    `The file '${relativeFilePath}' has both .js and .mjs variants, please use one or the other. Using .js by default.`
  )
  expect(resolvedConfigFilePath).toBe(`${configFilePath}.js`)
})

it(`does NOT warn if both variants exist and warnings are disabled`, async () => {
  const configFilePath = path.join(mockDir, `both`, `gatsby-config`)
  const resolvedConfigFilePath = await resolveJSFilepath({
    rootDir: mockDir,
    filePath: configFilePath,
    warn: false,
  })
  expect(reporterWarnMock).not.toBeCalled()
  expect(resolvedConfigFilePath).toBe(`${configFilePath}.js`)
})

it(`returns an empty string if no file exists`, async () => {
  const configFilePath = path.join(mockDir)
  const resolvedConfigFilePath = await resolveJSFilepath({
    rootDir: mockDir,
    filePath: configFilePath,
  })
  expect(resolvedConfigFilePath).toBe(``)
})
