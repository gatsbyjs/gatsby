jest.mock("../../hooks/use-site-metadata", () => {
  return () => {
    return { siteUrl: "https://www.gatsbyjs.org" }
  }
})

import React from "react"
import { Helmet } from "react-helmet"
import { render } from "@testing-library/react"
import BlogPostMetadata from "../blog-post-metadata"

const basePost = {
  timeToRead: 2,
  fields: {
    excerpt: "This is the very first Gatsby blog post.",
  },
  frontmatter: {
    title: "My first Gatsby blog post!",
    rawDate: 12345,
    author: {
      id: "Kyle Mathews",
      twitter: "@kylemathews",
      fields: {
        slug: "/contributors/kyle-mathews/",
      },
    },
  },
}

it("generates an alternate url the post has a canonicalLink in frontmatter", () => {
  const post = {
    ...basePost,
    frontmatter: {
      ...basePost.frontmatter,
      canonicalLink: "https://reactjs.org/",
    },
  }
  render(<BlogPostMetadata post={post} />)
  const content = Helmet.peek()
  expect(content.linkTags).toContainEqual({
    rel: "canonical",
    href: "https://reactjs.org/",
  })
  expect(content.metaTags).toContainEqual({
    property: "og:url",
    content: "https://reactjs.org/",
  })
})

it("does not generate an alternate url if the post doesn't have a canonicalLink", () => {
  render(<BlogPostMetadata post={basePost} />)
  const content = Helmet.peek()
  expect(content.linkTags).not.toContainEqual({
    rel: "canonical",
    href: "https://reactjs.org/",
  })
  expect(content.metaTags).not.toContainEqual({
    property: "og:url",
    content: "https://reactjs.org/",
  })
})

it("populates the author info and published time", () => {
  render(<BlogPostMetadata post={basePost} />)
  const content = Helmet.peek()
  expect(content.linkTags).toContainEqual({
    rel: "author",
    href: "https://www.gatsbyjs.org/contributors/kyle-mathews/",
  })
  expect(content.metaTags).toContainEqual({
    name: "author",
    content: "Kyle Mathews",
  })
  expect(content.metaTags).toContainEqual({
    name: "twitter:creator",
    content: "@kylemathews",
  })
  expect(content.metaTags).toContainEqual({
    property: "article:author",
    content: "Kyle Mathews",
  })
  expect(content.metaTags).toContainEqual({
    property: "article:published_time",
    content: 12345,
  })
})
