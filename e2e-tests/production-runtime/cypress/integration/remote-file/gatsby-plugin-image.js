before(() => {
  cy.exec(`npm run reset`)
})

after(() => {
  cy.exec(`npm run reset`)
})

describe(`remote-file`, () => {
  it(`should render correct dimensions`, () => {
    cy.visit(`/remote-file/`).waitForRouteChange()

    cy.get('[data-testid="public"]').then($urls => {
      const urls = Array.from($urls.map((_, $url) => $url.getAttribute("href")))

      expect(urls[0].endsWith(".jpg")).to.be.true
      expect(urls[1].endsWith(".jpg")).to.be.true
      expect(urls[2].endsWith(".jpg")).to.be.true
    })

    cy.get(".resize").then($imgs => {
      const imgDimensions = $imgs.map((_, $img) => $img.getBoundingClientRect())

      expect(imgDimensions[0].width).to.be.equal(100)
      expect(imgDimensions[0].height).to.be.equal(133)
      expect(imgDimensions[1].width).to.be.equal(100)
      expect(imgDimensions[1].height).to.be.equal(160)
      expect(imgDimensions[2].width).to.be.equal(100)
      expect(imgDimensions[2].height).to.be.equal(67)
    })

    cy.get(".fixed").then($imgs => {
      const imgDimensions = $imgs.map((_, $img) => $img.getBoundingClientRect())

      expect(imgDimensions[0].width).to.be.equal(100)
      expect(imgDimensions[0].height).to.be.equal(133)
      expect(imgDimensions[1].width).to.be.equal(100)
      expect(imgDimensions[1].height).to.be.equal(160)
      expect(imgDimensions[2].width).to.be.equal(100)
      expect(imgDimensions[2].height).to.be.equal(67)
    })

    cy.get(".constrained").then($imgs => {
      const imgDimensions = $imgs.map((_, $img) => $img.getBoundingClientRect())

      expect(imgDimensions[0].width).to.be.equal(300)
      expect(imgDimensions[0].height).to.be.equal(400)
      expect(imgDimensions[1].width).to.be.equal(300)
      expect(imgDimensions[1].height).to.be.equal(481)
      expect(imgDimensions[2].width).to.be.equal(300)
      expect(imgDimensions[2].height).to.be.equal(200)
    })

    cy.get(".full").then($imgs => {
      const parentWidth = $imgs[0].parentElement.getBoundingClientRect().width
      const imgDimensions = $imgs.map((_, $img) => $img.getBoundingClientRect())

      expect(imgDimensions[0].width).to.be.equal(parentWidth)
      expect(Math.ceil(imgDimensions[0].height)).to.be.equal(1229)
      expect(imgDimensions[1].width).to.be.equal(parentWidth)
      expect(Math.ceil(imgDimensions[1].height)).to.be.equal(1478)
      expect(imgDimensions[2].width).to.be.equal(parentWidth)
      expect(Math.ceil(imgDimensions[2].height)).to.be.equal(614)
    })
  })

  it(`should render a placeholder`, () => {
    cy.visit(`/remote-file/`).waitForRouteChange()

    cy.get(".fixed [data-placeholder-image]")
      .first()
      .should("have.css", "background-color", "rgb(232, 184, 8)")
    cy.get(".constrained [data-placeholder-image]")
      .first()
      .should("have.prop", "tagName", "IMG")
    cy.get(".constrained [data-placeholder-image]")
      .first()
      .should("contain.prop", "src", "data:image/jpg;base64")
    cy.get(".full [data-placeholder-image]").first().should("be.empty")
  })
})
