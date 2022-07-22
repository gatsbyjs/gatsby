describe("rss feed", () => {
  it("Should load each url from the sitemap", done => {
    cy.request("/rss.xml").then(response => {
      const parser = new DOMParser()
      const res = parser.parseFromString(response.body, "application/xml")
      expect(res).to.be.instanceOf(XMLDocument)
      done()
    })
  })
})
