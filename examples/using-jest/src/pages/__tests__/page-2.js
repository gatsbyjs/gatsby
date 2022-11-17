/**
 * @jest-environment jsdom
 */

import * as React from "react"
import { render } from "@testing-library/react"

import PageTwo from "../page-2"

describe(`PageTwo`, () => {
  it("renders correctly", () => {
    const data = {
      site: {
        siteMetadata: {
          author: "Your name",
        },
      },
    }

    const { container } = render(<PageTwo data={data} />)

    expect(container.firstChild).toMatchSnapshot()
  })
})
