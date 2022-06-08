const tests = [`gatsby-config`, `mdx-renderer-plain`, `mdx-renderer-with-scope`]

const defineTest = require(`jscodeshift/dist/testUtils`).defineTest

describe(`codemods`, () => {
  tests.forEach(test => defineTest(__dirname, `mdx-v2`, null, `mdx-v2/${test}`))
})
