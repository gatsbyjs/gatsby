export function assetPageVisits(pages) {
  for (let i = 0; i < pages; i++) {
    const page = pages[i]

    cy.intercept(new RegExp(`^${page.path}$`), req => {
      req.continue(res => {
        expect(res.statusCode).to.equal(page.status)
        if (page.destiationPage) {
          expect(res.headers.location).to.equal(page.destinationPath)
        }
      })
    })
  }
}
