import * as React from "react"
import { render } from "@testing-library/react"
import { StaticQuery } from "gatsby" // mocked

import Image from "../image"

beforeEach(() => {
  StaticQuery.mockImplementationOnce(({ render }) =>
    render({
      placeholderImage: {
        childImageSharp: {
          fluid: {
            aspectRatio: 1,
            sizes: `100 200 300`,
            src: `pretend-i-am-a-base64-encoded-image`,
            srcSet: `asdfasdf`,
          },
        },
      },
    })
  )
})

describe(`Image`, () => {
  it(`renders an image`, () => {
    const { container } = render(<Image />)

    expect(container.querySelector(`picture`)).toBeInTheDocument()
  })
})
