/*
 * Those are the tests for page and static query caches that we store in runtime.
 * It should make sure that we correctly update them when needed. In particular:
 *   a) we don't display stale content
 *   b) that various edge cases are handled and we don't end up showing blank page of death
 *
 * Important part here is to make sure we only use client-side navigation, as regular browser navigation would clear those caches
 *
 * How those test work?
 *
 * There is 16 test scenarios:
 *  - Each scenario has 2 dedicated pages (with exception of 404 scenario, because we only can have one 404 page, so this is shared for multiple pages).
 *  - Each scenario has dedicated data node (queried by both pages dedicated to the scenario). This is coming from `.json` file (see `content/query-data-caches`)
 *  - There are 4 page types:
 *    - Regular static page that has trailing slash (referred to as `with-trailing-slash-A` in tests, data files, page components, etc)
 *    - Regular static page that DOESN't have trailing slash (referred to as `no-trailing-slash-A` in tests, data files, page components, etc)
 *    - Client-only page (referred to as `client-only` or `CO`)
 *    - 404 page (referred to as `404`)
 *  - There are 2 types of query - page query and static query
 *  - Each scenario has follow same steps:
 *    1. Visit starting page
 *    2. Set variable on `window` object (will be used in step 11.)
 *    3. Assert page type, page canonical path and data for initial page and initial data
 *    4. At this point all runtime data caches for that page should be saturated
 *    5. Navigate to second page for the scenario using `gatsby-link` (we want to `cy.visit` only once per scenario to keep cached data in memory)
 *    6. Assert page type, page canonical path and data for second page and initial data
 *    7. Update data (edit `.json` file) that is used by both pages used in the scenario
 *    8. Assert page type, page canonical path and data for second page and *updated* data
 *    9. Navigate to initial page. There are 2 cases for navigating back and there are separate scenarios for those
 *       - using `gatsby-link`
 *       - using `history.back()`
 *    10. Assert page type, page canonical path and data for initial page and *updated* data
 *    11. Assert that variable set on `window` object in step 2. is still there (this is to make sure we used only client side navigation and cached data wasn't lost as part of refresh or traditional browser navigation)
 */

// --- common helpers ---
function updateData(config) {
  cy.exec(
    `npm run update -- --file content/query-data-caches/${config.slug}.json --replacements "before-edit:after-edit" --exact`
  )
}
function preTestSetup(config) {
  cy.exec(
    `npm run update -- --file content/query-data-caches/${config.slug}.json --restore`
  )
}

before(() => {
  cy.exec(`npm run reset`)
})

after(() => {
  cy.exec(`npm run reset`)
})

function setupForAssertingNotReloading() {
  cy.window().then(win => {
    win.__checkIfDidNotReload = true
  })
}

function assertNotReloading() {
  // this is making sure we used only client-side navigation
  // if there was reload, `__checkIfDidNotReload` on window object wouldn't exist
  cy.window().its(`__checkIfDidNotReload`).should(`equal`, true)
}

function getExpectedCanonicalPath(config) {
  if (config.page === `404`) {
    return `/404.html`
  }

  return `/query-data-caches/${config.slug}/${
    config.page === `client-only`
      ? `:client-only`
      : `page-${config.page}/`
  }`
}

function pageTitleAndDataAssertion(config) {
  cy.log(
    `Asserting that we are on page "${config.page}" with data "${config.data}"`
  )

  if (config.page === `404`) {
    // if we are on 404 we need to hide dev-404 to show real 404 page
    cy.findByText(`Preview custom 404 page`).click()
  }

  cy.findByTestId(`${config.prefix || ``}page-path`).should(
    `have.text`,
    getExpectedCanonicalPath(config)
  )

  cy.findByTestId(`${config.prefix || ``}query-data-caches-page-title`).should(
    `have.text`,
    `This is page ${config.page}`
  )

  cy.findByTestId(
    `${config.prefix || ``}${config.queryType}-query-result`
  ).should(
    `have.text`,
    `${config.slug} / ${
      config.page === config.initialPage ? `initial-page` : `second-page`
    }: ${config.data}`
  )
}

