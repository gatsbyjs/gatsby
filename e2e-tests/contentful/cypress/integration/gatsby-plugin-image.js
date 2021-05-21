const testConfig = {
  retries: {
    runMode: 2,
    openMode: 0,
  },
}

function hasSVGPlaceholder(el) {
  el.find(`img`)
    .should(`have.attr`, `src`)
    .and(src => {
      expect(src).to.match(/^data:image\/svg\+xml/)
    })
}

function hasJPEGPlaceholder(el) {
  el.children(`img`)
    .should(`have.attr`, `src`)
    .and(src => {
      expect(src).to.match(/^data:image\/jpeg;base64/)
    })
}

function hasNoPlaceholder(el) {
  el.children(`div[data-placeholder-image]`).should(`be.empty`)
}

function hasColorPlaceholder(el) {
  el.children(`div[data-placeholder-image]`)
    .should("have.css", "background-color")
    .should("not.be.empty")
}

function testGatsbyPluginImage(type, testPlaceholder) {
  if (testPlaceholder) {
    cy.get(`[data-cy="${type}"]`)
      .find(".gatsby-image-wrapper")
      .each($el => {
        const el = cy.wrap($el)
        testPlaceholder(el)
      })
  }

  cy.get(`[data-cy="${type}"]`).scrollIntoView({ duration: 500 })

  // Wait for load
  cy.wait(1000)

  cy.get(`[data-cy="${type}"]`)
    .find(".gatsby-image-wrapper > picture > img")
    .each(($el, i) => {
      cy.wrap($el).should("be.visible")
      cy.wrap($el).should("have.attr", "srcset")
      cy.wrap($el).should("have.attr", "src")
      cy.wrap($el).matchImageSnapshot(`${type}-${i}`)
    })
}

describe(`gatsby-plugin-image`, () => {
  beforeEach(() => {
    cy.visit("/gatsby-plugin-image").waitForRouteChange()
  })

  it(`constrained`, testConfig, () =>
    testGatsbyPluginImage(`constrained`, hasColorPlaceholder)
  )
  it(`full-width`, testConfig, () =>
    testGatsbyPluginImage(`full-width`, hasNoPlaceholder)
  )
  it(`fixed`, testConfig, () =>
    testGatsbyPluginImage(`fixed`, hasNoPlaceholder)
  )
  it(`dominant-color`, testConfig, () =>
    testGatsbyPluginImage(`dominant-color`, hasColorPlaceholder)
  )
  it(`traced`, testConfig, () =>
    testGatsbyPluginImage(`traced`, hasSVGPlaceholder)
  )
  it(`blurred`, testConfig, () =>
    testGatsbyPluginImage(`blurred`, hasJPEGPlaceholder)
  )
  it(`sqip`, testConfig, () => testGatsbyPluginImage(`sqip`, hasSVGPlaceholder))
})
