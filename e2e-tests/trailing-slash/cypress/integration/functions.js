import { assertPageVisits } from "../utils/trailing-slash"

describe(`functions`, () => {
  describe(`src/api/test.js`, () => {
    it(`functions are always accessible without trailing slash`, () => {
      assertPageVisits([{ path: "/api/test", status: 200 }])

      cy.visit(`/api/test`).assertRoute(`/api/test`)
    })

    it(`functions 404 with trailing slash`, () => {
      assertPageVisits([{ path: "/api/test/", status: 404 }])

      cy.visit(`/api/test/`, { failOnStatusCode: false }).assertRoute(
        `/api/test/`
      )
    })
  })

  describe(`src/api/nested/index.js`, () => {
    it(`functions are always accessible without trailing slash`, () => {
      assertPageVisits([{ path: "/api/nested", status: 200 }])

      cy.visit(`/api/nested`).assertRoute(`/api/nested`)
    })

    it(`functions 404 with trailing slash`, () => {
      assertPageVisits([{ path: "/api/nested/", status: 404 }])

      cy.visit(`/api/nested/`, { failOnStatusCode: false }).assertRoute(
        `/api/nested/`
      )
    })
  })
})
