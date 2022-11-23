import { script } from "../../../gatsby-script-scripts"
import { resourceRecord } from "../../../gatsby-script-records"

const page = {
  target: `/gatsby-script-scripts-with-sources/`,
  navigation: `/gatsby-script-navigation/`,
}

describe(`scripts with sources`, () => {
  describe(`using the post-hydrate strategy`, () => {
    it(`should load successfully`, () => {
      cy.visit(page.target).waitForRouteChange()
      cy.getRecord(script.three, `success`, true).should(`equal`, `true`)
    })

    it(`should load after the framework bundle has loaded`, () => {
      cy.visit(page.target).waitForRouteChange()

      // Assert framework is loaded before three starts loading
      cy.getRecord(script.three, resourceRecord.fetchStart).then(
        threeFetchStart => {
          cy.getRecord(`framework`, resourceRecord.responseEnd).should(
            `be.lessThan`,
            threeFetchStart
          )
        }
      )
    })

    it(`should call an on load callback once the script has loaded`, () => {
      cy.visit(page.target).waitForRouteChange()
      cy.getRecord(script.three, resourceRecord.responseEnd).then(() => {
        cy.get(`[data-on-load-result=post-hydrate]`)
      })
    })

    it(`should call an on error callback if an error occurred`, () => {
      cy.visit(page.target).waitForRouteChange()
      cy.get(`[data-on-error-result=post-hydrate]`)
    })
  })

  describe(`using the idle strategy`, () => {
    it(`should load successfully`, () => {
      cy.visit(page.target).waitForRouteChange()
      cy.getRecord(script.marked, `success`, true).should(`equal`, `true`)
    })

    it(`should load after other strategies`, () => {
      cy.visit(page.target).waitForRouteChange()

      cy.getRecord(script.marked, resourceRecord.fetchStart).then(
        markedFetchStart => {
          cy.getRecord(script.three, resourceRecord.fetchStart).should(
            `be.lessThan`,
            markedFetchStart
          )
        }
      )
    })

    it(`should call an on load callback once the script has loaded`, () => {
      cy.visit(page.target).waitForRouteChange()
      cy.getRecord(script.marked, resourceRecord.responseEnd).then(() => {
        cy.get(`[data-on-load-result=idle]`)
      })
    })

    it(`should call an on error callback if an error occurred`, () => {
      cy.visit(page.target).waitForRouteChange()
      cy.get(`[data-on-error-result=idle]`)
    })
  })

  describe(`when navigation occurs`, () => {
    it(`should load only once on initial page load`, () => {
      cy.visit(page.target).waitForRouteChange()

      cy.get(`table[id=script-resource-records] tbody`)
        .children()
        .should(`have.length`, 5)
      cy.getRecord(script.three, `strategy`, true).should(
        `equal`,
        `post-hydrate`
      )
      cy.getRecord(script.marked, `strategy`, true).should(`equal`, `idle`)
    })

    it(`should load only once after the page is refreshed`, () => {
      cy.visit(page.target).waitForRouteChange()
      cy.reload()

      cy.get(`table[id=script-resource-records] tbody`)
        .children()
        .should(`have.length`, 5)
      cy.getRecord(script.three, `strategy`, true).should(
        `equal`,
        `post-hydrate`
      )
      cy.getRecord(script.marked, `strategy`, true).should(`equal`, `idle`)
    })

    it(`should load only once after anchor link navigation`, () => {
      cy.visit(page.target).waitForRouteChange()
      cy.get(`a[id=anchor-link-back-to-index]`).click()
      cy.url().should(`contain`, page.navigation)
      cy.get(`a[href="${page.target}"][id=anchor-link]`).click()

      cy.get(`table[id=script-resource-records] tbody`)
        .children()
        .should(`have.length`, 5)
      cy.getRecord(script.three, `strategy`, true).should(
        `equal`,
        `post-hydrate`
      )
      cy.getRecord(script.marked, `strategy`, true).should(`equal`, `idle`)
    })

    it(`should load only once if the page is revisited via browser back/forward buttons after anchor link navigation`, () => {
      cy.visit(page.navigation).waitForRouteChange()
      cy.get(`a[href="${page.target}"][id=anchor-link]`).click()
      cy.go(`back`).waitForRouteChange()
      cy.go(`forward`).waitForRouteChange()

      cy.get(`table[id=script-resource-records] tbody`)
        .children()
        .should(`have.length`, 5)
      cy.getRecord(script.three, `strategy`, true).should(
        `equal`,
        `post-hydrate`
      )
      cy.getRecord(script.marked, `strategy`, true).should(`equal`, `idle`)
    })

    it(`should load only once after Gatsby link navigation`, () => {
      cy.visit(page.target).waitForRouteChange()
      cy.get(`a[id=gatsby-link-back-to-index]`).click()
      cy.get(`a[href="${page.target}"][id=gatsby-link]`).click()

      cy.get(`table[id=script-resource-records] tbody`)
        .children()
        .should(`have.length`, 5)
      cy.getRecord(script.three, `strategy`, true).should(
        `equal`,
        `post-hydrate`
      )
      cy.getRecord(script.marked, `strategy`, true).should(`equal`, `idle`)
    })

    it(`should load only once if the page is revisited via browser back/forward buttons after Gatsby link navigation`, () => {
      cy.visit(page.navigation).waitForRouteChange()
      cy.get(`a[href="${page.target}"][id=gatsby-link]`).click()
      cy.go(`back`).waitForRouteChange()
      cy.go(`forward`).waitForRouteChange()

      cy.get(`table[id=script-resource-records] tbody`)
        .children()
        .should(`have.length`, 5)
      cy.getRecord(script.three, `strategy`, true).should(
        `equal`,
        `post-hydrate`
      )
      cy.getRecord(script.marked, `strategy`, true).should(`equal`, `idle`)
    })
  })
})
