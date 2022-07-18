describe(
  `remote-file`, 
  {
    retries: {
      runMode: 4,
    },
  },
  () => {
  beforeEach(() => {
    cy.visit(`/remote-file/`).waitForRouteChange()
    cy.wait(100)

    // trigger intersection observer
    cy.scrollTo("top")
    cy.wait(100)
    cy.scrollTo("bottom", {
      duration: 500,
    })
    cy.wait(500)
  })

  async function testImages(images, expectations) {
    for (let i = 0; i < images.length; i++) {
      const expectation = expectations[i]

      const res = await fetch(images[i].currentSrc, {
        method: "HEAD",
      })

      console.log("\n\n\n\n")
      const logObj = {}
      for (const [key, value] of Object.entries(images[i])) {
        logObj[key] = typeof value === "object" ? `[object keys=${Object.keys(value)}]` : value
      }

      console.log(JSON.stringify(logObj, null, 2))
      console.log(`testImages - ${images[i].currentSrc}: ${JSON.stringify(res, null, 2)}\n\n\n\n`)

      expect(res.ok).to.be.true
      if (expectation.width) {
        expect(Math.ceil(images[i].getBoundingClientRect().width)).to.be.equal(
          expectation.width
        )
      }
      if (expectation.height) {
        expect(Math.ceil(images[i].getBoundingClientRect().height)).to.be.equal(
          expectation.height
        )
      }
    }
  }

  it(`should render correct dimensions`, () => {
    cy.get('[data-testid="public"]').then(async $urls => {
      const urls = Array.from($urls.map((_, $url) => $url.getAttribute("href")))

      for (const url of urls) {
        const res = await fetch(url, {
          method: "HEAD",
        })
        
        console.log(`\n\nurls - ${url}: ${JSON.stringify(res, null, 2)}\n\n`)
  
        expect(res.ok).to.be.true
      }
    })

    cy.get(".resize").then(async $imgs => {
      await testImages(Array.from($imgs), [
        {
          width: 100,
          height: 133,
        },
        {
          width: 100,
          height: 160,
        },
        {
          width: 100,
          height: 67,
        },
      ])
    })

    cy.get(".fixed").then(async $imgs => {
      await testImages(Array.from($imgs), [
        {
          width: 100,
          height: 133,
        },
        {
          width: 100,
          height: 160,
        },
        {
          width: 100,
          height: 67,
        },
      ])
    })

    cy.get(".constrained").then(async $imgs => {
      await testImages(Array.from($imgs), [
        {
          width: 300,
          height: 400,
        },
        {
          width: 300,
          height: 481,
        },
        {
          width: 300,
          height: 200,
        },
      ])
    })

    cy.get(".full").then(async $imgs => {
      await testImages(Array.from($imgs), [
        {
          height: 1229,
        },
        {
          height: 1478,
        },
        {
          height: 614,
        },
      ])
    })
  })

  it(`should render a placeholder`, () => {
    cy.get(".fixed [data-placeholder-image]")
      .first()
      .should("have.css", "background-color", "rgb(232, 184, 8)")
    cy.get(".constrained [data-placeholder-image]")
      .first()
      .should($el => {
        expect($el.prop("tagName")).to.be.equal("IMG")
        expect($el.prop("src")).to.contain("data:image/jpg;base64")
      })
    cy.get(".constrained_traced [data-placeholder-image]")
      .first()
      .should($el => {
        expect($el.prop("tagName")).to.be.equal("IMG")
        expect($el.prop("src")).to.contain("data:image/svg+xml,%3csvg")
      })
    cy.get(".full [data-placeholder-image]")
      .first()
      .should($el => {
        expect($el.prop("tagName")).to.be.equal("DIV")
        expect($el).to.be.empty
      })
  })
})
