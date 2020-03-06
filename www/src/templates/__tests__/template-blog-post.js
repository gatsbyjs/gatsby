jest.mock(`../../components/layout`, () => jest.fn(({ children }) => children))
import React from "react"
import { render } from "@testing-library/react"
import { ThemeProvider } from "theme-ui"

import theme from "../../../src/gatsby-plugin-theme-ui"
import BlogPostTemplate from "../template-blog-post"

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

const getProps = ({ canonicalLink, image, imageAuthor, imageAuthorLink }) => {
  return {
    pageContext: {
      prev: 0,
      next: 0,
    },

    data: {
      mdx: {
        body: `return () => React.createElement('div')`,
        timeToRead: 1,
        fields: {
          slug: `introducing - the - react - testing - library`,
          excerpt: `You want to write maintainable tests for your React components.`,
          publishedAt: `2019-02-18`,
        },
        frontmatter: {
          title: `Challenge 9 - Optimize Your Website for Search Engines (SEO)`,
          date: `February 26th 2020`,
          rawDate: `2020-02-26T00:00:00.000Z`,
          canonicalLink: canonicalLink,
          tags: [
            `learning-to-code`,
            `contest`,
            `100-Days-of-Gatsby`,
            `accessibility`,
          ],
          image: image,
          imageAuthor: imageAuthor,
          imageAuthorLink: imageAuthorLink,
          imageTitle: null,
          showImageInArticle: null,
          author: {
            id: `test user`,
            bio: `Web Developer  - https://example.xyz`,
            twitter: `@test_user`,
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
          },
        },
      },
    },
    path: `/blog/seo/`,
    location: { href: `http://localhost:8000/blog/seo/` },
  }
}

test(`it can be rendered`, () => {
  const props = getProps({ canonicalLink: `https://example.xyz` })
  expect(() =>
    render(
      <ThemeProvider theme={theme}>
        <BlogPostTemplate {...props} />
      </ThemeProvider>
    )
  ).not.toThrow()
})

test(`It can display post image`, () => {
  const props = getProps({
    image: {
      childImageSharp: {
        fluid: getFluidMockImage(),
        fixed: getFixedMockImage(),
        resize: {
          src: `1234`,
        },
      },
    },
    imageAuthor: `test author`,
    imageAuthorLink: `https://example.xyz`,
  })

  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <BlogPostTemplate {...props} />
    </ThemeProvider>
  )

  expect(getByText(`test author`)).toBeInTheDocument()
})
