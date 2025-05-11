Cypress.on("uncaught:exception", err => {
  if (
    (err.message.includes("Minified React error #418") ||
      err.message.includes("Minified React error #423") ||
      err.message.includes("Minified React error #425")) &&
    Cypress.env(`TEST_PLUGIN_OFFLINE`)
  ) {
    return false
  }
})

const PATH_PREFIX = Cypress.env(`PATH_PREFIX`) || ``

// there are multiple scenarios we want to test and ensure that custom image cdn url is used:
//  - child build process (SSG, Page Query)
//  - main build process (SSG, Page Context)
//  - query engine (SSR, Page Query)
const configs = [
  {
    title: `remote-file (SSG, Page Query)`,
    pagePath: `/routes/ssg/remote-file/`,
    placeholders: true,
  },
  {
    title: `remote-file (SSG, Page Context)`,
    pagePath: `/routes/ssg/remote-file-data-from-context/`,
    placeholders: true,
  },
  {
    title: `remote-file (SSR, Page Query)`,
    pagePath: `/routes/ssr/remote-file/`,
    placeholders: true,
  },
]

for (const config of configs) {
  describe(
    config.title,
    {
      retries: {
        runMode: 4,
      },
    },
    () => {
      beforeEach(() => {
        cy.visit(config.pagePath).waitForRouteChange()

        // trigger intersection observer
        cy.scrollTo("top")
        cy.wait(200)
        cy.scrollTo("bottom", {
          duration: 600,
        })
        cy.wait(600)
      })

      describe(`Image CDN`, () => {
        async function testImages(images, expectations) {
          for (let i = 0; i < images.length; i++) {
            const expectation = expectations[i]

            const url = images[i].currentSrc

            const { href, origin } = new URL(url)
            const urlWithoutOrigin = href.replace(origin, ``)

            // using Netlify Image CDN
            expect(urlWithoutOrigin).to.match(/^\/.netlify\/images/)

            const res = await fetch(url, {
              method: "HEAD",
            })
            expect(res.ok).to.be.true

            const expectedNaturalWidth =
              expectation.naturalWidth ?? expectation.width
            const expectedNaturalHeight =
              expectation.naturalHeight ?? expectation.height

            if (expectation.width) {
              expect(
                Math.ceil(images[i].getBoundingClientRect().width)
              ).to.be.equal(expectation.width)
            }
            if (expectation.height) {
              expect(
                Math.ceil(images[i].getBoundingClientRect().height)
              ).to.be.equal(expectation.height)
            }
            if (expectedNaturalWidth) {
              expect(Math.ceil(images[i].naturalWidth)).to.be.closeTo(
                expectedNaturalWidth,
                1
              )
            }
            if (expectedNaturalHeight) {
              expect(Math.ceil(images[i].naturalHeight)).to.be.closeTo(
                expectedNaturalHeight,
                1
              )
            }
          }
        }

        it(`should render correct dimensions`, () => {
          cy.get('[data-testid="image-public"]').then(async $urls => {
            const urls = Array.from(
              $urls.map((_, $url) => $url.getAttribute("href"))
            )

            // urls is array of href attribute, not absolute urls, so it already is stripped of origin
            for (const urlWithoutOrigin of urls) {
              // using Netlify Image CDN
              expect(urlWithoutOrigin).to.match(/^\/.netlify\/images/)
              const res = await fetch(urlWithoutOrigin, {
                method: "HEAD",
              })
              expect(res.ok).to.be.true
            }
          })

          cy.get(".resize").then({ timeout: 60000 }, async $imgs => {
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

          cy.get(".fixed img:not([aria-hidden=true])").then(
            { timeout: 60000 },
            async $imgs => {
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
            }
          )

          cy.get(".constrained img:not([aria-hidden=true])").then(
            { timeout: 60000 },
            async $imgs => {
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
            }
          )

          cy.get(".full img:not([aria-hidden=true])").then(
            { timeout: 60000 },
            async $imgs => {
              await testImages(Array.from($imgs), [
                {
                  naturalHeight: 1333,
                },
                {
                  naturalHeight: 1603,
                },
                {
                  naturalHeight: 666,
                },
              ])
            }
          )
        })

        it(`should render a placeholder`, () => {
          if (config.placeholders) {
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
                // traced falls back to DOMINANT_COLOR
                expect($el.prop("tagName")).to.be.equal("DIV")
                expect($el).to.be.empty
              })
          }
          cy.get(".full [data-placeholder-image]")
            .first()
            .should($el => {
              expect($el.prop("tagName")).to.be.equal("DIV")
              expect($el).to.be.empty
            })
        })
      })

      it(`File CDN`, () => {
        cy.get('[data-testid="file-public"]').then(async $urls => {
          const fileCdnFixtures = Array.from(
            $urls.map((_, $url) => {
              return {
                urlWithoutOrigin: $url.getAttribute("href"),
                allowed: $url.getAttribute("data-allowed") === "true",
              }
            })
          )

          // urls is array of href attribute, not absolute urls, so it already is stripped of origin
          for (const { urlWithoutOrigin, allowed } of fileCdnFixtures) {
            // using Netlify Image CDN
            expect(urlWithoutOrigin).to.match(
              new RegExp(`^${PATH_PREFIX}/_gatsby/file`)
            )
            const res = await fetch(urlWithoutOrigin, {
              method: "HEAD",
            })
            if (allowed) {
              expect(res.ok).to.be.true
            } else {
              expect(res.ok).to.be.false
              expect(res.status).to.be.equal(500)
            }
          }
        })
      })
    }
  )
}
