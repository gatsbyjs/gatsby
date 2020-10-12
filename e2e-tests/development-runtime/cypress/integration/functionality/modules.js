/*

*/

const refresh = async payload => {
  return await fetch(`http://localhost:8000/__refresh`, {
    method: `POST`,
    headers: {
      "Content-Type": `application/json`,
    },
    body: payload ? JSON.stringify(payload) : undefined,
  })
}

beforeEach(() => {
  cy.then(refresh)
})

after(() => {
  cy.then(refresh)
})

describe(`Query modules`, () => {
  it(`Handled in page queries`, () => {
    cy.visit(`/modules/page-query/`).waitForRouteChange()

    cy.findByText(`Page Query: Module A`).should(`exist`)

    cy.then(() =>
      refresh({
        modulesUpdate: {
          upsert: [{ id: `page-query`, file: `page-query/module-b` }],
        },
      })
    )

    cy.findByText(`Page Query: Module B`).should(`exist`)

    cy.then(() =>
      refresh({
        modulesUpdate: {
          upsert: [{ id: `page-query`, file: `page-query/module-c` }],
        },
      })
    )

    cy.findByText(`Page Query: Module C`).should(`exist`)
  })

  it(`Handled in static query placed directly in page template`, () => {
    cy.visit(`/modules/static-query-in-page-template/`).waitForRouteChange()

    cy.findByText(`Static Query in Page Template: Module A`).should(`exist`)

    cy.then(() =>
      refresh({
        modulesUpdate: {
          upsert: [
            {
              id: `static-query-in-page-template`,
              file: `static-query-in-page-template/module-b`,
            },
          ],
        },
      })
    )

    cy.findByText(`Static Query in Page Template: Module B`).should(`exist`)

    cy.then(() =>
      refresh({
        modulesUpdate: {
          upsert: [
            {
              id: `static-query-in-page-template`,
              file: `static-query-in-page-template/module-c`,
            },
          ],
        },
      })
    )

    cy.findByText(`Static Query in Page Template: Module C`).should(`exist`)
  })

  it(`Handled in static query placed under page template`, () => {
    cy.visit(`/modules/static-query-under-page-template/`).waitForRouteChange()

    cy.findByText(`Static Query under Page Template: Module A`).should(`exist`)

    cy.then(() =>
      refresh({
        modulesUpdate: {
          upsert: [
            {
              id: `static-query-under-page-template`,
              file: `static-query-under-page-template/module-b`,
            },
          ],
        },
      })
    )

    cy.findByText(`Static Query under Page Template: Module B`).should(`exist`)

    cy.then(() =>
      refresh({
        modulesUpdate: {
          upsert: [
            {
              id: `static-query-under-page-template`,
              file: `static-query-under-page-template/module-c`,
            },
          ],
        },
      })
    )

    cy.findByText(`Static Query under Page Template: Module C`).should(`exist`)
  })
})
