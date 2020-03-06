import React from "react"
import { render } from "@testing-library/react"
import { ThemeProvider } from "theme-ui"
import theme from "../../gatsby-plugin-theme-ui"
import PrevAndNext from "../prev-and-next"

const prev = {
  title: `Challenge 9 - Optimize Your Website for Search Engines (SEO)`,
  link: `/blog/100days/seo/`,
}
const next = {
  title: `Challenge 10 - Optimize Your Website for Search Engines (SEO)`,
  link: `/blog/100days/seo/`,
}

test(`it can be rendered without when prev and next are null `, () => {
  expect(() =>
    render(
      <ThemeProvider theme={theme}>
        <PrevAndNext />
      </ThemeProvider>
    )
  ).not.toThrow()
})

test(`it can be rendered when prev and next are not null`, () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <PrevAndNext prev={prev} next={next} />
    </ThemeProvider>
  )

  expect(getByText(`Previous`)).toBeInTheDocument()
  expect(
    getByText(`Challenge 9 - Optimize Your Website for Search Engines (SEO)`)
  ).toBeInTheDocument()

  expect(getByText(`Next`)).toBeInTheDocument()
  expect(
    getByText(`Challenge 10 - Optimize Your Website for Search Engines (SEO)`)
  ).toBeInTheDocument()
})

test(`it can be rendered when next is null`, () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <PrevAndNext prev={prev} />
    </ThemeProvider>
  )

  expect(getByText(`Previous`)).toBeInTheDocument()
  expect(
    getByText(`Challenge 9 - Optimize Your Website for Search Engines (SEO)`)
  ).toBeInTheDocument()
})

test(`it can be rendered when prev is null`, () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <PrevAndNext next={next} />
    </ThemeProvider>
  )

  expect(getByText(`Next`)).toBeInTheDocument()
  expect(
    getByText(`Challenge 10 - Optimize Your Website for Search Engines (SEO)`)
  ).toBeInTheDocument()
})