function runTests(config) {
  preTestSetup(config)

  cy.visit(`/query-data-caches/${config.slug}/page-A/`, {
    failOnStatusCode: config.initialPage !== `404`,
  }).waitForRouteChange()

  setupForAssertingNotReloading()

  // baseline assertions
  pageTitleAndDataAssertion({
    ...config,
    page: config.initialPage,
    data: `before-edit`,
  })

  cy.findByTestId(`page-b-link`).click().waitForRouteChange()

  // assert we navigated
  pageTitleAndDataAssertion({ ...config, page: `B`, data: `before-edit` })

  // edit data
  updateData(config)

  // assert data on current page changed
  pageTitleAndDataAssertion({ ...config, page: `B`, data: `after-edit` })

  if (config.navigateBack === `link`) {
    cy.findByTestId(`page-a-link`).click().waitForRouteChange()
  } else if (config.navigateBack === `history`) {
    // this is just making sure page components don't have link to navigate back (asserting correct setup)
    cy.findByTestId(`page-a-link`).should(`not.exist`)
    cy.go(`back`).waitForRouteChange()
  }

  // assert data on page we previously visited is updated
  pageTitleAndDataAssertion({
    ...config,
    page: config.initialPage,
    data: `after-edit`,
  })

  assertNotReloading()
}

describe(`Keeping caches up-to-date when updating data`, () => {
  describe(`Navigate from static page A to page B, invalidate some data resources for static page A, navigate back to static page A`, () => {
    describe(`Navigating back with gatsby-link`, () => {
      it(`page query (page has trailing slash)`, () => {
        const config = {
          slug: `page-query-with-trailing-slash-A-to-B-to-A-link`,
          queryType: `page`,
          navigateBack: `link`,
          initialPage: `A`,
        }

        runTests(config)
      })

      it(`page query (page doesn't have trailing slash)`, () => {
        const config = {
          slug: `page-query-no-trailing-slash-A-to-B-to-A-link`,
          trailingSlash: false,
          queryType: `page`,
          navigateBack: `link`,
          initialPage: `A`,
        }

        runTests(config)
      })

      it(`static query (page has trailing slash)`, () => {
        const config = {
          slug: `static-query-with-trailing-slash-A-to-B-to-A-link`,
          queryType: `static`,
          navigateBack: `link`,
          initialPage: `A`,
        }

        runTests(config)
      })

      it(`static query (page doesn't have trailing slash)`, () => {
        const config = {
          slug: `static-query-no-trailing-slash-A-to-B-to-A-link`,
          trailingSlash: false,
          queryType: `static`,
          navigateBack: `link`,
          initialPage: `A`,
        }

        runTests(config)
      })
    })

    describe(`Navigating back with history.back()`, () => {
      it(`page query (page has trailing slash)`, () => {
        const config = {
          slug: `page-query-with-trailing-slash-A-to-B-to-A-history`,
          queryType: `page`,
          navigateBack: `history`,
          initialPage: `A`,
        }

        runTests(config)
      })

      it(`page query (page doesn't have trailing slash)`, () => {
        const config = {
          slug: `page-query-no-trailing-slash-A-to-B-to-A-history`,
          trailingSlash: false,
          queryType: `page`,
          navigateBack: `history`,
          initialPage: `A`,
        }

        runTests(config)
      })

      it(`static query (page has trailing slash)`, () => {
        const config = {
          slug: `static-query-with-trailing-slash-A-to-B-to-A-history`,
          queryType: `static`,
          navigateBack: `history`,
          initialPage: `A`,
        }

        runTests(config)
      })

      it(`static query (page doesn't have trailing slash)`, () => {
        const config = {
          slug: `static-query-no-trailing-slash-A-to-B-to-A-history`,
          trailingSlash: false,
          queryType: `static`,
          navigateBack: `history`,
          initialPage: `A`,
        }

        runTests(config)
      })
    })
  })

  describe(`Navigate from client-only page A to page B, invalidate some data resources for client-only page A, navigate back to client-only page A`, () => {
    describe(`Navigating back with gatsby-link`, () => {
      it(`page query`, () => {
        const config = {
          slug: `page-query-CO-to-B-to-CO-link`,
          queryType: `page`,
          navigateBack: `link`,
          initialPage: `client-only`,
        }

        runTests(config)
      })

      it(`static query`, () => {
        const config = {
          slug: `static-query-CO-to-B-to-CO-link`,
          queryType: `static`,
          navigateBack: `link`,
          initialPage: `client-only`,
        }

        runTests(config)
      })
    })

    describe(`Navigating back with history.back()`, () => {
      it(`page query`, () => {
        const config = {
          slug: `page-query-CO-to-B-to-CO-history`,
          queryType: `page`,
          navigateBack: `history`,
          initialPage: `client-only`,
        }

        runTests(config)
      })

      it(`static query`, () => {
        const config = {
          slug: `static-query-CO-to-B-to-CO-history`,
          queryType: `static`,
          navigateBack: `history`,
          initialPage: `client-only`,
        }

        runTests(config)
      })
    })
  })

  describe(`Navigate from 404 page A to page B, invalidate some data resources for 404 page A, navigate back to 404 page A`, () => {
    describe(`Navigating back with gatsby-link`, () => {
      it(`page query`, () => {
        const config = {
          slug: `page-query-404-to-B-to-404-link`,
          queryType: `page`,
          navigateBack: `link`,
          initialPage: `404`,
          prefix: `page-link-`,
        }

        runTests(config)
      })

      it(`static query`, () => {
        const config = {
          slug: `static-query-404-to-B-to-404-link`,
          queryType: `static`,
          navigateBack: `link`,
          initialPage: `404`,
          prefix: `static-link-`,
        }

        runTests(config)
      })
    })

    describe(`Navigating back with history.back()`, () => {
      it(`page query`, () => {
        const config = {
          slug: `page-query-404-to-B-to-404-history`,
          queryType: `page`,
          navigateBack: `history`,
          initialPage: `404`,
          prefix: `page-history-`,
        }

        runTests(config)
      })

      it(`static query`, () => {
        const config = {
          slug: `static-query-404-to-B-to-404-history`,
          queryType: `static`,
          navigateBack: `history`,
          initialPage: `404`,
          prefix: `static-history-`,
        }

        runTests(config)
      })
    })
  })
})

