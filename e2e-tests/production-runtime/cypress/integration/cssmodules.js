describe(`Cssmodule integration`, () => {
  it(`the header has the right style`, () => {
    cy.visit(`/cssmodules/`).waitForRouteChange()

    const cssModuleEl = cy.getTestElement(`cssmodule`)
    cssModuleEl.should("have.css", "font-size", "48px")
    cssModuleEl.should($el => {
      expect($el[0].className).to.have.lengthOf(6)
    })

    cssModuleEl.invoke("attr", "class").then(className => {
      cy.get("style").contains(className).should("exist")
    })
    cy.get("style").should("have.length", 3)
  })

  it(`homepage should not have cssmodules`, () => {
    cy.visit(`/`).waitForRouteChange()
    cy.get("style").should("have.length", 2)

    cy.getTestElement("cssmodules").click()
    cy.waitForRouteChange().location(`pathname`).should(`equal`, `/cssmodules/`)
    cy.get('link[rel="stylesheet"]')
      .should("have.attr", "href")
      .and("include", "pages-cssmodules")
  })
})
