const tests = [
  `import-default`,
  `import-named-exports`,
  `import-namespace`,
  `require-destructure`,
  `require-namespace`,
  `import-named-multiple`,
]

const defineTest = require(`jscodeshift/dist/testUtils`).defineTest

describe(`codemods`, () => {
  tests.forEach(test =>
    defineTest(__dirname, `import-link`, null, `import-link/${test}`)
  )
})
