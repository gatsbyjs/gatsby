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
    cy.visit("/gatsby-plugin-image")
  })

  it(`constrained`, () =>
    testGatsbyPluginImage(`constrained`, hasColorPlaceholder))
  it(`full-width`, () => testGatsbyPluginImage(`full-width`, hasNoPlaceholder))
  it(`fixed`, () => testGatsbyPluginImage(`fixed`, hasNoPlaceholder))
  it(`dominant-color`, () =>
    testGatsbyPluginImage(`dominant-color`, hasColorPlaceholder))
  it(`traced`, () => testGatsbyPluginImage(`traced`, hasSVGPlaceholder))
  it(`blurred`, () => testGatsbyPluginImage(`blurred`, hasJPEGPlaceholder))
  it(`sqip`, () => testGatsbyPluginImage(`sqip`, hasSVGPlaceholder))
})
