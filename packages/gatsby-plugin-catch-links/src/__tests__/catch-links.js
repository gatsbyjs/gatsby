/**
 * @jest-environment jsdom
 */

const pathPrefix = `/blog`

import { navigate } from "gatsby"
import * as catchLinks from "../catch-links"

beforeAll(() => {
  global.__BASE_PATH__ = ``
  // Set the base URL we will be testing against to http://localhost:8000/blog
  window.history.pushState({}, `APP Url`, `${pathPrefix}`)
})

afterAll(() => {
  // Set history back to http://localhost:8000
  window.history.back()
})

describe(`catchLinks`, () => {
  let mockedAEH
  let handler

  beforeAll(() => {
    mockedAEH = jest.spyOn(window, `addEventListener`)
    mockedAEH.mockImplementation((_, eventHandler) => (handler = eventHandler))
  })

  afterAll(() => {
    mockedAEH.mockRestore()
  })

  let eventDestroyer

  beforeAll(() => {
    eventDestroyer = catchLinks.default(window, href => {})
  })

  afterAll(() => {
    eventDestroyer()
  })

  it(`creates a click event`, () => {
    expect(mockedAEH).toHaveBeenCalledWith(`click`, expect.any(Function))
  })
  it(`uses an instance of the handler returned by routeThroughBrowserOrApp`, () => {
    expect(handler.toString()).toEqual(
      catchLinks.routeThroughBrowserOrApp(jest.fn()).toString()
    )
  })
})

// https://github.com/facebook/jest/issues/936#issuecomment-214939935
describe(`the click event`, () => {
  it.skip(`checks if the user might be forcing navigation`, () => {})
  it.skip(`checks if we clicked on an anchor`, () => {})
  it.skip(`checks if the document author might be forcing navigation`, () => {})
  it.skip(`checks if the destination/origin URLs have matching origins`, () => {})
  it.skip(`checks if the destination/origin URLs have matching top level paths`, () => {})
  it.skip(`checks if the destination URL wants to scroll the page with a hash anchor`, () => {})
  it.skip(`handles pathPrefix if necessary`, () => {})
  it.skip(`routes the destination href through gatsby`, () => {})
})

describe(`a user may be forcing navigation if`, () => {
  // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button#Return_value
  describe(`the "main" button was not clicked`, () => {
    test(`"auxiliary" button`, () => {
      const event = { button: 1 }

      expect(catchLinks.userIsForcingNavigation(event)).toBe(true)
    })
    test(`"secondary" button`, () => {
      const event = { button: 2 }

      expect(catchLinks.userIsForcingNavigation(event)).toBe(true)
    })
    test(`"fourth" button`, () => {
      const event = { button: 3 }

      expect(catchLinks.userIsForcingNavigation(event)).toBe(true)
    })
    test(`"fifth" button`, () => {
      const event = { button: 4 }

      expect(catchLinks.userIsForcingNavigation(event)).toBe(true)
    })
  })
  describe(`the user is holding down a modifier key`, () => {
    test(`alt key`, () => {
      const event = { altKey: true }

      expect(catchLinks.userIsForcingNavigation(event)).toBe(true)
    })
    test(`control key`, () => {
      const event = { ctrlKey: true }

      expect(catchLinks.userIsForcingNavigation(event)).toBe(true)
    })
    test(`meta key`, () => {
      const event = { metaKey: true }

      expect(catchLinks.userIsForcingNavigation(event)).toBe(true)
    })
    test(`shift key`, () => {
      const event = { shiftKey: true }

      expect(catchLinks.userIsForcingNavigation(event)).toBe(true)
    })
  })
  test(`the default behavior was prevented elsewhere`, () => {
    const event = { defaultPrevented: true }

    expect(catchLinks.navigationWasHandledElsewhere(event)).toBe(true)
  })
})

