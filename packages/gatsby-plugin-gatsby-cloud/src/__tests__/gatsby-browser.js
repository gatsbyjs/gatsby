import React from "react"
import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { wrapPageElement } from "../gatsby-browser"

describe(`Preview status indicator`, () => {
  describe(`wrapPageElement`, () => {
    const testMessage = `Test Page`

    beforeEach(() => {
      // process.env.GATSBY_PREVIEW_INDICATOR_ENABLED = 'true'
      render(
        wrapPageElement({
          element: ``,
          props: { children: <div>{testMessage}</div> },
        })
      )
    })

    test(`renders the initial page element`, () => {
      expect(screen.queryByText(testMessage)).toBeInTheDocument()
    })
  })
})
