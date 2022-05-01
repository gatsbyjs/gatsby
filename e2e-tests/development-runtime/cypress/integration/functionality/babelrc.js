const TEST_ELEMENT = `test-element`

before(() => {
  cy.exec(`npm run reset`)
})

after(() => {
  cy.exec(`npm run reset`)
})

describe(`babelrc`, () => {
  it(`Applies .babelrc`, () => {
    cy.visit(`/babelrc/base/`).waitForRouteChange()

    cy.getTestElement(TEST_ELEMENT)
      .invoke(`text`)
      .should(`eq`, `babel-rc-is-used`)
  })

  describe(`hot reload`, () => {
    it(`editing .babelrc`, () => {
      cy.visit(`/babelrc/edit/`).waitForRouteChange()

      cy.getTestElement(TEST_ELEMENT)
        .invoke(`text`)
        .should(`eq`, `babel-rc-initial`)

      cy.exec(
        `npm run update -- --file src/pages/babelrc/edit/.babelrc --replacements "babel-rc-initial:babel-rc-edited" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(TEST_ELEMENT)
        .invoke(`text`)
        .should(`eq`, `babel-rc-edited`)
    })

    it(`adding .babelrc`, () => {
      cy.visit(`/babelrc/add/`).waitForRouteChange()

      cy.getTestElement(TEST_ELEMENT)
        .invoke(`text`)
        .should(`eq`, `babel-rc-test`)

      cy.exec(
        `npm run update -- --file src/pages/babelrc/add/.babelrc --file-source src/pages/babelrc/add/.babelrc-fixture`
      )

      // babel-loader doesn't actually hot reloads itself when new .babelrc file is added
      // this is because it registers dependency only if file already exists
      // ( https://github.com/babel/babel-loader/blob/1669ac07ee1eed28a8e6fcacbf1c07ceb06fe053/src/index.js#L214-L216 )
      // so to test hot-reloading here we actually have to invalidate js file, which would recompile it and discover
      // new babelrc file
      cy.exec(
        `npm run update -- --file src/pages/babelrc/add/index.js --replacements "foo-bar:foo-bar" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(TEST_ELEMENT)
        .invoke(`text`)
        .should(`eq`, `babel-rc-added`)
    })

    it(`removing .babelrc`, () => {
      cy.visit(`/babelrc/remove/`).waitForRouteChange()

      cy.getTestElement(TEST_ELEMENT)
        .invoke(`text`)
        .should(`eq`, `babel-rc-will-be-deleted`)

      cy.exec(
        `npm run update -- --file src/pages/babelrc/remove/.babelrc --delete`
      )

      // babel-loader doesn't actually hot reloads itself when .babelrc file is deleted
      // so to test hot-reloading here we actually have to invalidate js file, which would recompile it and discover
      // new babelrc file
      cy.exec(
        `npm run update -- --file src/pages/babelrc/remove/index.js --replacements "foo-bar:foo-bar" --exact`
      )

      cy.waitForHmr()

      cy.getTestElement(TEST_ELEMENT)
        .invoke(`text`)
        .should(`eq`, `babel-rc-test`)
    })
  })
})
