/* global cy */
describe(`Production gatsby-image`, () => {
  beforeEach(() => {
    cy.visit(`/`).waitForRouteChange()
  })

  it(`renders an outer wrapper`, () => {
    cy.getTestElement(`image-fluid`, `.gatsby-image-outer-wrapper`)
      .its(`length`)
      .should(`eq`, 1)
  })

  it(`renders an inner wrapper`, () => {
    cy.getTestElement(
      `image-fluid`,
      `.gatsby-image-outer-wrapper > .gatsby-image-wrapper`
    )
      .its(`length`)
      .should(`eq`, 1)
  })

  describe(`fallback image`, () => {
    it(`renders base-64 src`, () => {
      cy.getTestElement(`image-fluid`, `.gatsby-image-wrapper > img`)
        .should(`have.attr`, `src`)
        .and(`match`, /base64/)
    })

    it(`renders with style`, () => {
      cy.getTestElement(`image-fluid`, `.gatsby-image-wrapper > img`).should(
        `have.attr`,
        `style`
      )
    })

    it(`swaps opacity to 0`, () => {
      cy.getTestElement(`image-fluid`, `.gatsby-image-wrapper > img`)
        .should(`have.attr`, `style`)
        .and(`match`, /opacity: 0/)
    })
  })

  it(`renders a picture tag`, () => {
    cy.getTestElement(`image-fluid`, `picture`)
      .its(`length`)
      .should(`eq`, 1)
  })

  it(`renders a picture > source`, () => {
    cy.getTestElement(`image-fluid`, `picture > source`).should(
      `have.attr`,
      `srcset`
    )
  })

  it(`renders fallback img`, () => {
    cy.getTestElement(`image-fluid`, `picture > img`).should(`have.attr`, `src`)
  })

  it(`applies inline style to img`, () => {
    cy.getTestElement(`image-fluid`, `picture > img`).should(
      `have.attr`,
      `style`
    )
  })

  it(`renders noscript`, () => {
    cy.getTestElement(`image-fluid`, `noscript`)
      .its(`length`)
      .should(`eq`, 1)
  })
})
