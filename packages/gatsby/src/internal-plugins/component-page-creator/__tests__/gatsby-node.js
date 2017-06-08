const validatePath = require(`../validate-path`)
const createPath = require(`../create-path`)

describe(`JavaScript page creator`, () => {
  it(`filters out files that start with underscores`, () => {
    const files = [
      {
        path: `something/blah.js`,
      },
      {
        path: `something/_blah.js`,
      },
      {
        path: `_blah.js`,
      },
    ]

    expect(files.filter(file => validatePath(file.path)).length).toEqual(1)
  })

  it(`filters out files that start with template-*`, () => {
    const files = [
      {
        path: `something/blah.js`,
      },
      {
        path: `something/template-cool-page-type.js`,
      },
      {
        path: `template-cool-page-type.js`,
      },
    ]

    expect(files.filter(file => validatePath(file.path)).length).toEqual(1)
  })

  it(`Creates paths`, () => {
    const basePath = `/a/`
    const paths = [`/a/b/c/de`, `/a/bee`, `/a/b/d/c/`]

    expect(paths.map(p => createPath(basePath, p))).toMatchSnapshot()
  })
})
