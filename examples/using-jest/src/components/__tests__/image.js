/**
 * @jest-environment jsdom
 */

import * as React from "react"
import { render } from "@testing-library/react"
import * as Gatsby from "gatsby"

const useStaticQuery = jest.spyOn(Gatsby, `useStaticQuery`)
const mockUseStaticQuery = {
  placeholderImage: {
    childImageSharp: {
      gatsbyImageData: {
        images: {
          fallback: {
            src: `imagesrc.jpg`,
            srcSet: `imagesrcset.jpg 1x`,
          },
        },
        layout: `constrained`,
        width: 1,
        height: 2,
      }
    }
  }
}

import Image from "../image"

describe(`Image`, () => {
  beforeEach(() => {
    useStaticQuery.mockImplementation(() => mockUseStaticQuery)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it(`renders an image`, () => {
    const { container } = render(<Image />)

    expect(container.querySelectorAll(`img[alt="Gatsby Astronaut"]`)).toHaveLength(1)
  })
})
