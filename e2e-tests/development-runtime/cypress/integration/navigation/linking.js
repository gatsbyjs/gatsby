describe(`navigation`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`displays content from other pages`, () => {
    cy.visit(`/page-2`).waitForRouteChange()

    cy.getTestElement(`page-2-message`)
      .invoke(`text`)
      .should(`equal`, `Hi from the second page`)
  })

  it(`re-routes on link click`, () => {
    cy.getTestElement(`page-two`).click()

    cy.location(`pathname`).should(`equal`, `/page-2/`)
  })

  it(`can navigate to and from pages`, () => {
    cy.getTestElement(`page-two`).click()

    cy.getTestElement(`back-button`).click()

    cy.location(`pathname`).should(`equal`, `/`)
  })

  it(`can navigate back using history`, () => {
    cy.getTestElement(`page-two`).click().waitForRouteChange()

    cy.go(`back`).waitForRouteChange()

    cy.location(`pathname`).should(`equal`, `/`)
  })

  it(`can navigate using numbers`, () => {
    cy.getTestElement(`page-two`).click().waitForRouteChange()

    cy.getTestElement(`back-by-number`).click()

    cy.location(`pathname`).should(`equal`, `/`)
  })

  describe(`relative links`, () => {
    it(`can navigate to a subdirectory`, () => {
      cy.getTestElement(`subdir-link`)
        .click()
        .location(`pathname`)
        .should(`eq`, `/subdirectory/page-1/`)
    })

    it(`can navigate to a sibling page`, () => {
      cy.visit(`/subdirectory/page-1`)
        .waitForRouteChange()
        .getTestElement(`page-2-link`)
        .click()
        .location(`pathname`)
        .should(`eq`, `/subdirectory/page-2/`)
    })

    it(`can navigate to a parent page`, () => {
      cy.visit(`/subdirectory/page-1`)
        .waitForRouteChange()
        .getTestElement(`page-parent-link`)
        .click()
        .location(`pathname`)
        .should(`eq`, `/subdirectory/`)
    })

    it(`can navigate to a sibling page programatically`, () => {
      cy.visit(`/subdirectory/page-1`)
        .waitForRouteChange()
        .getTestElement(`page-2-button-link`)
        .click()
        .location(`pathname`)
        .should(`eq`, `/subdirectory/page-2/`)
    })
  })

  describe(`non-existent route`, () => {
    beforeEach(() => {
      cy.getTestElement(`broken-link`).click().waitForRouteChange()
    })

    it(`displays 404 page on broken link`, () => {
      cy.get(`h1`).invoke(`text`).should(`eq`, `Gatsby.js development 404 page`)

      /*
       * Two route updates:
       * - initial render of /
       * - (default) development 404 page
       */
      cy.lifecycleCallCount(`onRouteUpdate`).should(`eq`, 2)
    })

    it(`can display a custom 404 page`, () => {
      cy.get(`button`).click()

      cy.getTestElement(`page-title`).invoke(`text`).should(`eq`, `NOT FOUND`)

      /*
       * Two route updates:
       * - initial render
       * - 404 page
       * a re-render does not occur because the route remains the same
       */
      cy.lifecycleCallCount(`onRouteUpdate`).should(`eq`, 2)
    })
  })

  describe(`Supports unicode characters in urls`, () => {
    it(`Can navigate directly`, () => {
      cy.visit(encodeURI(`/안녕`)).waitForRouteChange()
      cy.getTestElement(`page-2-message`)
        .invoke(`text`)
        .should(`equal`, `Hi from the second page`)
    })

    it(`Can navigate on client`, () => {
      cy.visit(`/`).waitForRouteChange()
      cy.getTestElement(`page-with-unicode-path`).click().waitForRouteChange()

      cy.getTestElement(`page-2-message`)
        .invoke(`text`)
        .should(`equal`, `Hi from the second page`)
    })

    it(`should show 404 page when url with unicode characters point to a non-existent page route when navigating directly`, () => {
      cy.visit(encodeURI(`/안녕404/`), {
        failOnStatusCode: false,
      }).waitForRouteChange()

      cy.get(`h1`).invoke(`text`).should(`eq`, `Gatsby.js development 404 page`)
    })

    it(`should show 404 page when url with unicode characters point to a non-existent page route when navigating on client`, () => {
      cy.visit(`/`).waitForRouteChange()
      cy.window()
        .then(win => win.___navigate(`/안녕404/`))
        .waitForRouteChange()

      cy.get(`h1`).invoke(`text`).should(`eq`, `Gatsby.js development 404 page`)
    })
  })

  describe(`Supports encodable characters in urls`, () => {
    it(`Can navigate directly`, () => {
      cy.visit(`/foo/@something/bar`).waitForRouteChange()
      cy.getTestElement(`page-2-message`)
        .invoke(`text`)
        .should(`equal`, `Hi from the second page`)
    })

    it(`Can navigate on client`, () => {
      cy.visit(`/`).waitForRouteChange()
      cy.getTestElement(`page-with-encodable-path`).click().waitForRouteChange()

      cy.getTestElement(`page-2-message`)
        .invoke(`text`)
        .should(`equal`, `Hi from the second page`)
    })

    it(`should show 404 page when url with unicode characters point to a non-existent page route when navigating directly`, () => {
      cy.visit(`/foo/@something/bar404/`, {
        failOnStatusCode: false,
      }).waitForRouteChange()

      cy.get(`h1`).invoke(`text`).should(`eq`, `Gatsby.js development 404 page`)
    })

    it(`should show 404 page when url with unicode characters point to a non-existent page route when navigating on client`, () => {
      cy.visit(`/`).waitForRouteChange()
      cy.window()
        .then(win => win.___navigate(`/foo/@something/bar404/`))
        .waitForRouteChange()

      cy.get(`h1`).invoke(`text`).should(`eq`, `Gatsby.js development 404 page`)
    })
  })

  // TODO: Check if this is the correct behavior
  describe(`All location changes should trigger an effect (fast-refresh)`, () => {
    beforeEach(() => {
      cy.visit(`/navigation-effects`).waitForRouteChange()
    })

    it(`should trigger an effect after a search param has changed`, () => {
      cy.findByTestId(`effect-message`).should(`have.text`, ``)
      cy.findByTestId(`send-search-message`).click().waitForRouteChange()
      cy.findByTestId(`effect-message`).should(
        `have.text`,
        `?message=searchParam`
      )
    })

    it(`should trigger an effect after the hash has changed`, () => {
      cy.findByTestId(`effect-message`).should(`have.text`, ``)
      cy.findByTestId(`send-hash-message`).click().waitForRouteChange()
      cy.findByTestId(`effect-message`).should(`have.text`, `#message-hash`)
    })

    it(`should trigger an effect after the state has changed`, () => {
      cy.findByTestId(`effect-message`).should(`have.text`, ``)
      cy.findByTestId(`send-state-message`).click().waitForRouteChange()
      cy.findByTestId(`effect-message`).should(
        `have.text`,
        `this is a message using the state`
      )
    })
  })

  describe(`Route lifecycle update order`, () => {
    it(`calls onPreRouteUpdate, render and onRouteUpdate the correct amount of times on route change`, () => {
      cy.lifecycleCallCount(`onPreRouteUpdate`).should(`eq`, 1)
      cy.lifecycleCallCount(`render`).should(`eq`, 1)
      cy.lifecycleCallCount(`onRouteUpdate`).should(`eq`, 1)
      cy.getTestElement(`page-two`).click().waitForRouteChange()
      cy.getTestElement(`page-2-message`).should(`exist`)
      cy.lifecycleCallCount(`onPreRouteUpdate`).should(`eq`, 2)
      cy.lifecycleCallCount(`render`).should(`eq`, 2)
      cy.lifecycleCallCount(`onRouteUpdate`).should(`eq`, 2)
    })

    it(`renders the component after onPreRouteUpdate on route change`, () => {
      cy.getTestElement(`page-component`).should(`exist`)
      cy.lifecycleCallCount(`onPreRouteUpdate`).should(`eq`, 1)
      cy.lifecycleCallCount(`render`).should(`eq`, 1)
      cy.lifecycleCallCount(`onRouteUpdate`).should(`eq`, 1)
      cy.lifecycleCallOrder([
        `onPreRouteUpdate`,
        `render`,
        `onRouteUpdate`,
      ]).should(`eq`, true)
      cy.getTestElement(`page-two`).click().waitForRouteChange()
      cy.getTestElement(`page-2-message`).should(`exist`)
      cy.lifecycleCallOrder([
        `onPreRouteUpdate`,
        `render`,
        `onRouteUpdate`,
        `onPreRouteUpdate`,
        `render`,
        `onRouteUpdate`,
      ]).should(`eq`, true)
      cy.lifecycleCallCount(`onPreRouteUpdate`).should(`eq`, 2)
      cy.lifecycleCallCount(`render`).should(`eq`, 2)
      cy.lifecycleCallCount(`onRouteUpdate`).should(`eq`, 2)
    })
  })
})
