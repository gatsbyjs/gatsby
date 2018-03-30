describe(`The Home Page`, () => {
  it(`successfully loads`, () => {
    cy.visit(`/`) 
  })

  it(`contains the title with an SVG icon and text "Gatsbygram"`, () => {
    cy.getTestElement(`site-title`).get(`svg`)
    cy.getTestElement(`site-title`).contains(`Gatsbygram`)
  })

  it(`renders user avatar and name`, () => {
    cy.getTestElement(`user-avatar`).get(`img`)
    cy.getTestElement(`username`).contains(`kyle__mathews`)
  })

  it(`shows user's posts and followers count`, () => {
    cy.getTestElement(`user-meta`).contains(`100 posts`)
    cy.getTestElement(`user-meta`).contains(`192k followers`)
  })
})