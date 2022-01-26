import { assetPageVisits } from "../support/utils/trailing-slash"

const IS_BUILD = Cypress.env(`IS_BUILD`)

const itWhenIsBuild = IS_BUILD ? it : it.skip

describe(`static directory`, () => {
  describe(`static/something.html`, () => {
    itWhenIsBuild(`visiting directly result in 200`, () => {
      assetPageVisits([{ path: "/static/something.html", status: 200 }])

      cy.visit(`/something.html`).assertRoute(`/something.html`)
    })

    it(`adding trailing slash result in 404`, () => {
      // works for build+serve, doesn't work for develop
      assetPageVisits([{ path: "/something.html/", status: 404 }])

      cy.visit(`/something.html/`, {
        failOnStatusCode: false,
      }).assertRoute(`/something.html/`)
    })
  })

  describe(`static/nested/index.html`, () => {
    itWhenIsBuild(
      `visiting without trailing slash redirects to trailing slash`,
      () => {
        assetPageVisits([{ path: "/nested", status: 200 }])

        cy.visit(`/nested`).assertRoute(`/nested/`)
      }
    )

    it(`visiting with trailing slash returns 200`, () => {
      assetPageVisits([{ path: "/nested/", status: 404 }])

      cy.visit(`/nested/`, { failOnStatusCode: false }).assertRoute(`/nested/`)
    })
  })
})
