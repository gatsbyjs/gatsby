it(`generates content for html field correctly`, () => {
  cy.request("/html-queried-like-feed-plugin.json").should(response => {
    expect(response.body.data.mdx.html).to.include(
      `<p>Just to test html field used usually for rss feed generation`
    )
  })
})
