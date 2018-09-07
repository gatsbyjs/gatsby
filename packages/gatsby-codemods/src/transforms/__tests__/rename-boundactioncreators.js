const tests = [
  `create-page`,
]

const defineTest = require(`jscodeshift/dist/testUtils`).defineTest

describe(`codemods`, () => {
  tests.forEach(test =>
    defineTest(__dirname, `rename-boundactioncreators`, null, `rename-boundactioncreators/${test}`)
  )
})
