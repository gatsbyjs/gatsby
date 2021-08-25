describe(`Cssmodule integration`, () => {
  it(`the header has the right style`, () => {
    cy.visit(`/cssmodules/`).waitForRouteChange()

    const cssModuleEl = cy.getTestElement(`cssmodule`)
    cssModuleEl.should("have.css", "font-size", "48px")

    cssModuleEl.invoke("attr", "class").then(className => {
      cy.get("style").should("contain.text", className)
    })
  })

  it(`homepage should not have cssmodules`, () => {
    const cssModuleClassName = "mystyle-module--heading--3vEgy"
    cy.visit(`/`).waitForRouteChange()
    cy.get("style").should("have.length", 2)
    cy.get("style").should("not.contain.text", cssModuleClassName)

    cy.getTestElement("cssmodules").click()
    cy.waitForRouteChange().location(`pathname`).should(`equal`, `/cssmodules/`)
    cy.get('link[rel="stylesheet"]')
      .should("have.attr", "href")
      .and("include", "pages-cssmodules")
  })
})
