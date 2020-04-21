import React from "react"
import { fireEvent, render } from "@testing-library/react"
import { ThemeProvider } from "theme-ui"

import theme from "../../gatsby-plugin-theme-ui"
import Button from "../button"

describe(`selective tag rendering`, () => {
  it(`defaults to rendering a Gatsby Link`, () => {
    const { container, getByText } = render(
      <ThemeProvider theme={theme}>
        <Button to="/somewhere">Hello</Button>
      </ThemeProvider>
    )

    expect(container.nodeName).toBe(`DIV`)
    expect(getByText(`Hello`).nodeName).toBe(`A`)
  })

  it(`renders a button if tag=button`, () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <Button to="/somewhere" tag="button">
          Hello
        </Button>
      </ThemeProvider>
    )

    expect(getByText(`Hello`).nodeName).toBe(`BUTTON`)
  })

  it(`renders an anchor if tag=a`, () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <Button to="/somewhere" tag="link">
          Hello
        </Button>
      </ThemeProvider>
    )

    expect(getByText(`Hello`).nodeName).toBe(`A`)
  })
})

describe(`tracking`, () => {
  let ga
  beforeEach(() => {
    ga = window.ga = jest.fn()
  })

  it(`does not send tracking event, by default`, () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <Button to="/not-tracked">Hello</Button>
      </ThemeProvider>
    )
    fireEvent.click(getByText(`Hello`))

    expect(ga).not.toHaveBeenCalled()
  })

  it(`does not send tracking event if ga is undefined`, () => {
    delete window.ga

    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <Button to="/not-tracked" tracking={true}>
          Hello
        </Button>
      </ThemeProvider>
    )
    fireEvent.click(getByText(`Hello`))

    expect(ga).not.toHaveBeenCalled()
  })

  it(`sends tracking event if tracking=true`, () => {
    const to = `/tracking/somewhere`
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <Button to={to} tracking={true}>
          Hello
        </Button>
      </ThemeProvider>
    )

    fireEvent.click(getByText(`Hello`))

    expect(ga).toHaveBeenCalledWith(
      `send`,
      `event`,
      expect.objectContaining({
        eventCategory: `Outbound Link`,
        eventAction: `click`,
        eventLabel: expect.stringContaining(to),
      })
    )
  })
})

describe(`props forwarding`, () => {
  it(`invokes custom onClick handler`, () => {
    const onClick = jest.fn()

    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <Button to="/custom-click" onClick={onClick}>
          Hello
        </Button>
      </ThemeProvider>
    )
    fireEvent.click(getByText(`Hello`))

    expect(onClick).toHaveBeenCalledWith(expect.any(Object))
  })

  it(`renders children`, () => {
    const children = <span>Hello World</span>
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <Button to="/children">{children}</Button>
      </ThemeProvider>
    )

    expect(getByText(`Hello World`)).toBeDefined()
  })

  it(`renders icon, if defined`, () => {
    const icon = <span>Icon</span>

    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <Button to="/with-icon" icon={icon}>
          Hello
        </Button>
      </ThemeProvider>
    )

    expect(getByText(`Icon`)).toBeDefined()
  })
})
