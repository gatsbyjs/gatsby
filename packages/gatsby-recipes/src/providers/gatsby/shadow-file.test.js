const {
  relativePathForShadowedFile,
  createPathToThemeFile,
  splitId,
} = require(`./shadow-file.js`)
const { slash } = require(`gatsby-core-utils`)

describe(`shadow-file create relative path for theme file`, () => {
  it(`should create the corect path for a non-scoped npm package`, () => {
    expect(
      slash(
        relativePathForShadowedFile({
          theme: `foo-theme`,
          filePath: `src/foo.js`,
        })
      )
    ).toEqual(`src/foo-theme/foo.js`)
  })
  it(`should create the corect path for a scoped npm package`, () => {
    expect(
      slash(
        relativePathForShadowedFile({
          theme: `@bar/foo-theme`,
          filePath: `src/foo.js`,
        })
      )
    ).toEqual(`src/@bar/foo-theme/foo.js`)
  })
})

// TODO restore e2e tests by running results through slash
describe(`shadow-file create full path to theme file`, () => {
  it(`should create the corect path for a non-scoped npm package`, () => {
    expect(
      slash(
        createPathToThemeFile({
          root: `/sup/`,
          theme: `foo-theme`,
          filePath: `src/foo.js`,
        })
      )
    ).toEqual(`/sup/node_modules/foo-theme/src/foo.js`)
  })
  it(`should create the corect path for a scoped npm package`, () => {
    expect(
      slash(
        createPathToThemeFile({
          root: `/sup/`,
          theme: `@bar/foo-theme`,
          filePath: `src/foo.js`,
        })
      )
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
