const fixedTestId = `image-fixed`

describe(`fixed`, () => {
  beforeEach(() => {
    cy.visit(`/static-image/fixed`).waitForRouteChange()
  })

  it(`applies height and width to wrapper`, () => {
    cy.getTestElement(fixedTestId)
      .find(`.gatsby-image-wrapper`)
      .should(`have.attr`, `style`)
      .and(style => {
        ;[`height:`, `width:`].forEach(part => {
          expect(style).contains(part)
        })
      })
  })

  it(`works on png files`, () => {
    cy.getTestElement(`image-fixed-png`)
      .find(`.gatsby-image-wrapper`)
      .should(`exist`)
  })

  it(`works on relative paths outside of src`, () => {
    cy.getTestElement(`image-fixed-relative`)
      .find(`.gatsby-image-wrapper`)
      .should(`exist`)
  })

  it(`includes sizes attribute`, () => {
    cy.getTestElement(fixedTestId)
      .find(`[data-main-image]`)
      .should(`have.attr`, `sizes`)
      .should(`equal`, `500px`)
  })
})
