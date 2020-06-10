describe(`When the refresh endpoint is hit`, () => {
  afterEach(() => {
    waitUntilRefreshFinishes()
  })

  describe(`and accessing any page while refreshing`, () => {
    it(`the page shown should be restarting page for 404 page`, () => {
      cy.request(`/non-existing`).then(response => {
        expect(response.body).not.to.include(`<title>Restarting...</title>`)
      })
      cy.request(`POST`, `/__refresh`)
      cy.request(`/non-existing`).then(response => {
        expect(response.body).to.include(`<title>Restarting...</title>`)
      })
    })

    it(`the page shown should be restarting page for existing pages`, () => {
      cy.request(`/page-2/`).then(response => {
        expect(response.body).not.to.include(`<title>Restarting...</title>`)
      })
      cy.request(`POST`, `/__refresh`)
      cy.request(`/page-2/`).then(response => {
        expect(response.body).to.include(`<title>Restarting...</title>`)
      })
    })
  })

  describe(`and it was not already refreshing`, () => {
    it(`should return empty body`, () => {
      cy.request(`POST`, `/__refresh`).then(response => {
        expect(response.body).to.be.equal(``)
      })
    })
  })
  describe(`and it was already refreshing`, () => {
    it(`should put new requests with unique body in a queue`, () => {
      cy.request(`POST`, `/__refresh`).then(response => {
        expect(response.body).to.be.equal(``)
      })
      cy.request(`POST`, `/__refresh`).then(response => {
        expect(response.body).to.include(`queued`)
      })
      cy.request(`POST`, `/__refresh`).then(response => {
        expect(response.body).to.include(`already queued`)
      })
      cy.request(`POST`, `/__refresh`, `otherBody`).then(response => {
        expect(response.body).to.include(`queued`)
      })
      cy.request(`POST`, `/__refresh`, `otherBody`).then(response => {
        expect(response.body).to.include(`already queued`)
      })
    })
  })
})

function waitUntilRefreshFinishes() {
  cy.waitUntil(
    () =>
      cy
        .request(`/`)
        .then(
          response => !response.body.includes(`<title>Restarting...</title>`)
        ),
    {
      timeout: 60000,
      interval: 2000,
    }
  )

  cy.request(`/`).then(response => {
    expect(response.body).not.to.include(`<title>Restarting...</title>`)
  })
}
