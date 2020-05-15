import React from "react"
import { render } from "@testing-library/react"
import { Helmet } from "react-helmet"
import DocsMarkdownPage from "../docs-markdown-page"
import { ThemeProvider } from "theme-ui"
import { I18nProvider } from "@lingui/react"
import { MDXProvider } from "@mdx-js/react"

import theme from "../../../src/gatsby-plugin-theme-ui"

jest.mock("gatsby-plugin-mdx", () => ({
  MDXRenderer: () => <div />
}));

jest.mock("../../utils/sidebar/item-list", () => {
  return {
    itemListContributing: {},
    itemListDocs: {},
    getItemList: jest.fn(),
  }
})

jest.mock("../../hooks/use-site-metadata", () => {
  return () => {
    return { siteUrl: "https://www.gatsbyjs.org" }
  }
})

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: jest.fn().mockImplementation(() => {
    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
    }
  }),
})

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
})

const tableOfContentsItems = [
  {
    url: "#section",
    title: "section",
  },
]
const page = {
  excerpt: "excerpt",
  timeToRead: 1,
  fields: {
    slug: "/docs/apis/",
    anchor: "apis",
  },
  frontmatter: {
    title: "title",
    description: "description",
  },
  tableOfContents: {
    items: tableOfContentsItems,
  },
  parent: {},
}

const location = {
  pathname: "/docs/current",
}

const setup = (setupProps = {}) => {
  const props = {
    page,
    location,
    ...setupProps,
  }

  return render(
    <I18nProvider>
      <ThemeProvider theme={theme}>
        <MDXProvider>
          <DocsMarkdownPage {...props} />
        </MDXProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}

it("should display table of content if there are items and is not disabled", () => {
  const { getByText } = setup()

  expect(getByText("Table of Contents")).toBeDefined()
})

it("should not display table of content if there are no items", () => {
  const tableOfContentsItems = []
  const { queryByText } = setup({ tableOfContentsItems })

  expect(queryByText("Table of Contents")).toBeNull()
})

it("should not display table of content if disabled", () => {
  const { queryByText } = setup({
    page: {
      ...page,
      frontmatter: { ...page.frontmatter, disableTableOfContents: true },
    },
  })

  expect(queryByText("Table of Contents")).toBeNull()
})

it("should display prev page and next page if available", () => {
  const prev = {
    title: "prev",
    link: "/docs/prev",
  }
  const next = {
    title: "next",
    link: "/docs/next",
  }
  const { getByText } = setup({ prev, next })

  expect(getByText(prev.title)).toBeDefined()
  expect(getByText(prev.title).closest("a")).toHaveAttribute("href", prev.link)
  expect(getByText(next.title)).toBeDefined()
  expect(getByText(next.title).closest("a")).toHaveAttribute("href", next.link)
})

it("should display frontmatter meta data if available", () => {
  setup()

  const contents = Helmet.peek()

  expect(contents.title).toEqual(page.frontmatter.title)
  expect(contents.metaTags).toContainEqual({
    name: "description",
    content: page.frontmatter.description,
  })
})

it("should display excerpt as meta description if no frontmatter description is available", () => {
  setup({ page: { ...page, frontmatter: {} } })

  const contents = Helmet.peek()

  expect(contents.metaTags).toContainEqual({
    name: "description",
    content: page.excerpt,
  })
})

it("should display main title", () => {
  const { getByText } = setup()

  expect(getByText(page.frontmatter.title)).toBeDefined()
})
