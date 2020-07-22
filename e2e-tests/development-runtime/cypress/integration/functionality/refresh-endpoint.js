describe(`When the refresh endpoint is hit multiple times`, () => {
  afterEach(() => {
    waitUntilServerRespondsSucessfully()
  });
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

function waitUntilServerRespondsSucessfully() {
  cy.waitUntil(() => cy.request("/").then((response) => {
      return response.status == 200
  }), {
      timeout: 20000,
      interval: 1000
  })
}