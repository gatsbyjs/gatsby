describe(`manual <Head /> render`, () => {
  beforeEach(() => {
    cy.visit(`/head`).waitForRouteChange()
  })

  it(`renders the meta tags in the head`, () => {
    // NOTE(@mxstbr): @cypress/snapshot does not have support for snapshotting
    // multiple DOM elements, so we manually iterate through them and snapshot each one
    // @see https://github.com/cypress-io/snapshot/issues/23
    cy.get(`[data-rh="true"]`).then($elems => {
      Array.from($elems).forEach($elem => {
        cy.wrap($elem).snapshot()
      })
    })
  })
})

describe(`no manual <Head /> render`, () => {
  beforeEach(() => {
    cy.visit(`/no-head`).waitForRouteChange()
  })

  it(`renders no meta tags`, () => {
    // NOTE(@mxstbr): @cypress/snapshot does not have support for snapshotting
    // multiple DOM elements, so we manually iterate through them and snapshot each one
    // @see https://github.com/cypress-io/snapshot/issues/23
    cy.get(`[data-rh="true"]`).then($elems => {
      Array.from($elems).forEach($elem => {
        cy.wrap($elem).snapshot()
      })
    })
  })
})

describe(`manual <Head /> render with minimal overrides`, () => {
  beforeEach(() => {
    cy.visit(`/mixture`).waitForRouteChange()
  })

  it(`renders the meta tags based on the siteMetdata and the description override`, () => {
    // NOTE(@mxstbr): @cypress/snapshot does not have support for snapshotting
    // multiple DOM elements, so we manually iterate through them and snapshot each one
    // @see https://github.com/cypress-io/snapshot/issues/23
    cy.get(`[data-rh="true"]`).then($elems => {
      Array.from($elems).forEach($elem => {
        cy.wrap($elem).snapshot()
      })
    })
  })
})
