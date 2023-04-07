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

    cy.get(`[data-cy="${type}"] .gatsby-image-wrapper > picture > img`).then(
      async $imgs => {
        let i = 0
        for (const $img of $imgs) {
          cy.wrap($img).should("be.visible")

          const res = await fetch($img.currentSrc, {
            method: "HEAD",
          })
          expect(res.ok).to.be.true

          cy.wrap($img).matchImageSnapshot(`${type}-${i++}`)
        }
      }
    )
  })
})
