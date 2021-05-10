import React from "react"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import { render, screen, act } from "@testing-library/react"
// import Enzyme, { shallow, mount, unmount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

// Enzyme.configure({ adapter: new Adapter() });

import { wrapRootElement } from "../gatsby-browser"
import Indicator from "../components/Indicator"
import GatsbyIndicatorButton from "../components/GatsbyIndicatorButton"
import LinkIndicatorButton from "../components/LinkIndicatorButton"
import InfoIndicatorButton from "../components/InfoIndicatorButton"

import { server } from "../mocks/server"

global.fetch = require("node-fetch")

const createUrl = (path) => `https://test.com/${path}`

process.env.GATSBY_PREVIEW_AUTH_TOKEN = 'token'

beforeAll(() => {
  server.listen()
})

afterEach(() => server.resetHandlers())

afterAll(() => {
  server.close()
})

describe(`Preview status indicator`, () => {
  const waitForPoll = ms =>
    new Promise(resolve => setTimeout(resolve, ms || 50))

  describe(`wrapRootElement`, () => {
    const testMessage = `Test Page`

    beforeEach(() => {
      process.env.GATSBY_PREVIEW_API_URL = createUrl(`success`)
    })

    it(`renders the initial page and indicator if indicator enabled`, async () => {
      process.env.GATSBY_PREVIEW_INDICATOR_ENABLED = `true`

      render(
        wrapRootElement({
          element: <div>{testMessage}</div>,
        })
      )

      await waitForPoll()

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

    it(`renders initial page without indicator if Indicator errors`, async () => {
      render(
        wrapRootElement({
          element: <div>{testMessage}</div>,
        })
      )

      global.fetch = jest.fn(() =>
        Promise.resolve({ json: () => new Error(`failed`) })
      )

      await waitForPoll()

      expect(screen.getByText(testMessage)).toBeInTheDocument()
      expect(
        screen.queryByTestId(`preview-status-indicator`)
      ).not.toBeInTheDocument()
    })
  })

  describe(`Indicator component`, () => {

    describe(`success state`, () => {
      beforeEach(async () => {
        process.env.GATSBY_PREVIEW_API_URL = createUrl('success')

        await waitForPoll()
      })

      describe(`gatsby button`, () => {
        beforeEach(async () => {
          await act(() => { 
            render(<Indicator /> )
            return waitForPoll(150)
          })

        })

        it(`renders when more recent successful build available`, async () => {
          console.log(screen.getByTestId(`gatsby-button`))
          expect(screen.getByTestId(`gatsby-button`)).toBeInTheDocument()
        })
      })
    })

    describe(`Success state`, () => {
      beforeEach(async () => {
        process.env.GATSBY_PREVIEW_API_URL = createUrl(success)

        await waitForPoll(100)
      })

      xit(`renders when more recent successful build available`, async () => {
        expect(screen.getByText(`Click to view`)).toBeInTheDocument()
      })

      xit(`navigates to new build when indicator is clicked`, async () => {
        delete window.location
        window.location = new URL(`https://preview-testsite.gtsb.io`)
        window.location.replace = jest.fn(
          () => (window.location = new URL(`https://build-123.gtsb.io`))
        )

        const previewIndicator = screen.getByText(`New preview available`)
        userEvent.click(previewIndicator)
        await waitForPoll(300)

        expect(String(window.location)).toBe(`https://build-123.gtsb.io/`)
      })
    })

    xit(`renders FAILED state when most recent build failed`, async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => {
            return {
              currentBuild: { id: `123`, buildStatus: `ERROR` },
              latestBuild: { id: `1234`, buildStatus: `SUCCESS` },
            }
          },
        })
      )

      await waitForPoll()

      expect(
        screen.getByText(`Latest preview build failed`)
      ).toBeInTheDocument()
    })

    xit(`renders BUILDING state when most recent build is currently building`, async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => {
            return {
              currentBuild: { id: `123`, buildStatus: `BUILDING` },
              latestBuild: { id: `1234`, buildStatus: `SUCCESS` },
            }
          },
        })
      )

      await waitForPoll()

      expect(screen.getByText(`New preview building`)).toBeInTheDocument()
    })

    xit(`renders NO state when on most successful build`, async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => {
            return {
              currentBuild: { id: `123`, buildStatus: `SUCCESS` },
              latestBuild: { id: `123`, buildStatus: `SUCCESS` },
            }
          },
        })
      )

      expect(
        screen.queryByTestId(`preview-status-indicator`)
      ).not.toBeInTheDocument()
    })
  })
})