describe(`the clicked element`, () => {
  it(`must be an anchor tag`, done => {
    const testAnchor = document.createElement(`a`)
    document.body.appendChild(testAnchor)

    // create the click event we'll be using for testing
    const clickEvent = new MouseEvent(`click`, {
      bubbles: true,
      cancelable: true,
      view: window,
    })

    const handler = event => {
      expect(catchLinks.findClosestAnchor(event.target)).toBe(testAnchor)

      testAnchor.remove()
      window.removeEventListener(`click`, handler)

      done()
    }
    window.addEventListener(`click`, handler)

    testAnchor.dispatchEvent(clickEvent)
  })
  it(`could be inside of an anchor`, done => {
    const testAnchor = document.createElement(`a`)
    const clickTarget = document.createElement(`span`)

    testAnchor.appendChild(clickTarget)
    document.body.appendChild(testAnchor)

    // create the click event we'll be using for testing
    const clickEvent = new MouseEvent(`click`, {
      bubbles: true,
      cancelable: true,
      view: window,
    })

    const handler = event => {
      expect(catchLinks.findClosestAnchor(event.target)).toBe(testAnchor)

      testAnchor.remove()
      window.removeEventListener(`click`, handler)

      done()
    }
    window.addEventListener(`click`, handler)

    clickTarget.dispatchEvent(clickEvent)
  })
})

describe(`the author might be forcing navigation`, () => {
  test(`if the clicked anchor is a download link`, () => {
    const testAnchor = document.createElement(`a`)
    testAnchor.setAttribute(`download`, ``)

    expect(catchLinks.authorIsForcingNavigation(testAnchor)).toBe(true)
  })
  describe(`if the clicked anchor does not target _self`, () => {
    let separateBrowsingContext

    beforeAll(() => {
      separateBrowsingContext = document.body.appendChild(
        document.createElement(`iframe`)
      )
    })
    afterAll(() => {
      separateBrowsingContext.remove()
    })

    test(`target=_blank`, () => {
      const testAnchor = document.createElement(`a`)
      testAnchor.setAttribute(`target`, `_blank`)

      expect(catchLinks.authorIsForcingNavigation(testAnchor)).toBe(true)
    })
    test(`target=_parent`, () => {
      const testAnchor =
        separateBrowsingContext.contentDocument.createElement(`a`)
      testAnchor.setAttribute(`target`, `_parent`)

      expect(catchLinks.authorIsForcingNavigation(testAnchor)).toBe(true)
    })
    test(`target=_top`, () => {
      const testAnchor =
        separateBrowsingContext.contentDocument.createElement(`a`)
      testAnchor.setAttribute(`target`, `_top`)

      expect(catchLinks.authorIsForcingNavigation(testAnchor)).toBe(true)
    })
  })
})

describe(`anchor target attribute looks like _self if`, () => {
  let separateBrowsingContext

  beforeAll(() => {
    separateBrowsingContext = document.body.appendChild(
      document.createElement(`iframe`)
    )
  })
  afterAll(() => {
    separateBrowsingContext.remove()
  })

  it(`is not set`, () => {
    const testAnchor = document.createElement(`a`)

    expect(catchLinks.anchorsTargetIsEquivalentToSelf(testAnchor)).toBe(true)
  })
  it(`is set to _self`, () => {
    const testAnchor = document.createElement(`a`)
    testAnchor.setAttribute(`target`, `_self`)

    expect(catchLinks.anchorsTargetIsEquivalentToSelf(testAnchor)).toBe(true)
  })
  it(`is set to _parent, but window = window.parent`, () => {
    const testAnchor =
      separateBrowsingContext.contentDocument.createElement(`a`)
    testAnchor.setAttribute(`target`, `_parent`)

    document.body.appendChild(testAnchor)

    expect(catchLinks.anchorsTargetIsEquivalentToSelf(testAnchor)).toBe(true)

    testAnchor.remove()
  })
  it(`is set to _top, but window = window.top`, () => {
    const testAnchor =
      separateBrowsingContext.contentDocument.createElement(`a`)
    testAnchor.setAttribute(`target`, `_top`)

    document.body.appendChild(testAnchor)

    expect(catchLinks.anchorsTargetIsEquivalentToSelf(testAnchor)).toBe(true)

    testAnchor.remove()
  })
})

