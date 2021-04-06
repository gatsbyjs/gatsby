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
    cy.visit("/gatsby-image")
  })
  it(`fluid`, () => testGatsbyImage(`fluid`, hasJPEGPlaceholder))
  it(`fixed`, () => testGatsbyImage(`fixed`, hasJPEGPlaceholder))
  it(`webp`, () => testGatsbyImage(`webp`, hasJPEGPlaceholder))
  it(`traced`, () => testGatsbyImage(`traced`, hasSVGPlaceholder))
  it(`sqip`, () => testGatsbyImage(`sqip`, hasSVGPlaceholder))
})
