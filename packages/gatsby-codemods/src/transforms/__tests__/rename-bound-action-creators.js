const tests = [`create-page`, `no-destructure`]

const defineTest = require(`jscodeshift/dist/testUtils`).defineTest

describe(`codemods`, () => {
  tests.forEach(test =>
    defineTest(
      __dirname,
      `rename-bound-action-creators`,
      null,
      `rename-bound-action-creators/${test}`
    )
  )
})
