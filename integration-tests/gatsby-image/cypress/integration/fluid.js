const fluidTestId = 'image-fluid';

describe('fluid', () => {
  beforeEach(() => {
    cy.visit(`/`)
  })

  it('renders a spacer div', () => {
    cy.getTestElement(fluidTestId, '.gatsby-image-outer-wrapper > .gatsby-image-wrapper > div')
      .should('have.attr', 'style').and('match', /width:100%;padding-bottom/)
  })

  it('renders sizes', () => {
    cy.getTestElement(fluidTestId, 'picture > source').should('have.attr', 'sizes', '(max-width: 500px) 100vw, 500px')
  })
  // TODO: make this less janky
  it('renders correct srcset', () => {
    cy.getTestElement(fluidTestId, 'picture > source').should('have.attr', 'srcset', ['/static/citrus-fruits-12807bd58d2bc185cad328cf8929ce22-46033.jpg 125w',
      '/static/citrus-fruits-12807bd58d2bc185cad328cf8929ce22-16922.jpg 250w',
      '/static/citrus-fruits-12807bd58d2bc185cad328cf8929ce22-0ab41.jpg 500w',
      '/static/citrus-fruits-12807bd58d2bc185cad328cf8929ce22-e88a6.jpg 750w',
      '/static/citrus-fruits-12807bd58d2bc185cad328cf8929ce22-f6684.jpg 1000w',
      '/static/citrus-fruits-12807bd58d2bc185cad328cf8929ce22-ef1b7.jpg 1500w',
      '/static/citrus-fruits-12807bd58d2bc185cad328cf8929ce22-33681.jpg 4015w'].join(',\n'))
  })
})
