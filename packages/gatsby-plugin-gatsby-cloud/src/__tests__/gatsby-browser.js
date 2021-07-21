import React from "react"
import "@testing-library/jest-dom/extend-expect"
import userEvent from "@testing-library/user-event"
import { render, screen, act, waitFor, fireEvent } from "@testing-library/react"

// import { wrapRootElement } from "../gatsby-browser"
import Indicator from "../components/Indicator"

import { server } from "./mocks/server"

const createUrl = path => `https://test.com/${path}`
const copyLinkMessage = `Copy link`
const copyLinkSuccessMessage = `Link copied`
const infoButtonMessage = `Preview updated`
const errorLogMessage = `View logs`
const newPreviewMessage = `New preview available`
const initialStateMessage = `Fetching preview info...`
const buildingPreviewMessage = `Building a new preview`

const initialLoadEventName = `PREVIEW_INDICATOR_LOADED`

process.env.GATSBY_PREVIEW_AUTH_TOKEN = `token`

jest.mock(`../package.json`, () => jest.requireActual(`../../package.json`), {
  virtual: true,
})

describe(`Preview status indicator`, () => {
  const assertTooltipText = async ({ route, text, matcherType }) => {
    process.env.GATSBY_PREVIEW_API_URL = createUrl(route)

    await act(async () => {
      render(<Indicator />)
    })

    // jest.runOnlyPendingTimers()

    // await act(async () => {
    if (matcherType === `query`) {
      // await waitFor(() => {
      expect(screen.queryByText(text, { exact: false })).not.toBeInTheDocument()
      // })
    } else if (matcherType === `get`) {
      await waitFor(() => {
        expect(screen.getByText(text, { exact: false })).toBeInTheDocument()
      })
    }
    // })
  }

  const assertTrackEventGetsCalled = async ({
    text,
    route,
    action,
    testId,
  }) => {
    process.env.GATSBY_PREVIEW_API_URL = createUrl(route)
    process.env.GATSBY_TELEMETRY_API = `http://test.com/events`
    let component

    await act(async () => {
      render(<Indicator />)
    })

    await waitFor(() => {
      if (testId) {
        component = screen.getByTestId(testId)
      } else {
        component = screen.getByText(text, { exact: false })
      }
    })

    await waitFor(() => {
      if (action) {
        userEvent[action](component)
        // Initial poll fetch, initial load trackEvent, and trackEvent after action
        expect(window.fetch).toBeCalledTimes(3)
      } else {
        // Initial poll fetch for build data and then trackEvent fetch call
        expect(window.fetch).toBeCalledTimes(2)
      }
    })
  }

  beforeAll(() => {
    server.listen()
  })

  beforeEach(() => {
    // it will disable setTimeout behaviour - only fetchData once
    jest.useFakeTimers()
    // reset all mocks
    jest.resetModules()
    global.fetch = require(`node-fetch`)
    jest.spyOn(global, `fetch`)

    /**
     * mock out location.host as described here
     * https://github.com/facebook/jest/issues/5124#issuecomment-415494099
     */
    global.window = Object.create(window)
    Object.defineProperty(window, `location`, {
      value: {
        href: `https://build-123.gtsb.io`,
        hostname: `https://build-123.gtsb.io`,
      },
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  // We are now rendering a Shadow DOM in wrapRootElement, testing-library does not play nicely with
  // a Shadow DOM so until we have a fix for it by either using a cypress test or a different
  // library we will skip it.

  // describe(`wrapRootElement`, () => {
  //   const testMessage = `Test Page`

  //   beforeEach(() => {
  //     process.env.GATSBY_PREVIEW_API_URL = createUrl(`success`)
  //   })

  //   it(`renders the initial page and indicator if indicator enabled`, async () => {
  //     // do not fetch any data
  //     global.fetch = jest.fn(() => new Promise(() => {}))
  //     process.env.GATSBY_PREVIEW_INDICATOR_ENABLED = `true`

  //     act(() => {
  //       render(
  //         wrapRootElement({
  //           element: <div>{testMessage}</div>,
  //         })
  //       )
  //     })

  //     expect(screen.getByText(testMessage)).toBeInTheDocument()
  //     expect(
  //       screen.queryByTestId(`preview-status-indicator`)
  //     ).toBeInTheDocument()
  //   })

  //   it(`renders page without the indicator if indicator not enabled`, () => {
  //     process.env.GATSBY_PREVIEW_INDICATOR_ENABLED = `false`

  //     render(
  //       wrapRootElement({
  //         element: <div>{testMessage}</div>,
  //       })
  //     )

  //     expect(screen.getByText(testMessage)).toBeInTheDocument()
  //     expect(
  //       screen.queryByTestId(`preview-status-indicator`)
  //     ).not.toBeInTheDocument()
  //   })

  //   it(`renders initial page without indicator if api errors`, async () => {
  //     render(
  //       wrapRootElement({
  //         element: <div>{testMessage}</div>,
  //       })
  //     )

  //     global.fetch = jest.fn(() =>
  //       Promise.resolve({ json: () => new Error(`failed`) })
  //     )

  //     expect(screen.getByText(testMessage)).toBeInTheDocument()
  //     expect(
  //       screen.queryByTestId(`preview-status-indicator`)
  //     ).not.toBeInTheDocument()
  //   })
  // })

  describe(`Indicator`, () => {
    describe(`trackEvent`, () => {
      it(`should trackEvent after indicator's initial poll`, async () => {
        process.env.GATSBY_PREVIEW_API_URL = createUrl(`success`)
        process.env.GATSBY_TELEMETRY_API = `http://test.com/events`

        await act(async () => {
          render(<Indicator />)
        })

        await waitFor(() => {
          // Initial poll fetch for build data and then trackEvent fetch call
          expect(window.fetch).toBeCalledTimes(2)
        })

        expect(window.fetch.mock.calls[1][1].body).toContain(
          initialLoadEventName
        )
      })

      it(`should trackEvent after error logs are opened`, async () => {
        window.open = jest.fn()

        await assertTrackEventGetsCalled({
          route: `error`,
          text: errorLogMessage,
          action: `click`,
        })
      })

      it(`should trackEvent after copy link is clicked`, async () => {
        navigator.clipboard = { writeText: jest.fn() }

        await assertTrackEventGetsCalled({
          route: `uptodate`,
          text: copyLinkMessage,
          action: `click`,
        })
      })

      it(`should trackEvent after info button is hovered over`, async () => {
        await assertTrackEventGetsCalled({
          route: `uptodate`,
          testId: `info-button`,
          action: `hover`,
        })
      })

      it(`should trackEvent after link button is hovered over`, async () => {
        await assertTrackEventGetsCalled({
          route: `uptodate`,
          testId: `link-button`,
          action: `hover`,
        })
      })
    })

    describe(`Gatsby Button`, () => {
      // This test doesn't work currently with how we get the buildId

      // it(`should show a more recent succesful build when available`, async () => {
      //   await assertTooltipText({
      //     route: `success`,
      //     text: newPreviewMessage,
      //     matcherType: `get`,
      //   })
      // })

      it(`should show an error message when most recent build fails`, async () => {
        await assertTooltipText({
          route: `error`,
          text: errorLogMessage,
          matcherType: `get`,
        })
      })

      it(`should show a preview building message when most recent build is building`, async () => {
        await assertTooltipText({
          route: `building`,
          text: buildingPreviewMessage,
          matcherType: `get`,
        })
      })

      it(`should have no tooltip when preview is up to date`, async () => {
        await assertTooltipText({
          route: `uptodate`,
          text: initialStateMessage,
          matcherType: `query`,
        })
      })

      it(`should open a new window to build logs when tooltip is clicked on error`, async () => {
        process.env.GATSBY_PREVIEW_API_URL = createUrl(`error`)
        window.open = jest.fn()

        let gatsbyButtonTooltipLink
        const pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/999/sites/111/builds/123/details`
        const returnTo = encodeURIComponent(pathToBuildLogs)

        await await act(() => {
          render(<Indicator />)
        })

        await waitFor(() => {
          gatsbyButtonTooltipLink = screen
            .getByText(errorLogMessage, {
              exact: false,
            })
            .closest(`a`)
        })

        expect(gatsbyButtonTooltipLink.getAttribute(`href`)).toContain(
          `${pathToBuildLogs}?returnTo=${returnTo}`
        )

        assertTrackEventGetsCalled({
          route: `error`,
          testId: `info-button`,
        })
      })
    })

    describe(`Link Button`, () => {
      // TODO: Test hoverability

      it(`should have no tooltip when successful`, async () => {
        await assertTooltipText({
          route: `success`,
          text: copyLinkMessage,
          matcherType: `query`,
        })
      })

      it(`should have no tooltip when error`, async () => {
        await assertTooltipText({
          route: `error`,
          text: copyLinkMessage,
          matcherType: `query`,
        })
      })

      it(`should have a copy link tooltip when building`, async () => {
        await assertTooltipText({
          route: `building`,
          text: copyLinkMessage,
          matcherType: `get`,
        })
      })

      it(`should have a copy link tooltip when up to date`, async () => {
        await assertTooltipText({
          route: `uptodate`,
          text: copyLinkMessage,
          matcherType: `get`,
        })
      })

      it(`should copy to clipboard when copy link is clicked`, async () => {
        process.env.GATSBY_PREVIEW_API_URL = createUrl(`uptodate`)

        navigator.clipboard = { writeText: jest.fn() }
        let copyLinkTooltip

        await act(() => {
          render(<Indicator />)
        })

        fireEvent.mouseEnter(screen.getByTestId(`link-button`))

        await waitFor(() => {
          copyLinkTooltip = screen.getByText(copyLinkMessage, { exact: false })
        })

        /**
         * Should show the tooltip content that exists before a successful copy
         * when a user hovers
         */
        expect(copyLinkTooltip).toBeInTheDocument()

        userEvent.click(screen.getByTestId(`link-button`))

        await waitFor(() => {
          copyLinkTooltip = screen.getByText(copyLinkSuccessMessage, {
            exact: false,
          })
        })

        /**
         * Should show the success tooltip content after the user has copied the link
         */
        expect(copyLinkTooltip).toBeInTheDocument()

        expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
      })
    })

    describe(`Info Button`, () => {
      it(`should have no tooltip when successful`, async () => {
        await assertTooltipText({
          route: `success`,
          text: infoButtonMessage,
          matcherType: `query`,
        })
      })

      it(`should have no tooltip when error`, async () => {
        await assertTooltipText({
          route: `error`,
          text: infoButtonMessage,
          matcherType: `query`,
        })
      })

      it(`should have no tooltip when building`, async () => {
        await assertTooltipText({
          route: `building`,
          text: infoButtonMessage,
          matcherType: `query`,
        })
      })

      it(`should have no tooltip in initial state`, async () => {
        await assertTooltipText({
          route: `fetching`,
          text: infoButtonMessage,
          matcherType: `query`,
        })
      })

      it(`should have a last updated tooltip when up to date`, async () => {
        await assertTooltipText({
          route: `uptodate`,
          text: infoButtonMessage,
          matcherType: `get`,
        })
      })
    })
  })
})
