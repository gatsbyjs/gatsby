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

// Node version used to build & deploy the site. Set by CI (see `.circleci/config.yml`)
// via `CYPRESS_EXPECTED_FUNCTIONS_NODE_VERSION`. Only the major version is checked,
// and the assertion is skipped entirely when it's not provided.
const expectedNodeMajor = String(Cypress.env(`EXPECTED_FUNCTIONS_NODE_VERSION`) ?? ``)
  .replace(/^v/, ``)
  .split(`.`)[0]

describe('Functions', () => {
  for (const route of routes) {
    it(`should return "${route.name}" result`, () => {
      cy.request(`/api/${route.name}${route.param ? `/${route.param}` : ''}`).as(`req-${route.name}`)
      cy.get(`@req-${route.name}`).its('body').should('contain', `Hello World${route.param ? ` from ${route.param}` : ``}`)
    })
  }

  const nodeVersionTest = expectedNodeMajor ? it : it.skip

  nodeVersionTest(`should run on node major version "${expectedNodeMajor || `<not provided>`}"`, () => {
    cy.request(`/api/static/node-version`).as(`req-node-version`)
    cy.get(`@req-node-version`).its(`body.nodeVersion`).should(`match`, new RegExp(`^v${expectedNodeMajor}\\.`))
  })
})
