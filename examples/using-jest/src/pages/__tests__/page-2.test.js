import * as React from "react"
import { render } from "@testing-library/react"
import { StaticQuery } from "gatsby" // mocked

import PageTwo from "../page-2"

beforeEach(() => {
  StaticQuery.mockImplementationOnce(({ render }) =>
    render({
      site: {
        siteMetadata: {
          title: `GatsbyJS`,
        },
      },
    })
  )
})

describe(`Page Two`, () => {
  it(`contains NOT FOUND text`, () => {
    const { getByText } = render(<PageTwo />)

    const el = getByText(`Welcome to page 2`)

    expect(el).toBeInTheDocument()
  })
})
