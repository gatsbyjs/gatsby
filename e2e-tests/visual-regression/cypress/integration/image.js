const testCases = [
  ["fixed image", "/images/fixed"],
  ["fixed image smaller than requested size", "/images/fixed-too-big"],
  ["fluid image", "/images/fluid"],
  ["constrained image", "/images/constrained"],
]

const sizes = ["iphone-6", "ipad-2", "macbook-13"]

describe(`GatsbyImage`, () => {
  sizes.forEach(size => {
    testCases.forEach(([title, path]) => {
      describe(`${title}`, () => {
        it(`renders correctly on ${size}`, () => {
          cy.viewport(size)
          cy.visit(path)
          // Wait for main image to load
          cy.get("[data-main-image]").should("have.css", "opacity", "1")
          // Wait for blur-up
          cy.wait(1000)
          cy.get("#test-image").matchImageSnapshot()
        })
      })
    })
  })
})
