beforeEach(() => {
  cy.exec(`npm run reset:preview`)
  cy.visit(`/preview`).waitForRouteChange()
})

const update = (times = 1) =>
  new Array(times)
    .fill(undefined)
    .reduce((chain, _) => chain.exec(`npm run update:preview`), cy)
const reset = () => cy.exec(`npm run reset:preview`)

describe(`Gatsby Preview (Updating)`, () => {
  it(`displays initial data`, () => {
    cy.get(`li:eq(0) a`)
      .click()
      .waitForRouteChange()

    cy.queryByText(`Hello World (1)`).should(`exist`)

    cy.queryByText(`0`).should(`exist`)
  })

  it(`updates and hot-reloads changes to content`, () => {
    cy.get(`li:eq(0) a`)
      .click()
      .waitForRouteChange()

    update()

    cy.queryByText(`1`).should(`exist`)
  })

  it.skip(`updates and hot-reloads new content`, () => {
    update()

    cy.get(`li`)
      .its(`length`)
      .should(`be`, 2)

    cy.queryByText(`Hello World (2)`)
      .click()
      .waitForRouteChange()
  })

  it(`updates when content is deleted`, () => {
    update(10)

    reset()

    cy.get(`li`)
      .its(`length`)
      .should(`be`, 1)
  })
})
