const tests = [
  `basic-esm`,
  `existing-esm-import`,
  `basic-commonjs`,
  `pass-through`,
]

const defineTest = require(`jscodeshift/dist/testUtils`).defineTest

describe(`codemods`, () => {
  tests.forEach(test =>
    defineTest(__dirname, `navigate-calls`, null, `navigate-calls/${test}`)
  )
})
