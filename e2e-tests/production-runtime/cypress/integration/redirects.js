let spy
Cypress.on(`window:before:load`, win => {
  spy = cy.spy(win.console, `error`).as(`spyWinConsoleError`)
})

Cypress.on("uncaught:exception", (err, runnable) => {
  if (err.message.includes("Minified React error")) {
    return false
  }
})

describe(`Redirects`, () => {
  // TODO: un-skip this tests when this is figured out
  // this DOES happen locally, but it's quite difficult to understand
  // we are getting hydration failures right now
  it.skip(`are case insensitive when ignoreCase is set to true`, () => {
    cy.visit(`/Longue-PAGE/`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.get(`h1`).invoke(`text`).should(`contain`, `Hi from the long page`)
  })

  it(`are case sensitive when ignoreCase is set to false`, () => {
    cy.visit(`/PAGINA-larga/`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.get(`h1`).invoke(`text`).should(`contain`, `NOT FOUND`)
  })

  it(
    `use redirects when preloading page-data`,
    {
      retries: {
        runMode: 3,
      },
    },
    () => {
      const expectedLinks = [`/Longue-PAGE/`, `/pagina-larga/`]

      // we should not hit those routes
      cy.intercept("GET", "/page-data/Longue-PAGE/page-data.json").as(
        "page-data-for-redirected-page-a"
      )
      cy.intercept("GET", "/page-data/pagina-larga/page-data.json").as(
        "page-data-for-redirected-page-b"
      )

      cy.intercept("GET", "/page-data/long-page/page-data.json").as(
        "redirected-page-data"
      )

      cy.visit(`/redirect-links/`).waitForRouteChange()

      cy.get("a").each(($el, index, $list) => {
        cy.then(() => {
          expect($el[0].href.replace(`http://localhost:9000`, ``)).to.be.oneOf(
            expectedLinks
          )
        })
        // focus / hover links to force trigger preload
        cy.wrap($el).trigger("mouseover")
      })

      cy.then(() => {
        // those requests should not happen
        cy.get("@page-data-for-redirected-page-a").should(networkCall => {
          expect(networkCall).to.be.null
        })
        cy.get("@page-data-for-redirected-page-b").should(networkCall => {
          expect(networkCall).to.be.null
        })

        // instead we want links to use redirects
        cy.get("@redirected-page-data").should(networkCall => {
          expect(networkCall.response.statusCode).to.be.oneOf([304, 200])
        })
      })
    }
  )

  it(`should support hash parameter with Link component`, () => {
    cy.visit(`/`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.getTestElement(`redirect-two-anchor`).click().waitForRouteChange()
    cy.location(`pathname`).should(`equal`, `/redirect-search-hash/`)
    cy.location(`hash`).should(`equal`, `#anchor`)
    cy.location(`search`).should(`equal`, ``)
  })

  // TODO: un-skip this tests when this is figured out
  // this DOES happen locally, but it's quite difficult to understand
  // we are getting hydration failures right now
  it.skip(`should support hash parameter on direct visit`, () => {
    cy.visit(`/redirect-two/#anchor`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/redirect-search-hash/`)
    cy.location(`hash`).should(`equal`, `#anchor`)
    cy.location(`search`).should(`equal`, ``)
  })

  it(`should support search parameter with Link component`, () => {
    cy.visit(`/`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.getTestElement(`redirect-two-search`).click().waitForRouteChange()
    cy.location(`pathname`).should(`equal`, `/redirect-search-hash/`)
    cy.location(`hash`).should(`equal`, ``)
    cy.location(`search`).should(`equal`, `?query_param=hello`)
  })

  it(`should support search parameter on direct visit`, () => {
    cy.visit(`/redirect-two/?query_param=hello`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/redirect-search-hash/`)
    cy.location(`hash`).should(`equal`, ``)
    cy.location(`search`).should(`equal`, `?query_param=hello`)
  })

  it(`should support search & hash parameter with Link component`, () => {
    cy.visit(`/`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.getTestElement(`redirect-two-search-anchor`).click().waitForRouteChange()
    cy.location(`pathname`).should(`equal`, `/redirect-search-hash/`)
    cy.location(`hash`).should(`equal`, `#anchor`)
    cy.location(`search`).should(`equal`, `?query_param=hello`)
  })

  it(`should support search & hash parameter on direct visit`, () => {
    cy.visit(`/redirect-two/?query_param=hello#anchor`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/redirect-search-hash/`)
    cy.location(`hash`).should(`equal`, `#anchor`)
    cy.location(`search`).should(`equal`, `?query_param=hello`)
  })
})
