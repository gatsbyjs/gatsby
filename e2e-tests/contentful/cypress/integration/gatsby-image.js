const testConfig = {
  retries: {
    runMode: 2,
    openMode: 0,
  },
}

function hasSVGPlaceholder(el) {
  el.children(`img`)
    .should(`have.attr`, `src`)
    .and(src => {
      expect(src).to.match(/^data:image\/svg\+xml/)
    })
}

function hasBase64Placeholder(el) {
  el.children(`img`)
    .should(`have.attr`, `src`)
    .and(src => {
      expect(src).to.match(/^data:image\/[a-z]+;base64/)
    })
}

function testGatsbyImage(type, testPlaceholder) {
  if (testPlaceholder) {
    cy.get(`[data-cy="${type}"]`)
      .find(".gatsby-image-wrapper")
      .each($el => {
        const el = cy.wrap($el)
        testPlaceholder(el)
      })
  }

  cy.get(`[data-cy="${type}"]`).scrollIntoView({ duration: 500 })

  // Wait images for load
  cy.wait(1000)

  cy.get(`[data-cy="${type}"]`)
    .find(".gatsby-image-wrapper > picture > img")
    .each(($el, i) => {
      cy.wrap($el).should(`have.attr`, `srcset`)
      cy.wrap($el).should(`have.attr`, `src`)
      cy.wrap($el).matchImageSnapshot(`${type}-${i}`)
    })
}

describe(`gatsby-image`, () => {
  beforeEach(() => {
    cy.visit("/gatsby-image").waitForRouteChange()
  })
  it(`fluid`, testConfig, () => testGatsbyImage(`fluid`, hasBase64Placeholder))
  it(`fixed`, testConfig, () => testGatsbyImage(`fixed`, hasBase64Placeholder))
  it(`webp`, testConfig, () => testGatsbyImage(`webp`, hasBase64Placeholder))
  it(`traced`, testConfig, () => testGatsbyImage(`traced`, hasSVGPlaceholder))
  it(`sqip`, testConfig, () => testGatsbyImage(`sqip`, hasSVGPlaceholder))

  it(`english`, testConfig, () => {
    testGatsbyImage(`english`, hasBase64Placeholder)
    cy.get(`[data-cy="english"] p strong`).should(
      "have.text",
      "Locale - American English (png)"
    )
  })
  it(`german`, testConfig, () => {
    testGatsbyImage(`german`, hasBase64Placeholder)
    cy.get(`[data-cy="german"] p strong`).should(
      "have.text",
      "Locale - German (png)"
    )
  })
})
