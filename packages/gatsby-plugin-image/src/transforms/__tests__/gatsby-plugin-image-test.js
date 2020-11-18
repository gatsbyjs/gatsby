const tests = [
  `baseline`,
  `call-expression`,
  `compat`,
  `multiple`,
  `placeholders`,
]

const defineTest = require(`jscodeshift/dist/testUtils`).defineTest

describe(`codemods`, () => {
  tests.forEach(test =>
    defineTest(
      __dirname,
      `gatsby-plugin-image`,
      null,
      `gatsby-plugin-image/${test}`
    )
  )
  defineTest(
    __dirname,
    `gatsby-plugin-image`,
    null,
    `gatsby-plugin-image/typescript`,
    { parser: `tsx` }
  )
})