describe(`navigation is routed through Gatsby if the destination href`, () => {
  // We're going to manually set up the event listener here
  let hrefHandler
  let eventDestroyer

  beforeAll(() => {
    hrefHandler = jest.fn()
    eventDestroyer = catchLinks.default(window, {}, hrefHandler)
  })

  afterAll(() => {
    eventDestroyer()
  })

  it(`shares the same origin and top path`, done => {
    const sameOriginAndTopPath = document.createElement(`a`)
    sameOriginAndTopPath.setAttribute(
      `href`,
      `${window.location.href}/someSubPath`
    )
    document.body.appendChild(sameOriginAndTopPath)

    // create the click event we'll be using for testing
    const clickEvent = new MouseEvent(`click`, {
      bubbles: true,
      cancelable: true,
      view: window,
    })

    window.addEventListener(`click`, function onClick() {
      window.removeEventListener(`click`, onClick)
      expect(hrefHandler).toHaveBeenCalledWith(
        `${sameOriginAndTopPath.pathname}`
      )

      sameOriginAndTopPath.remove()

      done()
    })

    sameOriginAndTopPath.dispatchEvent(clickEvent)
  })
  it(`is not a hash anchor for the current page`, done => {
    const withAnchor = document.createElement(`a`)
    withAnchor.setAttribute(
      `href`,
      `${window.location.href}/someSubPath#inside`
    )
    document.body.appendChild(withAnchor)

    // create the click event we'll be using for testing
    const clickEvent = new MouseEvent(`click`, {
      bubbles: true,
      cancelable: true,
      view: window,
    })

    window.addEventListener(`click`, function onClick() {
      window.removeEventListener(`click`, onClick)
      expect(hrefHandler).toHaveBeenCalledWith(
        `${withAnchor.pathname}${withAnchor.hash}`
      )

      withAnchor.remove()

      done()
    })

    withAnchor.dispatchEvent(clickEvent)
  })
  it(`has a URL "search" portion`, done => {
    const withSearch = document.createElement(`a`)
    withSearch.setAttribute(
      `href`,
      `${window.location.href}${pathPrefix}/subPath?q=find+me#inside`
    )
    document.body.appendChild(withSearch)

    // create the click event we'll be using for testing
    const clickEvent = new MouseEvent(`click`, {
      bubbles: true,
      cancelable: true,
      view: window,
    })

    window.addEventListener(`click`, function onClick() {
      window.removeEventListener(`click`, onClick)
      expect(hrefHandler).toHaveBeenCalledWith(
        `${withSearch.pathname}${withSearch.search}${withSearch.hash}`
      )

      withSearch.remove()

      done()
    })

    withSearch.dispatchEvent(clickEvent)
  })
})

describe(`navigation is routed through browser if resources have failed and the destination href`, () => {
  // We're going to manually set up the event listener here
  let hrefHandler
  let eventDestroyer

  beforeAll(() => {
    hrefHandler = jest.fn()
    eventDestroyer = catchLinks.default(window, {}, hrefHandler)
    global.___failedResources = true
  })

  afterAll(() => {
    eventDestroyer()
    global.___failedResources = false
  })

  it(`shares the same origin and top path`, done => {
    const sameOriginAndTopPath = document.createElement(`a`)
    sameOriginAndTopPath.setAttribute(
      `href`,
      `${window.location.href}/someSubPath`
    )
    document.body.appendChild(sameOriginAndTopPath)

    // create the click event we'll be using for testing
    const clickEvent = new MouseEvent(`click`, {
      bubbles: true,
      cancelable: true,
      view: window,
    })

    window.addEventListener(`click`, function onClick() {
      window.removeEventListener(`click`, onClick)
      expect(hrefHandler).not.toHaveBeenCalled()

      sameOriginAndTopPath.remove()

      done()
    })

    sameOriginAndTopPath.dispatchEvent(clickEvent)
  })
})

