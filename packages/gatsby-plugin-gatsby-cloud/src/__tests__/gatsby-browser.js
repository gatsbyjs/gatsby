import React from "react"
import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import { wrapPageElement, POLLING_INTERVAL, Indicator } from "../gatsby-browser"

describe(`Preview status indicator`, () => {
  const waitForPoll = () => {
    return new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL))
  }

  describe(`wrapPageElement`, () => {
    const testMessage = `Test Page`
  
    beforeEach(() => {
      global.fetch = jest.fn(() => {
        return Promise.resolve({ json: () => ({
          currentBuild: { id: '123', buildStatus: 'SUCCESS' },
          latestBuild: { id: '1234', buildStatus: 'SUCCESS' }
          })
        })
      })
    })

    it(`renders the initial page and indicator if indicator enabled`, async () => {
      process.env.GATSBY_PREVIEW_INDICATOR_ENABLED = 'true'

      render(
        wrapPageElement({
          element: <div>{testMessage}</div>
        })
      )

      await waitForPoll()

      expect(screen.getByText(testMessage)).toBeInTheDocument()
      expect(screen.queryByTestId('preview-status-indicator')).toBeInTheDocument()
    })

    it(`renders page without the indicator if indicator not enabled`, () => {
      process.env.GATSBY_PREVIEW_INDICATOR_ENABLED = 'false'

      render(
        wrapPageElement({
          element: <div>{testMessage}</div>
        })
      )

      expect(screen.getByText(testMessage)).toBeInTheDocument()
      expect(screen.queryByTestId('preview-status-indicator')).not.toBeInTheDocument()
    })

    it('renders initial page without indicator if Indicator errors', async () => {
      render(
        wrapPageElement({
          element: <div>{testMessage}</div>
        })
      )

      global.fetch = jest.fn(() => {
        return Promise.resolve({ json: () => new Error('failed') })
      })

      await waitForPoll()

      expect(screen.getByText(testMessage)).toBeInTheDocument()
      expect(screen.queryByTestId('preview-status-indicator')).not.toBeInTheDocument()
    })
  })

  describe(`Indicator component`, () => {
    beforeEach(() => {
      render(<Indicator />)
    })

    describe('Success state', () => {
      beforeEach(async () => {
        global.fetch = jest.fn(() => {
          return Promise.resolve({ json: () => ({
            currentBuild: { id: '123', buildStatus: 'SUCCESS' },
            latestBuild: { id: '1234', buildStatus: 'SUCCESS' }
            })
          })
        })
  
        await waitForPoll()
      })

      it('renders when more recent successful build available', async () => {
        expect(screen.getByText('New preview available')).toBeInTheDocument()
      })

      it('navigates to new build when indicator is clicked', () => {

      })
    })

    it('renders FAILED state when most recent build failed', async () => {
      global.fetch = jest.fn(() => {
        return Promise.resolve({ json: () => ({
          currentBuild: { id: '123', buildStatus: 'ERROR' },
          latestBuild: { id: '1234', buildStatus: 'SUCCESS' }
          })
        })
      })

      await waitForPoll()

      expect(screen.getByText('Latest preview build failed')).toBeInTheDocument()
    })

    it('renders BUILDING state when most recent build is currently building', async () => {
      global.fetch = jest.fn(() => {
        return Promise.resolve({ json: () => ({
          currentBuild: { id: '123', buildStatus: 'BUILDING' },
          latestBuild: { id: '1234', buildStatus: 'SUCCESS' }
          })
        })
      })

      await waitForPoll()

      expect(screen.getByText('New preview building')).toBeInTheDocument()
    })

    xit('renders NO state when on most successful build', async () => {
      // TODO: Waiting for design to be finished to know what to test
    })
  })
})
