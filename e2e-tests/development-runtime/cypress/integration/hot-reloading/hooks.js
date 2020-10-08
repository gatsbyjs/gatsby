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
      // wait until gatsby tells us hot update is complete
      if (e.name === "xhr" && e.consoleProps.URL.includes("hot-update")) {
        deferred.resolve()
      }
    })

    cy.exec(
      `npm run update -- --file src/pages/hooks.js --replacements "count + 1:count + ${amount}" --exact`
    )

    // wait for hot update to complete
    cy.wrap(null).then(() => deferred.promise)

    // wait 1s to make sure changes are done
    cy.wait(1000)

    cy.getTestElement(`increment`).click()

    cy.getTestElement(COUNT_ID).should(`have.text`, `${amount}`)
  })
})
