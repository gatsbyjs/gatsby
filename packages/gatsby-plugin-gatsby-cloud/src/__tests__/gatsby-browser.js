import React from "react"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"

import { wrapPageElement } from "../gatsby-browser"
import Indicator from "../indicator"

describe(`Preview status indicator`, () => {
  const waitForPoll = ms =>
    new Promise(resolve => setTimeout(resolve, ms || 50))

  describe(`wrapPageElement`, () => {
    const testMessage = `Test Page`

    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => {
            return {
              currentBuild: { id: `123`, buildStatus: `SUCCESS` },
              latestBuild: { id: `1234`, buildStatus: `SUCCESS` },
            }
          },
        })
      )
    })

    it(`renders the initial page and indicator if indicator enabled`, async () => {
      process.env.GATSBY_PREVIEW_INDICATOR_ENABLED = `true`

      render(
        wrapPageElement({
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
        wrapPageElement({
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
        wrapPageElement({
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
    beforeEach(() => {
      render(<Indicator />)
    })

    describe(`Success state`, () => {
      beforeEach(async () => {
        global.fetch = jest.fn(() =>
          Promise.resolve({
            json: () => {
              return {
                currentBuild: { id: `123`, buildStatus: `SUCCESS` },
                latestBuild: { id: `1234`, buildStatus: `SUCCESS` },
              }
            },
          })
        )

        await waitForPoll()
      })

      it(`renders when more recent successful build available`, async () => {
        expect(screen.getByText(`New preview available`)).toBeInTheDocument()
      })

      it(`navigates to new build when indicator is clicked`, async () => {
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

    it(`renders FAILED state when most recent build failed`, async () => {
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

    it(`renders BUILDING state when most recent build is currently building`, async () => {
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

    it(`renders NO state when on most successful build`, async () => {
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
