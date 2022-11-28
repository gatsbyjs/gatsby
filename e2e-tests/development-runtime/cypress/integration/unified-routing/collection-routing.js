const prefixes = [``, `child-`, `computed-`, `child-computed-`]

function assert404(slug) {
  for (const prefix of prefixes) {
    cy.visit(`/collection-routing/mutations/${prefix}${slug}/`, {
      failOnStatusCode: false,
    }).waitForRouteChange()

    // page doesn't exist yet
    cy.get(`h1`).invoke(`text`).should(`eq`, `Gatsby.js development 404 page`)
  }
}

function assertPageExist(slug, content) {
  for (const prefix of prefixes) {
    cy.visit(
      `/collection-routing/mutations/${prefix}${slug}/`
    ).waitForRouteChange()
    cy.contains(content)
  }
}

function refresh(setup) {
  cy.then(() => {
    return fetch(
      `http://localhost:8000/__refresh/gatsby-source-fs-route-mutations`,
      {
        method: `POST`,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ setup }),
      }
    )
  })

  cy.wait(5000)
}

describe(`collection-routing`, () => {
  it(`can create simplest collection route that also has a number as an identifier`, () => {
    cy.visit(`/collection-routing/1/`).waitForRouteChange()
    cy.findByTestId(`slug`).should(`have.text`, `/preview/1`)
    cy.findByTestId(`pagecontext`).should(`have.text`, `1`)
  })

  it(`can navigate to a collection route and see its content rendered`, () => {
    cy.visit(`/collection-routing`).waitForRouteChange()
    // this test depends on the alphabetical sorting of markdown files
    cy.findByTestId(`collection-routing-blog-0`)
      .should(`have.attr`, `data-testslug`, `/2018-12-14-hello-world/`)
      .click()
    cy.waitForRouteChange().assertRoute(
      `/collection-routing/2018-12-14-hello-world/`
    )
    cy.findByTestId(`slug`)
    cy.should(`have.text`, `/2018-12-14-hello-world/`)
    cy.findByTestId(`pagecontext`)
    cy.should(`have.text`, `/2018-12-14-hello-world/`)
  })

  it(`can navigate to a collection route that uses unions and see its content rendered`, () => {
    cy.visit(`/collection-routing`).waitForRouteChange()
    // this test depends on the alphabetical sorting of image files
    cy.findByTestId(`collection-routing-image-0`)
      .should(`have.attr`, `data-testimagename`, `citrus-fruits`)
      .click()
    cy.waitForRouteChange().assertRoute(`/collection-routing/citrus-fruits/`)
    cy.findByTestId(`name`)
    cy.should(`have.text`, `citrus-fruits`)
    cy.findByTestId(`pagecontext`)
    cy.should(`have.text`, `citrus-fruits`)
  })

  it(`should allow normal folder`, () => {
    cy.visit(`/collection-routing/hogwarts/1/`).waitForRouteChange()
    cy.findByTestId(`custom-text`).should(`have.text`, `static-folder`)
    cy.findByTestId(`pagecontext`).should(`have.text`, `1`)
  })

  it(`should allow static template`, () => {
    cy.visit(`/collection-routing/westworld/1/template`).waitForRouteChange()
    cy.findByTestId(`custom-text`).should(`have.text`, `Static Template`)
    cy.findByTestId(`pagecontext`).should(`have.text`, `1`)
  })

  it(`should allow nested collections`, () => {
    cy.visit(`/collection-routing/hello-world-1/1`).waitForRouteChange()
    cy.findByTestId(`slug`).should(`have.text`, `/preview/1 + test`)
    cy.findByTestId(`pagecontext`).should(`have.text`, `1`)
  })

  it(`supports nested collection + client-only route`, () => {
    cy.visit(`/collection-routing/hello-world-1/dolores`).waitForRouteChange()

    cy.findByTestId(`splat`)
    cy.should(`have.text`, `dolores`)
    cy.findByTestId(`title`)
    cy.should(`have.text`, `Named SPLAT Nested with Collection Route!`)
  })

  describe(`data updates`, () => {
    before(() => {
      refresh(`reset`)
    })
    after(() => {
      refresh(`reset`)
    })

    it(`creates a page when new node is created`, () => {
      assert404(`new-node`)
      assert404(`updated-node`)

      refresh(`create`)

      assertPageExist(`new-node`, `This is node that was just created`)
      assert404(`updated-node`)
    })

    it(`remove previous page and add a new one when slug changes`, () => {
      assertPageExist(`new-node`, `This is node that was just created`)
      assert404(`updated-node`)

      refresh(`update`)

      assertPageExist(
        `updated-node`,
        `This is node that had slug and content updated`
      )
      assert404(`new-node`)
    })

    it(`remove a page when node is deleted`, () => {
      assertPageExist(
        `updated-node`,
        `This is node that had slug and content updated`
      )
      assert404(`new-node`)

      refresh(`delete`)

      assert404(`new-node`)
      assert404(`updated-node`)
    })
  })

  it(`gatsbyPath should support materialized field values`, () => {
    cy.visit(`/collection-routing/gatsby-path-materialized-linked-name/gatsby-path-materialized-parent-name`).waitForRouteChange()

    cy.findByTestId(`gatsby-path-materialized`)
    cy.should(`have.text`, `/collection-routing/gatsby-path-materialized-linked-name/gatsby-path-materialized-parent-name/`)
  })
})
