/* global cy */

let spy
Cypress.on(`window:before:load`, win => {
  spy = cy.spy(win.console, `error`).as(`errorMessage`)
})

Cypress.on(`uncaught:exception`, (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

const createMockCompilationHash = () => {
  const hash = [...Array(20)]
    .map(a => getRandomInt(0, 16))
    .map(k => k.toString(16))
    .join(``)
  cy.log({ hash })
  return hash
}

describe(
  `Webpack Compilation Hash tests`,
  {
    retries: {
      runMode: 2,
    },
  },
  () => {
    it(`should render properly`, () => {
      cy.visit(`/`).waitForRouteChange()
    })

    // Service worker is handling requests so this one is cached by previous runs
    if (!Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
      // This covers the case where a user loads a gatsby site and then
      // the site is changed resulting in a webpack recompile and a
      // redeploy. This could result in a mismatch between the page-data
      // and the component. To protect against this, when gatsby loads a
      // new page-data.json, it refreshes the page if it's webpack
      // compilation hash differs from the one on on the window object
      // (which was set on initial page load)
      //
      // Since initial page load results in all links being prefetched, we
      // have to navigate to a non-prefetched page to test this. Thus the
      // `deep-link-page`.
      //
      // We simulate a rebuild by intercepting app-data request and responding with random hash
      it(`should reload page on navigation if build occurs in background`, () => {
        const mockHash = createMockCompilationHash()

        cy.intercept("/deep-link-page/").as("deepLinkPage")

        cy.visit(`/`).waitForRouteChange()
        let didMock = false
        cy.intercept("/page-data/app-data.json", req => {
          if (!didMock) {
            req.reply({
              webpackCompilationHash: mockHash,
            })
            didMock = true
          }
        }).as(`appDataFetch`)
        cy.waitForAPI("onInitialClientRender")

        // just setting some property on the window
        // we will later assert that property to know wether
        // browser reload happened or not
        cy.window().then(w => w.beforeReload = true)
        cy.window().should('have.prop', 'beforeReload', true)

        cy.window().then(w => w.___navigate(`/deep-link-page/`))

        // wait for refresh
        cy.wait("@deepLinkPage")
        cy.waitForRouteChange()

        // we expect reload to happen so our window property shouldn't be set anymore
        cy.window().should('not.have.prop', 'beforeReload')

        // let's make sure we actually see the content
        cy.contains(
          `StaticQuery in wrapRootElement test (should show site title):Gatsby Default Starter`
        )
      })

      // This covers the case where user user loads "outdated" html from some kind of cache
      // and our data files (page-data and app-data) are for newer built.
      // We will mock both app-data (to change the hash) as well as example page-data
      // to simulate changes to static query hashes between builds.
      it(
        `should force reload page if on initial load the html is not matching newest app/page-data`, 
        {
          retries: {
            // give this test a few more chances... this one is rough
            runMode: 4,
          },
        },
        () => {
        const mockHash = createMockCompilationHash()

        // trying to intercept just `/` seems to intercept all routes
        // so intercepting same thing just with regex
        cy.intercept(/^\/$/).as(`indexFetch`)

        // We will mock `app-data` and `page-data` json responses one time (for initial load)
        let shouldMockAppDataRequests = true
        let shouldMockPageDataRequests = true
        cy.intercept("/page-data/app-data.json", req => {
          if (shouldMockAppDataRequests) {
            req.reply({
              webpackCompilationHash: mockHash,
            })
            shouldMockAppDataRequests = false
          }
        }).as(`appDataFetch`)

        cy.readFile(`public/page-data/compilation-hash/page-data.json`).then(
          originalPageData => {
            cy.intercept("/page-data/index/page-data.json", req => {
              if (shouldMockPageDataRequests) {
                req.reply({
                  ...originalPageData,
                  // setting this to empty array should break runtime with
                  // either placeholder "Loading (StaticQuery)" (for <StaticQuery> component)
                  // or thrown error "The result of this StaticQuery could not be fetched." (for `useStaticQuery` hook)
                  staticQueryHashes: [],
                })
                shouldMockPageDataRequests = false
              }
            }).as(`pageDataFetch`)
          }
        )

        cy.visit(`/`)
        cy.wait(1500)

        // <StaticQuery> component case
        cy.contains("Loading (StaticQuery)").should("not.exist")

        // useStaticQuery hook case
        cy.get(`@errorMessage`).should(`not.called`)

        // let's make sure we actually see the content
        cy.contains(
          `StaticQuery in wrapRootElement test (should show site title):Gatsby Default Starter`
        )

        cy.get("@indexFetch.all").should("have.length", 2)
        cy.get("@appDataFetch.all").should("have.length", 2)
        cy.get("@pageDataFetch.all").should("have.length", 2)
      })

      it(`should not force reload indefinitely`, () => {
        const mockHash = createMockCompilationHash()

        // trying to intercept just `/` seems to intercept all routes
        // so intercepting same thing just with regex
        cy.intercept(/^\/$/).as(`indexFetch`)

        // We will mock `app-data` and `page-data` json responses permanently
        cy.intercept("/page-data/app-data.json", req => {
          req.reply({
            webpackCompilationHash: mockHash,
          })
        }).as(`appDataFetch`)

        cy.readFile(`public/page-data/index/page-data.json`).then(
          originalPageData => {
            cy.intercept("/page-data/index/page-data.json", req => {
              req.reply({
                ...originalPageData,
                // setting this to empty array should break runtime with
                // either placeholder "Loading (StaticQuery)" (for <StaticQuery> component)
                // or thrown error "The result of this StaticQuery could not be fetched." (for `useStaticQuery` hook)
                staticQueryHashes: [],
              })
            }).as(`pageDataFetch`)
          }
        )

        cy.visit(`/`)

        cy.wait(1500)

        cy.get("@indexFetch.all").should("have.length", 2)
        cy.get("@appDataFetch.all").should("have.length", 2)
        cy.get("@pageDataFetch.all").should("have.length", 2)
      })
    }
  }
)
