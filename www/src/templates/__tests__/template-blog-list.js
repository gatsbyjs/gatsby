jest.mock(`../../components/layout`, () => jest.fn(({ children }) => children))
import React from "react"
import { render } from "@testing-library/react"
import { ThemeProvider } from "theme-ui"

import theme from "../../../src/gatsby-plugin-theme-ui"
import BlogPostsIndex from "../template-blog-list"

const getFluidMockImage = () => {
  return {
    sizes: `1234`,
    src: `1234`,
    srcSet: `1234 1234 1324`,
    aspectRatio: 3 / 4,
  }
}

const getFixedMockImage = () => {
  return {
    width: 100,
    height: 100,
    src: `test_image.jpg`,
    srcSet: `some srcSet`,
  }
}

module.exports = {
  graphql: jest.fn(),
}

const getMdx = ({ index }) => {
  return {
    fields: {
      slug: `introducing - the - react - testing - library-${index}`,
      excerpt: `You want to write maintainable tests for your React components.`,
    },
    frontmatter: {
      title: `Challenge 9 - Optimize Your Website for Search Engines (SEO)`,
      date: `February 26th 2020`,
      author: {
        id: `test user`,
        fields: {
          slug: `/contributors/test-user/`,
        },
        avatar: {
          childImageSharp: {
            fluid: getFluidMockImage(),
            fixed: getFixedMockImage(),
            resize: {
              src: `1234`,
            },
          },
        },
        cover: null,
      },
    },
  }
}

const getProps = () => {
  return {
    pageContext: {
      limit: 2,
      skip: 0,
      numPages: 1,
      currentPage: 1,
    },

    data: {
      allMdx: {
        nodes: [getMdx({ index: 1 }), getMdx({ index: 2 })],
      },
    },
  }
}

test(`it can be rendered`, () => {
  const props = getProps()
  expect(() =>
    render(
      <ThemeProvider theme={theme}>
        <BlogPostsIndex {...props} />
      </ThemeProvider>
    )
  ).not.toThrow()
})
