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

function hasJPEGPlaceholder(el) {
  el.children(`img`)
    .should(`have.attr`, `src`)
    .and(src => {
      expect(src).to.match(/^data:image\/jpeg/)
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

  cy.get(`[data-cy="${type}"]`).scrollIntoView()
  // Wait for load
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
  it(`fluid`, testConfig, () => testGatsbyImage(`fluid`, hasJPEGPlaceholder))
  it(`fixed`, testConfig, () => testGatsbyImage(`fixed`, hasJPEGPlaceholder))
  it(`webp`, testConfig, () => testGatsbyImage(`webp`, hasJPEGPlaceholder))
  it(`traced`, testConfig, () => testGatsbyImage(`traced`, hasSVGPlaceholder))
  it(`sqip`, testConfig, () => testGatsbyImage(`sqip`, hasSVGPlaceholder))

  it(`english`, testConfig, () => {
    testGatsbyImage(`english`, hasJPEGPlaceholder)
    cy.get(`[data-cy="english"] p strong`).should(
      "have.text",
      "Locale - American English (png)"
    )
  })
  it(`german`, testConfig, () => {
    testGatsbyImage(`german`, hasJPEGPlaceholder)
    cy.get(`[data-cy="german"] p strong`).should(
      "have.text",
      "Locale - German (png)"
    )
  })
})
