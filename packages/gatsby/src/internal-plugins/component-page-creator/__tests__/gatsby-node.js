const { validatePath } = require(`../gatsby-node`)

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
})
