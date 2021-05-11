import React from "react"
import "@testing-library/jest-dom/extend-expect"
import userEvent from "@testing-library/user-event"
import { render, screen, act, waitFor } from "@testing-library/react"

import { wrapRootElement } from "../gatsby-browser"
import Indicator from "../components/Indicator"

import { server } from "./mocks/server"

const createUrl = path => `https://test.com/${path}`
const copyLinkMessage = `Copy link`
const infoButtonMessage = `Preview updated`

process.env.GATSBY_PREVIEW_AUTH_TOKEN = `token`

describe(`Preview status indicator`, () => {
  const assertTooltipText = async ({ route, text, matcherType }) => {
    process.env.GATSBY_PREVIEW_API_URL = createUrl(route)

    // it will disable setTimeout behaviour - only fetchData once
    jest.useFakeTimers()

    await act(async () => {
      render(<Indicator />)
    })

    if (matcherType === `query`) {
      await waitFor(() => {
        expect(
          screen.queryByText(text, { exact: false })
        ).not.toBeInTheDocument()
      })
    } else if (matcherType === `get`) {
      await waitFor(() => {
        expect(
          screen.getByText(text, { exact: false })
        ).toBeInTheDocument()
      })
    }
  }

  beforeAll(() => {
    server.listen()
  })

  beforeEach(() => {
    // reset all mocks
    jest.resetModules()
    global.fetch = require(`node-fetch`)
    jest.spyOn(global, `fetch`)
  })

  afterEach(() => {
    jest.useRealTimers()
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  describe(`wrapRootElement`, () => {
    const testMessage = `Test Page`

    beforeEach(() => {
      process.env.GATSBY_PREVIEW_API_URL = createUrl(`success`)
    })

    it(`renders the initial page and indicator if indicator enabled`, async () => {
      // do not fetch any data
      global.fetch = jest.fn(() => new Promise(() => {}))
      process.env.GATSBY_PREVIEW_INDICATOR_ENABLED = `true`

      act(() => {
        render(
          wrapRootElement({
            element: <div>{testMessage}</div>,
          })
        )
      })

      expect(screen.getByText(testMessage)).toBeInTheDocument()
      expect(
        screen.queryByTestId(`preview-status-indicator`)
      ).toBeInTheDocument()
    })

    it(`renders page without the indicator if indicator not enabled`, () => {
      process.env.GATSBY_PREVIEW_INDICATOR_ENABLED = `false`

      render(
        wrapRootElement({
          element: <div>{testMessage}</div>,
        })
      )

      expect(screen.getByText(testMessage)).toBeInTheDocument()
      expect(
        screen.queryByTestId(`preview-status-indicator`)
      ).not.toBeInTheDocument()
    })

    it(`renders initial page without indicator if api errors`, async () => {
      render(
        wrapRootElement({
          element: <div>{testMessage}</div>,
        })
      )

      global.fetch = jest.fn(() =>
        Promise.resolve({ json: () => new Error(`failed`) })
      )

      expect(screen.getByText(testMessage)).toBeInTheDocument()
      expect(
        screen.queryByTestId(`preview-status-indicator`)
      ).not.toBeInTheDocument()
    })
  })

  describe(`Indicator`, () => {
    describe(`Gatsby Button`, () => {
      it(`should show a more recent succesful build when available`, async () => {
        await assertTooltipText({ route: `success`, text: `New preview available`, matcherType: `get`})
      })

      it(`should show an error message when most recent build fails`, async () => {
        await assertTooltipText({ route: `error`, text: `Preview error`, matcherType: `get`})
      })

      it(`should show a preview building message when most recent build is building`, async () => {
        await assertTooltipText({ route: `building`, text: `Building a new preview`, matcherType: `get`})
      })

      it(`should have loading state if no build data has been fetched`, async () => {
        await assertTooltipText({ route: `fetching`, text: `Fetching preview info...`, matcherType: `get`})
      })

      it(`should have no tooltip when preview is up to date`, async () => {
        await assertTooltipText({ route: `uptodate`, text: `Fetching preview info...`, matcherType: `query`})
      })

      it(`should open a new window to build logs when tooltip is clicked on error`, async () => {
        process.env.GATSBY_PREVIEW_API_URL = createUrl(`error`)
        window.open = jest.fn()

        let gatsbyButtonTooltip
        const pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/999/sites/111/builds/null/details`
        const returnTo = encodeURIComponent(pathToBuildLogs)
        
        await act(async () => {
          render(<Indicator />)
        })

        await waitFor(() => {
          gatsbyButtonTooltip = screen.getByText(`View logs`, { exact: false })
        })

        userEvent.click(gatsbyButtonTooltip)
        expect(window.open).toHaveBeenCalledWith(`${pathToBuildLogs}?returnTo=${returnTo}`)
      })
    })

    describe(`Link Button`, () => {
      // TODO: Test hoverability

      it(`should have no tooltip when successful`, async () => {
        await assertTooltipText({ route: `success`, text: copyLinkMessage, matcherType: `query`})
      })

      it(`should have no tooltip when error`, async () => {
        await assertTooltipText({ route: `error`, text: copyLinkMessage, matcherType: `query`})
      })

      it(`should have a copy link tooltip when building`, async () => {
        await assertTooltipText({ route: `building`, text: copyLinkMessage, matcherType: `get`})
      })

      it(`should have a copy link tooltip in initial state`, async () => {
        await assertTooltipText({ route: `fetching`, text: copyLinkMessage, matcherType: `get`})
      })

      it(`should have a copy link tooltip when up to date`, async () => {
        await assertTooltipText({ route: `uptodate`, text: copyLinkMessage, matcherType: `get`})
      })

      it(`should copy to clipboard when copy link is clicked`, async () => {
        process.env.GATSBY_PREVIEW_API_URL = createUrl(`uptodate`)

        navigator.clipboard = { writeText: jest.fn() }
        let copyLinkButton
        
        await act(async () => {
          render(<Indicator />)
        })

        await waitFor(() => {
          copyLinkButton = screen.getByText(copyLinkMessage, { exact: false })
        })

        userEvent.click(screen.getByText(copyLinkMessage, { exact: false }))
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`http://localhost/`)
      })
    })

    describe(`Info Button`, () => {
      it(`should have no tooltip when successful`, async () => {
        await assertTooltipText({ route: `success`, text: infoButtonMessage, matcherType: `query`})
      })

      it(`should have no tooltip when error`, async () => {
        await assertTooltipText({ route: `error`, text: infoButtonMessage, matcherType: `query`})
      })

      it(`should have no tooltip when building`, async () => {
        await assertTooltipText({ route: `building`, text: infoButtonMessage, matcherType: `query`})
      })

      it(`should have no tooltip in initial state`, async () => {
        await assertTooltipText({ route: `fetching`, text: infoButtonMessage, matcherType: `query`})
      })

      it(`should have a last updated tooltip when up to date`, async () => {
        await assertTooltipText({ route: `uptodate`, text: infoButtonMessage, matcherType: `get`})
      })
    })
  })

  describe('window.location', () => {
    const { location } = window;
  
    beforeAll(() => {
      delete window.location;
      window.location = { href: `https://preview-xxx.gtsb.io`, reload: jest.fn(), host: 'preview-xxx.gtsb.io', hostname: 'preview-xxx.gtsb.io' }

      const replace = jest.fn((url) => {
        window.location.href = url
      })

      window.location.replace = replace
    });
  
    afterAll(() => {
      window.location = location;
    });
  
    // it('mocks `reload`', () => {
    //   expect(jest.isMockFunction(window.location.reload)).toBe(true);
    // });
  
    // it('calls `reload`', () => {
    //   window.location.reload();
    //   expect(window.location.reload).toHaveBeenCalled();
    // });
  
    it(`should reload to the pretty url when gatsby button success state tooltip is clicked`, async () => {
      process.env.GATSBY_PREVIEW_API_URL = createUrl(`success`)

      let gatsbyButtonTooltip
      jest.useFakeTimers()
  
      await act(async () => {
        render(<Indicator />)
      })
  
      await waitFor(() => {
        gatsbyButtonTooltip = screen.queryByTestId(`gatsby-tooltip`)
      })
  
      await act(async () => {
        userEvent.click(gatsbyButtonTooltip)
      })

      expect(window.location.replace).toHaveBeenCalledTimes(1)
    })
  });
})

