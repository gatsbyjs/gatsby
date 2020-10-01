const COUNT_ID = `count`

describe(`hot-reloading hooks`, () => {
  const amount = 100

  beforeEach(() => {
    cy.visit(`/hooks`).waitForRouteChange()
  })

  afterEach(() => {
    cy.exec(
      `npm run update -- --file src/pages/hooks.js --replacements "count + ${amount}:count + 1" --exact`
    )
  })

  it(`can update component`, () => {
    const deferred = {}
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve
      deferred.reject = reject
    })

    cy.on("log:changed", e => {
      if (e.name === "xhr" && e.consoleProps.URL.includes("hot-update")) {
        deferred.resolve()
      }
    })

    cy.exec(
      `npm run update -- --file src/pages/hooks.js --replacements "count + 1:count + ${amount}" --exact`
    )

    cy.log(deferred.promise)
    cy.wrap(null).then(() => deferred.promise)

    cy.getTestElement(`increment`).click()

    cy.getTestElement(COUNT_ID).invoke(`text`).should(`eq`, `${amount}`)
  })
})
