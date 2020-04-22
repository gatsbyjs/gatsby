/* global cy */

const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

const createMockCompilationHash = () =>
  [...Array(20)]
    .map(a => getRandomInt(0, 16))
    .map(k => k.toString(16))
    .join(``)

describe(`Webpack Compilation Hash tests`, () => {
  it(`should render properly`, () => {
    cy.visit(`/`).waitForRouteChange()
  })

  // This covers the case where a user loads a gatsby site and then
  // the site is changed resulting in a webpack recompile and a
  // redeploy. This could result in a mismatch between the page-data
  // and the component. To protect against this, when gatsby loads a
  // new page-data.json, it refreshes the page if it's webpack
  // compilation hash differs from the one on on the window object
  // (which was set on initial page load)
  //
  // Since initial page load results in all links being prefetched, we
  // have to navigate to a non-prefetched page to test this. Thus the
  // `deep-link-page`.
  //
  // We simulate a rebuild by updating all page-data.jsons and page
  // htmls with the new hash. It's not pretty, but it's easier than
  // figuring out how to perform an actual rebuild while cypress is
  // running. See ../plugins/compilation-hash.js for the
  // implementation
  it.skip(`should reload page if build occurs in background`, () => {
    cy.window().then(window => {
      const oldHash = window.___webpackCompilationHash
      expect(oldHash).to.not.eq(undefined)

      const mockHash = createMockCompilationHash()

      // Simulate a new webpack build
      cy.task(`overwriteWebpackCompilationHash`, mockHash).then(() => {
        cy.getTestElement(`compilation-hash`).click()
        cy.waitForRouteChange()

        // Navigate into a non-prefetched page
        cy.getTestElement(`deep-link-page`).click()
        cy.waitForRouteChange()

        // If the window compilation hash has changed, we know the
        // page was refreshed
        cy.window().its(`___webpackCompilationHash`).should(`equal`, mockHash)
      })

      // Cleanup
      cy.task(`overwriteWebpackCompilationHash`, oldHash)
    })
  })
})