describe(`pathPrefix is handled if caught link to ${pathPrefix}/article navigates to ${pathPrefix}/article`, () => {
  // We're going to manually set up the event listener here
  let hrefHandler
  let eventDestroyer

  beforeAll(() => {
    hrefHandler = jest.fn()
    eventDestroyer = catchLinks.default(window, {}, hrefHandler)
  })

  afterAll(() => {
    global.__BASE_PATH__ = ``
    eventDestroyer()
  })

  test(`on sites with pathPrefix '${pathPrefix}'`, done => {
    // simulate case with --prefix-paths and prefix /blog
    global.__BASE_PATH__ = pathPrefix

    // create the element with href /blog/article
    const clickElement = document.createElement(`a`)
    clickElement.setAttribute(`href`, `${window.location.href}/article`)
    document.body.appendChild(clickElement)

    // create the click event we'll be using for testing
    const clickEvent = new MouseEvent(`click`, {
      bubbles: true,
      cancelable: true,
      view: window,
    })

    // fake module handler
    hrefHandler.mockImplementation(path => {
      // place a mock where processing exits gatsby-link
      const checkPoint = (global.___navigate = jest.fn())
      // call gatsby-link.navigate as the default handler does
      navigate(path)
      // compare href past gatsby-link against our clickElement
      expect(checkPoint).toHaveBeenCalledWith(
        `${pathPrefix}/article`,
        undefined
      )

      // cleanup
      clickElement.remove()
      done()
    })

    // and trigger click
    clickElement.dispatchEvent(clickEvent)
  })

  test(`on sites without pathPrefix`, done => {
    // simulate default case without --prefix-paths
    global.__BASE_PATH__ = ``

    // create the element with href /blog/article
    const clickElement = document.createElement(`a`)
    clickElement.setAttribute(`href`, `${window.location.href}/article`)
    document.body.appendChild(clickElement)

    // create the click event we'll be using for testing
    const clickEvent = new MouseEvent(`click`, {
      bubbles: true,
      cancelable: true,
      view: window,
    })

    // fake module handler
    hrefHandler.mockImplementation(path => {
      // place a mock where processing exits gatsby-link
      const checkPoint = (global.___navigate = jest.fn())
      // call gatsby-link.navigate as the default handler does
      navigate(path)
      // compare href past gatsby-link against our clickElement
      expect(checkPoint).toHaveBeenCalledWith(
        `${pathPrefix}/article`,
        undefined
      )

      // cleanup
      clickElement.remove()
      done()
    })

    // and trigger click
    clickElement.dispatchEvent(clickEvent)
  })
})

describe(`navigation is routed through browser without SVGAnimatedString support`, () => {
  let hrefHandler
  let eventDestroyer
  const oldSVGAnimatedString = SVGAnimatedString

  beforeAll(() => {
    hrefHandler = jest.fn()
    eventDestroyer = catchLinks.default(window, {}, hrefHandler)
    delete global.SVGAnimatedString
  })

  afterAll(() => {
    eventDestroyer()
    global.SVGAnimatedString = oldSVGAnimatedString
  })

  test(`works without throwing an error`, () => {
    // create a click element to use for testing
    const clickElement = document.createElement(`a`)
    clickElement.setAttribute(`href`, `${window.location.href}/article`)
    document.body.appendChild(clickElement)

    // create the click event we'll be using for testing
    const clickEvent = new MouseEvent(`click`, {
      bubbles: true,
      cancelable: true,
      view: window,
    })

    // and trigger click
    clickElement.dispatchEvent(clickEvent)

    expect(() =>
      catchLinks.routeThroughBrowserOrApp(jest.fn())(clickEvent)
    ).not.toThrow()
  })
})
