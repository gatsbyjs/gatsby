import React from "react"
import { render } from "@testing-library/react"
import { ThemeProvider } from "theme-ui"

import theme from "../../../src/gatsby-plugin-theme-ui"
import Copy from "../copy"

test(`it renders Copy by default`, () => {
  const { queryByText } = render(
    <ThemeProvider theme={theme}>
      <Copy content="1234" />
    </ThemeProvider>
  )

  expect(queryByText(`Copy`)).toBeInTheDocument()
})

test(`it renders screen-reader text`, () => {
  const { container } = render(
    <ThemeProvider theme={theme}>
      <Copy content="1234" />
    </ThemeProvider>
  )

  expect(container.querySelector(`[aria-roledescription]`)).toBeInTheDocument()
})
