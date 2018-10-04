const tests = [
  `import-default`,
  `import-named-exports`,
  `import-namespace`,
  `no-import-esm`,
  `require-destructure`,
  `require-namespace`,
]

const defineTest = require(`jscodeshift/dist/testUtils`).defineTest

describe(`codemods`, () => {
  tests.forEach(test =>
    defineTest(
      __dirname,
      `global-graphql-calls`,
      null,
      `global-graphql-calls/${test}`
    )
  )
})
