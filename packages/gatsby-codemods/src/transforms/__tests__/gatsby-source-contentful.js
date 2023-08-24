const tests = [
  `content-types`,
  `contentful-asset`,
  `contentful-sys`,
  `graphql-content-type-all`,
  `graphql-content-type-fragment`,
  `graphql-content-type-single`,
  `graphql-contentful-assets`,
  `graphql-contentful-sys`,
]

const defineTest = require(`jscodeshift/dist/testUtils`).defineTest

describe(`codemods`, () => {
  tests.forEach(test =>
    defineTest(
      __dirname,
      `gatsby-source-contentful`,
      null,
      `gatsby-source-contentful/${test}`
    )
  )
})
