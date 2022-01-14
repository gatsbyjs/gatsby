const TEMPLATE = `SUB_TITLE`
const TEST_ID = `sub-title`
const message = `This is a sub-title`

describe(`hot reloading non-js file`, () => {
  describe(`markdown`, () => {
    beforeEach(() => {
      cy.exec(
        `npm run update -- --file content/2018-12-14-hello-world.md --replacements "${message}:%${TEMPLATE}%" --exact`
      )
      cy.wait(1000)
  
      cy.visit(`/2018-12-14-hello-world/`).waitForRouteChange()
  
      cy.wait(1000)
    })
  
    it(`displays placeholder content on launch`, () => {
      cy.getTestElement(TEST_ID).invoke(`text`).should(`contain`, TEMPLATE)
    })
  
    it(`hot reloads with new content`, () => {
      cy.getTestElement(TEST_ID).invoke(`text`).should(`contain`, TEMPLATE)
  
      cy.exec(
        `npm run update -- --file content/2018-12-14-hello-world.md --replacements "${TEMPLATE}:${message}"`
      )
  
      // wait for socket.io to update
      cy.wait(5000)
  
      cy.getTestElement(TEST_ID).invoke(`text`).should(`eq`, message)
    })
  })

  describe.only(`image`, () => {
    beforeEach(() => {
      cy.exec(
        `npm run update -- --file src/images/image.png --copy "src/images/original.png"`
      )
      cy.wait(1000)
  
      cy.visit(`/md-image/`).waitForRouteChange()
      cy.wait(1000)
    })

    const getDomImage = () => {
      return cy.wrap(cy.get(`.gatsby-resp-image-wrapper`).find(`img`)[0])
    }

    it(`displays original content on launch`, () => {
      getDomImage().matchImageSnapshot(`non-js-file--image-original`)
    })

    // This test currently has a snapshot of the "original" image, since gatsby-remark-images hasn't
    // been updated in development-runtime to include the hot reloading fix for images.
    // TODO: update gatsby-remark-images and update the snapshot for this test
    it(`hot reloads with new content`, () => {
      cy.exec(
        `npm run update -- --file src/images/image.png --copy "src/images/new.png"`
      )

      // wait for socket.io to update
      cy.wait(5000)

      getDomImage().matchImageSnapshot(`non-js-file--image-new`)
    })
  })
})
