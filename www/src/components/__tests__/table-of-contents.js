import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "theme-ui"

import theme from "../../../src/gatsby-plugin-theme-ui"
import TableOfContents from "../docs-table-of-contents"

const tableOfContentsNoUrl = {
  location: {
    pathname: "",
  },
  depth: 2,
  items: [
    {
      title: "API commands",
      items: [
        {
          url: "#new",
          title: "new",
          items: [
            {
              title: "Arguments",
            },
            {
              url: "#examples",
              title: "Examples",
            },
          ],
        },
      ],
    },
  ],
}

const tableOfContentsSimple = {
  location: {
    pathname: "",
  },
  depth: null,
  items: [
    {
      url: "#how-to-use-gatsby-cli",
      title: "How to use gatsby-cli",
    },
  ],
}

const tableOfContentsDeep = {
  location: {
    pathname: "",
  },
  depth: 2,
  items: [
    {
      url: "#how-to-use-gatsby-cli",
      title: "How to use gatsby-cli",
    },
    {
      url: "#api-commands",
      title: "API commands",
      items: [
        {
          url: "#new",
          title: "new",
          items: [
            {
              url: "#arguments",
              title: "Arguments",
            },
            {
              url: "#examples",
              title: "Examples",
            },
          ],
        },
        {
          url: "#develop",
          title: "develop",
          items: [
            {
              url: "#options",
              title: "Options",
            },
            {
              url: "#preview-changes-on-other-devices",
              title: "Preview changes on other devices",
            },
          ],
        },
        {
          url: "#build",
          title: "build",
          items: [
            {
              url: "#options-1",
              title: "Options",
            },
          ],
        },
        {
          url: "#serve",
          title: "serve",
          items: [
            {
              url: "#options-2",
              title: "Options",
            },
          ],
        },
        {
          url: "#info",
          title: "info",
          items: [
            {
              url: "#options-3",
              title: "Options",
            },
          ],
        },
        {
          url: "#clean",
          title: "clean",
        },
        {
          url: "#plugin",
          title: "plugin",
          items: [
            {
              url: "#docs",
              title: "docs",
            },
          ],
        },
        {
          url: "#repl",
          title: "Repl",
        },
        {
          url: "#disabling-colored-output",
          title: "Disabling colored output",
        },
      ],
    },
    {
      url: "#how-to-change-your-default-package-manager-for-your-next-project",
      title:
        "How to change your default package manager for your next project?",
    },
  ],
}

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

const testHeadingsRecursively = (getByTestId, items, depth) => {
  if (depth === 0) return

  for (const item of items) {
    if (item.url) {
      expect(getByTestId(item.url)).toHaveTextContent(item.title)
    }

    if (item.items) {
      testHeadingsRecursively(getByTestId, item.items, depth - 1)
    }
  }
}

test("Table of contents (depth == 0)", () => {
  const { items, depth, location } = tableOfContentsSimple
  const { getByTestId } = render(
    <ThemeProvider theme={theme}>
      <TableOfContents items={items} depth={depth} location={location} />
    </ThemeProvider>
  )

  for (const item of items) {
    if (item.url) {
      expect(getByTestId(item.url)).toHaveTextContent(item.title)
    }
  }
})

test("Table of contents (depth >= 1)", () => {
  const { items, depth, location } = tableOfContentsDeep
  const { getByTestId } = render(
    <ThemeProvider theme={theme}>
      <TableOfContents items={items} depth={depth} location={location} />
    </ThemeProvider>
  )

  testHeadingsRecursively(getByTestId, items, depth - 1)
})

test("Table of contents (missing URLs)", () => {
  const { items, depth, location } = tableOfContentsNoUrl
  const { getByTestId } = render(
    <ThemeProvider theme={theme}>
      <TableOfContents items={items} depth={depth} location={location} />
    </ThemeProvider>
  )

  testHeadingsRecursively(getByTestId, items, depth - 1)
})
