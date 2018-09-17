const fluidTestId = `image-fluid`

describe(`fluid`, () => {
  beforeEach(() => {
    cy.visit(`/fluid`).waitForRouteChange()
  })

  it(`renders a spacer div`, () => {
    cy.getTestElement(fluidTestId)
      .find(`.gatsby-image-wrapper > div`)
      .should(`have.attr`, `style`)
      .and(`match`, /width:100%;padding-bottom/)
  })

  it(`renders sizes`, () => {
    cy.getTestElement(fluidTestId)
      .find(`picture > source`)
      .should(`have.attr`, `sizes`)
      .and(`match`, /\(max-width: \d+px\) 100vw, \d+px/)
  })

  it(`renders correct srcset`, () => {
    cy.getTestElement(fluidTestId)
      .find(`picture > source`)
      .should(`have.attr`, `srcset`)
      .and(srcset => {
        srcset.split(/\s*,\s*/).forEach(part => {
          expect(part).to.contain(`/static`)
          expect(part).to.match(/\d{2,}w/)
        })
      })
  })
})
