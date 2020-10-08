const fluidTestId = `image-fluid`

describe(`fluid`, () => {
  beforeEach(() => {
    cy.visit(`/fluid`).waitForRouteChange()
  })

  it(`applies height and width to wrapper`, () => {
    cy.getTestElement(fluidTestId)
      .find(`.gatsby-image`)
      .should(`have.attr`, `style`)
      .and(style => {
        ;[`height:`, `width:`].forEach(part => {
          expect(style).contains(part)
        })
      })
  })

  it(`works on png files`, () => {
    cy.getTestElement(`image-fluid-png`).find(`.gatsby-image`).should(`exist`)
  })

  it(`works on relative paths outside of src`, () => {
    cy.getTestElement(`image-fluid-relative`)
      .find(`.gatsby-image`)
      .should(`exist`)
  })

  it(`renders a spacer div`, () => {
    cy.getTestElement(fluidTestId)
      .find(`.gatsby-image > div`)
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
