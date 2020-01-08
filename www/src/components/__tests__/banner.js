import React from "react"
import { render } from "@testing-library/react"
import { ThemeProvider } from "theme-ui"

import theme from "../../../src/gatsby-plugin-theme-ui"
import Banner from "../banner"

const matchers = [
  `Watch now`,
  `Register now`,
  `Gatsby Preview`,
  `Gatsby Cloud!`,
]

const getElement = utils => utils.getByText(text => matchers.includes(text))

test(`it renders an external link`, () => {
  const link = getElement(
    render(
      <ThemeProvider theme={theme}>
        <Banner />
      </ThemeProvider>
    )
  )

  expect(link.getAttribute(`href`)).toContain(`https://`)
})
