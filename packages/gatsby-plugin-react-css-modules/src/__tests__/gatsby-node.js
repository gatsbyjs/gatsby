describe(`gatsby-plugin-react-css-modules`, () => {
  const { modifyBabelrc } = require(`../gatsby-node`)

  const babelrc = {
    presets: [`great`, `scott`],
    plugins: [`fitzgerald`],
  }

  it(`adds react-css-modules to babelrc`, () => {
    const modified = modifyBabelrc({ babelrc }, {})

    expect(modified).toMatchObject({
      presets: [`great`, `scott`],
      plugins: [`fitzgerald`, [`react-css-modules`, expect.any(Object)]],
    })
  })

  it(`includes custom options when modifying babelrc`, () => {
    const options = {
      exclude: `\/global\/`,
      filetypes: {
        ".scss": { syntax: `postcss-scss` },
      },
      generateScopedName: `[name]---[local]---[hash:base64]`,
    }

    const modified = modifyBabelrc({ babelrc }, options)

    expect(modified).toMatchObject({
      presets: [`great`, `scott`],
      plugins: [
        `fitzgerald`,
        [`react-css-modules`, expect.objectContaining(options)],
      ],
    })
  })
})
