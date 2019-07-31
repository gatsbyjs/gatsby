import React from "react"
import { fireEvent, render } from "@testing-library/react"

import Button from "../button"

describe(`selective tag rendering`, () => {
  it(`defaults to rendering a Gatsby Link`, () => {
    const { container, getByText } = render(
      <Button to="/somewhere">Hello</Button>
    )

    expect(container.nodeName).toBe(`DIV`)
    expect(getByText(`Hello`).nodeName).toBe(`A`)
  })

  it(`renders a button if tag=button`, () => {
    const { getByText } = render(
      <Button to="/somewhere" tag="button">
        Hello
      </Button>
    )

    expect(getByText(`Hello`).nodeName).toBe(`BUTTON`)
  })

  it(`renders an anchor if tag=a`, () => {
    const { getByText } = render(
      <Button to="/somewhere" tag="link">
        Hello
      </Button>
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
    const { getByText } = render(<Button to="/not-tracked">Hello</Button>)
    fireEvent.click(getByText(`Hello`))

    expect(ga).not.toHaveBeenCalled()
  })

  it(`does not send tracking event if ga is undefined`, () => {
    delete window.ga

    const { getByText } = render(
      <Button to="/not-tracked" tracking={true}>
        Hello
      </Button>
    )
    fireEvent.click(getByText(`Hello`))

    expect(ga).not.toHaveBeenCalled()
  })

  it(`sends tracking event if tracking=true`, () => {
    const to = `/tracking/somewhere`
    const { getByText } = render(
      <Button to={to} tracking={true}>
        Hello
      </Button>
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
      <Button to="/custom-click" onClick={onClick}>
        Hello
      </Button>
    )
    fireEvent.click(getByText(`Hello`))

    expect(onClick).toHaveBeenCalledWith(expect.any(Object))
  })

  it(`renders children`, () => {
    const children = <span>Hello World</span>
    const { getByText } = render(<Button to="/children">{children}</Button>)

    expect(getByText(`Hello World`)).toBeDefined()
  })

  it(`renders icon, if defined`, () => {
    const icon = <span>Icon</span>

    const { getByText } = render(
      <Button to="/with-icon" icon={icon}>
        Hello
      </Button>
    )

    expect(getByText(`Icon`)).toBeDefined()
  })
})
