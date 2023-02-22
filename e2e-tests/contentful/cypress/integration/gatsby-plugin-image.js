const testConfig = {
  retries: {
    runMode: 2,
    openMode: 0,
  },
}

function hasSVGPlaceholder(el) {
  el.find(`img`)
    .should(`have.attr`, `src`)
    .and(src => {
      expect(src).to.match(/^data:image\/svg\+xml/)
    })
}

function hasBase64Placeholder(el) {
  el.children(`img`)
    .should(`have.attr`, `src`)
    .and(src => {
      expect(src).to.match(/^data:image\/[a-z]+;base64/)
    })
}

function hasNoPlaceholder(el) {
  el.children(`div[data-placeholder-image]`).should($div => {
    const style = window.getComputedStyle($div[0])
    expect(style.backgroundColor).to.equal("rgba(0, 0, 0, 0)")
  })
}

function hasColorPlaceholder(el) {
  el.children(`div[data-placeholder-image]`).should($div => {
    const style = window.getComputedStyle($div[0])
    expect(style.backgroundColor).not.to.equal("rgba(0, 0, 0, 0)")
  })
}

function testGatsbyPluginImage(type, testPlaceholder) {
  if (testPlaceholder) {
    cy.get(`[data-cy="${type}"]`)
      .find(".gatsby-image-wrapper")
      .each($el => {
        const el = cy.wrap($el)
        testPlaceholder(el)
      })
  }

  cy.get(`[data-cy="${type}"]`).scrollIntoView({ duration: 500 })

  // Wait images for load
  cy.wait(1000)

  cy.get(`[data-cy="${type}"]`)
    .find(".gatsby-image-wrapper > picture > img")
    .each(($el, i) => {
      cy.wrap($el).should("be.visible")
      cy.wrap($el).should("have.attr", "srcset")
      cy.wrap($el).should("have.attr", "src")
      cy.wrap($el).matchImageSnapshot(`${type}-${i}`)
    })
}

describe(`gatsby-plugin-image`, () => {
  beforeEach(() => {
    cy.visit("/gatsby-plugin-image").waitForRouteChange()
  })

  it(`constrained`, testConfig, () =>
    testGatsbyPluginImage(`constrained`, hasNoPlaceholder)
  )
  it(`full-width`, testConfig, () =>
    testGatsbyPluginImage(`full-width`, hasNoPlaceholder)
  )
  it(`fixed`, testConfig, () =>
    testGatsbyPluginImage(`fixed`, hasNoPlaceholder)
  )
  it(`dominant-color`, testConfig, () =>
    testGatsbyPluginImage(`dominant-color`, hasColorPlaceholder)
  )
  it(`traced`, testConfig, () =>
    testGatsbyPluginImage(`traced`, hasColorPlaceholder)
  )
  it(`blurred`, testConfig, () =>
    testGatsbyPluginImage(`blurred`, hasBase64Placeholder)
  )
  it(`Custom Image Formats`, testConfig, () => {
    cy.get(`[data-cy="customImageFormats"] picture source[type="image/webp"]`)
      .invoke(`attr`, `srcset`)
      .should("contain", "fm=webp")
    cy.get(`[data-cy="customImageFormats"] picture source[type="image/avif"]`)
      .invoke(`attr`, `srcset`)
      .should("contain", "fm=avif")
    cy.get(`[data-cy="customImageFormats"] picture img`)
      .invoke(`attr`, `srcset`)
      .should("not.contain", "fm=webp")
      .should("not.contain", "fm=avif")
  })
  it(`sqip`, testConfig, () => testGatsbyPluginImage(`sqip`, hasSVGPlaceholder))

  it(`english`, testConfig, () => {
    testGatsbyPluginImage(`english`, hasNoPlaceholder)
    cy.get(`[data-cy="english"] p strong`).should(
      "have.text",
      "Locale - American English (png)"
    )
  })
  it(`german`, testConfig, () => {
    testGatsbyPluginImage(`german`, hasNoPlaceholder)
    cy.get(`[data-cy="german"] p strong`).should(
      "have.text",
      "Locale - German (png)"
    )
  })
})
