import { parseSrcset } from "srcset"

const testConfig = {
  retries: {
    runMode: 2,
    openMode: 0,
  },
}

describe(`gatsby-image-cdn urls`, () => {
  beforeEach(() => {
    cy.visit("/gatsby-image-cdn").waitForRouteChange()
  })

  it(`creates a proper gatsby image cdn url`, testConfig, () => {
    const type = "gatsby-image-cdn"

    cy.get(`[data-cy="${type}"]`)
      .find(".gatsby-image-wrapper > picture > img")
      .each(($el, i) => {
        cy.wrap($el).should("be.visible")
        cy.wrap($el)
          .should("have.attr", "srcset")
          .and(srcset => {
            expect(srcset).to.match(/_gatsby\/image/)

            parseSrcset(srcset).forEach(({ url }) => {
              const [, , , sourceUrl64, _args64, filename] = url.split(`/`)
              const sourceUrl = window.atob(sourceUrl64)
              expect(sourceUrl).to.equal(
                "https://images.ctfassets.net/k8iqpp6u0ior/3BSI9CgDdAn1JchXmY5IJi/f97a2185b3395591b98008647ad6fd3c/camylla-battani-AoqgGAqrLpU-unsplash.jpg"
              )
              expect(filename).to.equal(
                "camylla-battani-AoqgGAqrLpU-unsplash.jpg"
              )
            })
          })

        cy.wrap($el).matchImageSnapshot(`${type}-${i}`)
      })
  })
})
