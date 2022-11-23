const testCases = [
  ["fixed image", "/images/fixed"],
  ["fixed image smaller than requested size", "/images/fixed-too-big"],
  ["fluid image", "/images/fullWidth"],
  ["constrained image", "/images/constrained"],
  ["avif format", "/images/avif"],
]
const staticImageTestCases = [
  ["fixed image", "/static-images/fixed"],
  ["fixed image smaller than requested size", "/static-images/fixed-too-big"],
  ["fluid image", "/static-images/fullWidth"],
  ["constrained image", "/static-images/constrained"],
  ["avif format", "/static-images/avif"],
]

const sizes = [["iphone-6"], ["ipad-2"], [1027, 768]]

describe(`GatsbyImage`, () => {
  sizes.forEach(size => {
    testCases.forEach(([title, path]) => {
      describe(`${title}`, () => {
        it(`renders correctly on ${size.join("x")}`, () => {
          cy.viewport(...size)
          cy.visit(path)
          // Wait for main image to load
          cy.get("[data-main-image]").should("exist")
          // Wait for blur-up
          cy.wait(1000)
          cy.get("#test-wrapper").matchImageSnapshot()
        })
      })
    })
  })
})

describe(`StaticImage`, () => {
  sizes.forEach(size => {
    staticImageTestCases.forEach(([title, path]) => {
      describe(`${title}`, () => {
        it(`renders correctly on ${size.join("x")}`, () => {
          cy.viewport(...size)
          cy.visit(path)
          // Wait for main image to load
          cy.get("[data-main-image]").should("exist")
          // Wait for blur-up
          cy.wait(1000)
          cy.get("#test-wrapper").matchImageSnapshot()
        })
      })
    })
    describe(`sharp props`, () => {
      it(`respects outputPixelDensities on ${size.join("x")}`, () => {
        cy.viewport(...size)
        cy.visit("/static-images/sharp-props")
        // Wait for main image to load
        cy.get("[data-main-image]").should("exist")
        // Check srcset for 1x, 2x, 3x
        cy.get("[data-main-image]").then(img => {
          expect(img[0].attributes.srcset.value).to.contain(`300w`)
          expect(img[0].attributes.srcset.value).to.contain(`600w`)
          expect(img[0].attributes.srcset.value).to.contain(`900w`)
        })
      })
    })
  })
})
