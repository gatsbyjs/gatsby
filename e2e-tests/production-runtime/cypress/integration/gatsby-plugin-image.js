const MutationObserver =
  window.MutationObserver || window.WebKitMutationObserver

// helper function to observe DOM changes
function observeDOM(obj, options, callback) {
  if (!obj || obj.nodeType !== window.Node.ELEMENT_NODE) {
    throw new Error("can not observe this element")
  }

  const obs = new MutationObserver(callback)

  obs.observe(obj, { childList: true, subtree: true, ...options })

  return () => {
    obs.disconnect()
  }
}

Cypress.on('uncaught:exception', (err) => {
  if ((err.message.includes('Minified React error #418') || err.message.includes('Minified React error #423') || err.message.includes('Minified React error #425')) && Cypress.env(`TEST_PLUGIN_OFFLINE`)) {
    return false
  }
})

describe(
  `gatsby-plugin-image`,
  {
    retries: {
      runMode: 4,
    },
  },
  () => {
  it(`doesn't recycle image nodes when not necessary`, () => {
    const mutationStub = cy.stub()
    let cleanup

    cy.visit(`/gatsby-plugin-image-page-1/`)

    // wait for the image to load
    cy.get("[data-main-image]").should("be.visible")

    // start watching mutations in the image-wrapper
    cy.get("body").then($element => {
      cleanup = observeDOM($element[0], {}, mutations => {
        const normalizedMutations = []
        mutations.forEach(mutation => {
          if (
            mutation.type === "childList" &&
            mutation.target.classList.contains("gatsby-image-wrapper")
          ) {
            normalizedMutations.push({
              type: mutation.type,
              addedNodes: !!mutation.addedNodes.length,
              removedNodes: !!mutation.removedNodes.length,
            })
          }
        })

        if (normalizedMutations.length) {
          mutationStub(normalizedMutations)
        }
      })
    })

    cy.window()
      .then(win => win.___navigate(`/gatsby-plugin-image-page-2/`))
      .waitForRouteChange()

    // wait for the image to load
    cy.get("[data-main-image]").should("be.visible")
    cy.wait(500)

    cy.then(() => {
      cleanup()
      expect(mutationStub).to.be.calledWith([
        {
          type: "childList",
          addedNodes: true,
          removedNodes: false,
        },
      ])
    })
  })

  it(`rerenders when image src changed`, () => {
    const mutationStub = cy.stub()
    let cleanup

    cy.visit(`/gatsby-plugin-image-page-1/`)

    // wait for the image to load
    cy.get("[data-main-image]").should("be.visible")

    // start watching mutations in the image-wrapper
    cy.get("#image-wrapper").then($element => {
      cleanup = observeDOM($element[0], {}, mutations => {
        const normalizedMutations = []
        mutationStub(
          mutations.map(mutation => {
            normalizedMutations.push({
              addedNodes: mutation.addedNodes,
              removedNodes: mutation.removedNodes,
            })

            return {
              type: mutation.type,
              addedNodes: !!mutation.addedNodes.length,
              removedNodes: !!mutation.removedNodes.length,
            }
          })
        )

        Cypress.log({
          name: "MutationObserver",
          message: `${normalizedMutations.length} mutations`,
          consoleProps: () => {
            return {
              mutations: normalizedMutations,
            }
          },
        })
      })
    })

    cy.get("#click").click()

    cy.wait(500)

    cy.get("[data-main-image]", {
      timeout: 5000,
    }).should("be.visible")

    cy.then(() => {
      cleanup()
      expect(mutationStub).to.be.calledOnce
      expect(mutationStub).to.be.calledWith([
        {
          type: "childList",
          addedNodes: true,
          removedNodes: true,
        },
      ])
    })
  })

  it(`rerenders when background color changes`, () => {
    const mutationStub = cy.stub()
    let cleanup

    cy.visit(`/gatsby-plugin-image-page-2/`)

    // wait for the image to load
    cy.get("[data-main-image]").should("be.visible")

    // start watching mutations in the image-wrapper
    cy.get("#image-wrapper").then($element => {
      cleanup = observeDOM(
        $element[0],
        {
          attributes: true,
          attributeFilter: ["style"],
        },
        mutations => {
          mutationStub(
            mutations.map(mutation => ({
              type: mutation.type,
              attributeName: mutation.attributeName,
            }))
          )
        }
      )
    })

    cy.get("[data-gatsby-image-wrapper]").should(
      "have.css",
      "background-color",
      "rgb(102, 51, 153)"
    )

    cy.get("#click").click()

    cy.wait(500)

    // wait for the image to load
    cy.get("[data-main-image]").should("be.visible")

    cy.get("[data-gatsby-image-wrapper]").should(
      "have.css",
      "background-color",
      "rgb(255, 0, 0)"
    )
    cy.then(() => {
      cleanup()
      expect(mutationStub).to.be.calledOnce
      expect(mutationStub).to.be.calledWith([
        {
          type: "attributes",
          attributeName: "style",
        },
      ])
    })
  })
})
