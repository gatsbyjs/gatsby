const pathPrefix = `/pathPrefix`

import * as catchLinks from '../catch-links'

beforeAll(() => {
    // Set the base URL we will be testing against to http://localhost:8000/pathPrefix
    window.history.pushState({}, `APP Url`, `${pathPrefix}`)
})

afterAll(() => {
    window.history.back()
})

describe(`catchLinks`, () => {
    it(`creates a click event`, (done) => {
        done.fail(`NOT IMPLEMENTED YET`)
    })
})

describe(`the click event`, () => {
    it(`checks if the user might be forcing navigation`, (done) => {
        done.fail(`NOT IMPLEMENTED YET`)
    })
    it(`checks if we clicked on an anchor`, (done) => {
        done.fail(`NOT IMPLEMENTED YET`)
    })
    it(`checks if the document author might be forcing navigation`, (done) => {
        done.fail(`NOT IMPLEMENTED YET`)
    })
    it(`checks if the destination/origin URLs have matching origins`, (done) => {
        done.fail(`NOT IMPLEMENTED YET`)
    })
    it(`checks if the destination/origin URLs have matching top level paths`, (done) => {
        done.fail(`NOT IMPLEMENTED YET`)
    })
    it(`checks if the destination URL wants to scroll the page with a hash anchor`, (done) => {
        done.fail(`NOT IMPLEMENTED YET`)
    })
    it(`routes the destination href through gatsby`, (done) => {
        done.fail(`NOT IMPLEMENTED YET`)
    })
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
    it(`must be an anchor tag`, (done) => {
        done.fail(`NOT IMPLEMENTED YET`)
    })
})

describe(`the author might be forcing navigation`, () => {
    test(`if the clicked anchor is a download link`, () => {
        const testAnchor = document.createElement(`a`)
        testAnchor.setAttribute(`download`, ``)

        expect(catchLinks.authorIsForcingNavigation(testAnchor)).toBe(true)
    })
    describe(`if the clicked anchor does not target _self`, () => {
        const separateBrowsingContext = document.body.appendChild(document.createElement(`iframe`))

        test(`target=_blank`, () => {
            const testAnchor = document.createElement(`a`)
            testAnchor.setAttribute(`target`, `_blank`)

            expect(catchLinks.authorIsForcingNavigation(testAnchor)).toBe(true)
        })
        test(`target=_parent`, () => {
            const testAnchor = separateBrowsingContext.contentDocument.createElement(`a`)
            testAnchor.setAttribute(`target`, `_parent`)

            expect(catchLinks.authorIsForcingNavigation(testAnchor)).toBe(true)
        })
        test(`target=_top`, () => {
            const testAnchor = separateBrowsingContext.contentDocument.createElement(`a`)
            testAnchor.setAttribute(`target`, `_top`)

            expect(catchLinks.authorIsForcingNavigation(testAnchor)).toBe(true)
        })

        separateBrowsingContext.remove()
    })
})

describe(`anchor target attribute looks like _self if`, () => {
    const separateBrowsingContext = document.body.appendChild(document.createElement(`iframe`))

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
        const testAnchor = separateBrowsingContext.contentDocument.createElement(`a`)
        testAnchor.setAttribute(`target`, `_parent`)

        document.body.appendChild(testAnchor)

        expect(catchLinks.anchorsTargetIsEquivalentToSelf(testAnchor)).toBe(true)

        testAnchor.remove()
    })
    it(`is set to _top, but window = window.top`, () => {
        const testAnchor = separateBrowsingContext.contentDocument.createElement(`a`)
        testAnchor.setAttribute(`target`, `_top`)

        document.body.appendChild(testAnchor)

        expect(catchLinks.anchorsTargetIsEquivalentToSelf(testAnchor)).toBe(true)

        testAnchor.remove()
    })

    separateBrowsingContext.remove()
})

describe(`navigation is routed through gatsby if the destination href`, () => {
    it(`shares the same origin and`, (done) => {
        done.fail(`NOT IMPLEMENTED YET`)
    })
    it(`shares the same top level path and`, (done) => {
        done.fail(`NOT IMPLEMENTED YET`)
    })
    it(`is not a hash anchor for the current page`, (done) => {
        done.fail(`NOT IMPLEMENTED YET`)
    })
})