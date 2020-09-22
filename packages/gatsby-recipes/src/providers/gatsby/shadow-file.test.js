const path = require(`path`)
const rimraf = require(`rimraf`)
jest.mock(`node-fetch`, () => require(`fetch-mock-jest`).sandbox())
const { mockReadmeLoader } = require(`../../test-helper`)
mockReadmeLoader()

const resourceTestHelper = require(`../resource-test-helper`)

const root = path.join(__dirname, `fixtures`)

const cleanup = () => {
  rimraf.sync(path.join(root, `src`))
}

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  cleanup()
})

describe(`Shadow File resource`, () => {
  test(`e2e shadow file resource test`, async () => {
    await resourceTestHelper({
      resourceModule: shadowFile,
      resourceName: `GatsbyShadowFile`,
      context: { root },
      initialObject: {
        theme: `gatsby-theme-blog`,
        path: `src/components/author.js`,
      },
      partialUpdate: {
        theme: `gatsby-theme-blog`,
        path: `src/components/author.js`,
      },
    })
  })
})

const shadowFile = require(`./shadow-file`)
const {
  relativePathForShadowedFile,
  createPathToThemeFile,
  splitId,
} = require(`./shadow-file.js`)

describe(`shadow-file create relative path for theme file`, () => {
  it(`should create the corect path for a non-scoped npm package`, () => {
    expect(
      relativePathForShadowedFile({
        theme: `foo-theme`,
        filePath: `src/foo.js`,
      })
    ).toEqual(`src/foo-theme/foo.js`)
  })
  it(`should create the corect path for a scoped npm package`, () => {
    expect(
      relativePathForShadowedFile({
        theme: `@bar/foo-theme`,
        filePath: `src/foo.js`,
      })
    ).toEqual(`src/@bar/foo-theme/foo.js`)
  })
})

// TODO restore e2e tests by running results through slash
describe(`shadow-file create full path to theme file`, () => {
  it(`should create the corect path for a non-scoped npm package`, () => {
    expect(
      createPathToThemeFile({
        root: `/sup/`,
        theme: `foo-theme`,
        filePath: `src/foo.js`,
      })
    ).toEqual(`/sup/node_modules/foo-theme/src/foo.js`)
  })
  it(`should create the corect path for a scoped npm package`, () => {
    expect(
      createPathToThemeFile({
        root: `/sup/`,
        theme: `@bar/foo-theme`,
        filePath: `src/foo.js`,
      })
    ).toEqual(`/sup/node_modules/@bar/foo-theme/src/foo.js`)
  })
})

describe(`shadow-file should split the id correctly`, () => {
  it(`should split the id correctly for a non-scoped npm package`, () => {
    expect(splitId(`src/foo/bar.js`)).toEqual({
      theme: `foo`,
      filePath: `bar.js`,
    })
    expect(splitId(`src/foo/bar/index.js`)).toEqual({
      theme: `foo`,
      filePath: `bar/index.js`,
    })
  })
  it(`should split the id correctly for a scoped npm package`, () => {
    expect(splitId(`src/@foo/theme-name/bar.js`)).toEqual({
      theme: `@foo/theme-name`,
      filePath: `bar.js`,
    })
    expect(splitId(`src/@foo/theme-name/bar/index.js`)).toEqual({
      theme: `@foo/theme-name`,
      filePath: `bar/index.js`,
    })
  })
})
