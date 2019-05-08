import React from "react"
import { render } from "react-testing-library"

import Banner from "../banner"

test(`it renders an external link`, () => {
  const { getByText } = render(<Banner />)

  const link = getByText(`Register now`)

  expect(link.getAttribute(`href`)).toContain(`https://`)
})
