/* global cy */

describe(`Preload`, () => {
  it(`preloads on first visit`, () => {
    cy.visit(`/`).waitForRouteChange()

    // module preloads should only contain mjs
    cy.get(`link[rel="modulepreload"]`).each($el => {
      expect($el.attr(`href`).endsWith(`.mjs`)).to.be.true
    })

    // No regular script preloads should be here
    cy.get(`link[rel="preload"][as="script"]`).should($preloads => {
      expect($preloads).to.have.length(0)
    })

    // prefetch of page 2 should still happen and should be an mjs
    cy.get(
      `link[rel="prefetch"][href^="/component---src-pages-page-2-js"][href$=".mjs"]`
    ).should(`exist`)
  })

  it(`Initiate script tags on hoverng Gatsby Link Tags`, () => {
    cy.get(`a[href="/page-2"`).trigger(`mouseover`)
    cy.get(
      `script[src^="/component---src-pages-page-2-js"][src$=".mjs"]`
    ).should(`exist`)
  })
})

describe(`Runtime`, () => {
  it(`should only load modern scripts`, () => {
    cy.window().then(win => {
      const scripts = Object.values(win.___chunkMapping).flat()
      expect(scripts.filter(path => path.endsWith(`.mjs`)).length).to.equal(
        scripts.length
      )
    })

    cy.get(`script[src]`).each($el => {
      expect($el.attr(`src`).endsWith(`.mjs`)).to.be.true
    })
  })
})
