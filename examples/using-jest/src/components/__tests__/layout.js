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

import Layout from "../layout"

describe(`Layout`, () => {
  beforeEach(() => {
    useStaticQuery.mockImplementation(() => mockUseStaticQuery)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })
  
  it(`renders a header`, () => {
    const { container } = render(
      <Layout>
        <main>
          <h1>hello</h1>
        </main>
      </Layout>
    )

    const header = container.querySelector(`header`)
    expect(header).toBeVisible()
  })

  it(`renders children`, () => {
    const text = `__Hello world__`
    const { getByText } = render(
      <Layout>
        <main>
          <h1>{text}</h1>
        </main>
      </Layout>
    )

    const child = getByText(text)

    expect(child).toBeVisible()
  })
})
