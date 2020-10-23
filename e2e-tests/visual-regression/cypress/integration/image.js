const testCases = [
  ["fixed image", "/images/fixed"],
  ["fixed image smaller than requested size", "/images/fixed-too-big"],
  ["fluid image", "/images/fluid"],
  ["constrained image", "/images/constrained"],
]

describe(`GatsbyImage`, () => {
  testCases.forEach(([title, path]) => {
    describe(title, () => {
      it(`renders correctly`, () => {
        cy.visit(path).waitForRouteChange()
        cy.get("#test-image").matchImageSnapshot()
      })
    })
  })
})
