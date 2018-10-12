import { navigate } from "gatsby-link"
import catchLinks from "gatsby-plugin-catch-links/catch-links"

// again

const pathPrefix = `/anything`

const getNavigate = () => {
  global.___navigate = jest.fn()
  return navigate
}

beforeAll(() => {
  // Set the base URL we will be testing against to http://localhost:8000/pathPrefix
  window.history.pushState({}, `APP Url`, `${pathPrefix}`)
})

afterAll(() => {
  // Set history back to http://localhost:8000
  window.history.back()
})

describe(`gatsby-plugin-catch-links works with gatsby-link if`, () => {
  describe(`navigate href matches catched anchor href`, () => {

    // We're going to manually set up the event listener here
    let hrefHandler
    let eventDestroyer

    beforeAll(() => {
      hrefHandler = jest.fn()
      eventDestroyer = catchLinks(window, hrefHandler)
    })

    afterAll(() => {
      global.__PATH_PREFIX__ = ``
      eventDestroyer()
    })

    it(`with pathPrefix set`, done => {
      global.__PATH_PREFIX__ = pathPrefix
      const anchor = document.createElement(`a`)
      anchor.setAttribute(
        `href`,
        `${window.location.href}/path`
      )
      document.body.appendChild(anchor)

      // create the click event we'll be using for testing
      const clickEvent = new MouseEvent(`click`, {
        bubbles: true,
        cancelable: true,
        view: window,
      })

      hrefHandler.mockImplementation((path) => {
        getNavigate()(path)
        expect(global.___navigate).toHaveBeenCalledWith(
          `${pathPrefix}/path`,
          undefined
        )

        anchor.remove()

        done()
      })

      anchor.dispatchEvent(clickEvent)
    })

    test(`with pathPrefix unset`, done => {
      global.__PATH_PREFIX__ = ``
      const anchor = document.createElement(`a`)
      anchor.setAttribute(
        `href`,
        `${window.location.href}/path`
      )
      document.body.appendChild(anchor)

      // create the click event we'll be using for testing
      const clickEvent = new MouseEvent(`click`, {
        bubbles: true,
        cancelable: true,
        view: window,
      })

      hrefHandler.mockImplementation((path) => {
        getNavigate()(path)
        expect(global.___navigate).toHaveBeenCalledWith(
          `${pathPrefix}/path`,
          undefined
        )

        anchor.remove()

        done()
      })

      anchor.dispatchEvent(clickEvent)
    })

  })
})
