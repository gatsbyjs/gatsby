import React from "react"
import { render } from "@testing-library/react"

import Copy from "../copy"

test(`it renders Copy by default`, () => {
  const { queryByText } = render(<Copy content="1234" />)

  expect(queryByText(`Copy`)).toBeInTheDocument()
})

test(`it renders screen-reader text`, () => {
  const { container } = render(<Copy content="1234" />)

  expect(container.querySelector(`[aria-roledescription]`)).toBeInTheDocument()
})
