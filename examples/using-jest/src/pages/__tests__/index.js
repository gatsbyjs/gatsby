/**
 * @jest-environment jsdom
 */

import * as React from "react"
import { render } from "@testing-library/react"
import * as Gatsby from "gatsby"

const useStaticQuery = jest.spyOn(Gatsby, `useStaticQuery`)
const mockUseStaticQuery = {
  site: {
    siteMetadata: {
      title: `Gatsby Default Starter`
    }
  },
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

import Index from "../index"

describe(`Index`, () => {
  beforeEach(() => {
    useStaticQuery.mockImplementation(() => mockUseStaticQuery)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it(`contains a gatsby image`, () => {
    const { getByTestId } = render(<Index />)
    const node = getByTestId(`gatsby-logo`)

    expect(node.querySelectorAll(`img[alt="Gatsby Astronaut"]`)).toHaveLength(1)
  })

  it(`contains a greeting`, () => {
    const { getByText } = render(<Index />)

    getByText(`Hi people`)
  })
})