describe(`Keeping caches up to date when modifying list of static query hashes assigned to a template`, () => {
  describe(`using gatsby-link`, () => {
    it(`Navigate from page A to page B, add static query to page A, navigate back to page A`, () => {
      const config = {
        slug: `adding-static-query-A-to-B-to-A-link`,
        queryType: `static`,
        navigateBack: `link`,
        initialPage: `A`,
      }

      cy.visit(`/query-data-caches/${config.slug}/page-A/`).waitForRouteChange()

      setupForAssertingNotReloading()

      // baseline assertions
      pageTitleAndDataAssertion({
        ...config,
        page: config.initialPage,
        data: `from-hardcoded-data`,
      })

      cy.getTestElement(`page-b-link`).click().waitForRouteChange()

      // assert we navigated
      pageTitleAndDataAssertion({
        ...config,
        page: `B`,
        data: `from-static-query-results`,
      })

      cy.exec(
        `npm run update -- --file src/pages/query-data-caches/${config.slug}/page-A.js --replacements "adding-static-query-blank:adding-static-query-with-data" --exact`
      )

      // TODO: get rid of this wait
      // We currently have timing issue when emitting both webpack's HMR and page-data.
      // Problem is we need to potentially wait for webpack recompilation before we emit page-data (due to dependency graph traversal).
      // Even if we could delay emitting data on the "server" side - this doesn't guarantee that messages are received
      // and handled in correct order (ideally they are applied at the exact same time actually, because ordering might still cause issues if we change query text and component render function)
      cy.wait(10000)

      if (config.navigateBack === `link`) {
        cy.getTestElement(`page-a-link`).click().waitForRouteChange()
      } else if (config.navigateBack === `history`) {
        // this is just making sure page components don't have link to navigate back (asserting correct setup)
        cy.getTestElement(`page-a-link`).should(`not.exist`)
        cy.go(`back`).waitForRouteChange()
      }

      // assert data on page we previously visited is updated
      pageTitleAndDataAssertion({
        ...config,
        page: config.initialPage,
        data: `from-static-query-results`,
      })

      assertNotReloading()
    })
  })
})
