import React from "react"
import { render, cleanup } from "react-testing-library"

import Banner from "../banner"

afterEach(cleanup)

test(`it renders an external link`, () => {
  const { getByText } = render(<Banner />)

  const link = getByText(`Watch now`)

  expect(link.getAttribute(`href`)).toContain(`https://`)
})
