const routes = [
  {
    name: 'static',
    param: '',
  },
  {
    name: 'param',
    param: 'dune',
  },
  {
    name: 'wildcard',
    param: 'atreides/harkonnen'
  },
  {
    name: 'named-wildcard',
    param: 'corinno/fenring'
  }
] as const

describe('Functions', () => {
  for (const route of routes) {
    it(`should return "${route.name}" result`, () => {
      cy.request(`/api/${route.name}${route.param ? `/${route.param}` : ''}`).as(`req-${route.name}`)
      cy.get(`@req-${route.name}`).its('body').should('contain', `Hello World${route.param ? ` from ${route.param}` : ``}`)
    })
  }
})