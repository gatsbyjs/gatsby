describe(`gatsby-plugin-styled-jsx`, () => {
  const { modifyBabelrc } = require(`../gatsby-node`)

  const babelrc = {
    presets: [`great`, `scott`],
    plugins: [`fitzgerald`],
  }

  it(`adds styled-jsx/babel to babelrc`, () => {
    const modified = modifyBabelrc({ babelrc })

    expect(modified).toMatchObject({
      presets: [`great`, `scott`],
      plugins: [`fitzgerald`, `styled-jsx/babel`],
    })
  })
})
