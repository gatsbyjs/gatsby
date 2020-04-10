jest.mock(`../../../utils/sidebar/item-list`, () => {
  return {
    itemListContributing: {
      title: `Contributing`,
      items: [
        {
          title: `Why Contribute to Gatsby?`,
          link: `/contributing/why-contribute-to-gatsby/`,
        },
        {
          title: `Gatsby's Governance Model*`,
          link: `/contributing/gatsby-governance-model/`,
        },
      ],
    },
    itemListDocs: {
      title: `Documentation`,
      items: [
        {
          title: `Introduction`,
          link: `/docs/`,
        },
      ],
    },
    getItemList: jest.fn(),
  }
})
jest.mock(`react-modal`, () => {
  const modal = jest.fn().mockImplementation(({ children }) => children)
  modal.setAppElement = jest.fn()
  return modal
})
import React from "react"
import { useStaticQuery } from "gatsby"
import { render } from "@testing-library/react"
import { ThemeProvider } from "theme-ui"

import theme from "../../../../src/gatsby-plugin-theme-ui"
import StubList from "../stub-list"

let location
beforeEach(() => {
  useStaticQuery.mockReturnValueOnce({
    site: {
      siteMetadata: {
        title: `GatsbyJS`,
      },
    },
  })
  location = {
    pathname: `/contributing/stub-list`,
  }
})

describe(`StubList`, () => {
  it(`shows a title`, () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <StubList location={location} />
      </ThemeProvider>
    )
    const element = getByText(`Stub List`)

    expect(element).toBeVisible()
  })

  it(`shows a call to action to edit stubs`, () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <StubList location={location} />
      </ThemeProvider>
    )

    expect(getByText(`How to Write a Stub`)).toBeVisible()
  })

  describe(`stubs`, () => {
    let stubs
    beforeEach(() => {
      const { getByTestId } = render(
        <ThemeProvider theme={theme}>
          <StubList location={location} />
        </ThemeProvider>
      )
      stubs = getByTestId(`list-of-stubs`).querySelectorAll(`li`)
    })

    it(`renders stubs`, () => {
      expect(stubs.length).toBeGreaterThan(0)
    })

    it(`renders links to stubs`, () => {
      Array.from(stubs).forEach(stub => {
        const anchor = stub.firstChild
        expect(anchor.nodeName).toBe(`A`)
        expect(anchor.getAttribute(`href`)).toMatch(/^\//)
      })
    })

    it(`removes the asterisks`, () => {
      Array.from(stubs).forEach(stub => {
        expect(stub.textContent).not.toContain(`*`)
      })
    })
  })
})
