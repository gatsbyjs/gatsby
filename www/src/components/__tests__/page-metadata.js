jest.mock("../../hooks/use-site-metadata", () => {
  return () => {
    return { siteUrl: "https://www.gatsbyjs.org" }
  }
})

import React from "react"
import { render } from "@testing-library/react"
import { Helmet } from "react-helmet"
import PageMetadata from "../page-metadata"

it("generates title and og:title when a title prop is provided", () => {
  render(<PageMetadata title="Documentation" />)
  const contents = Helmet.peek()
  expect(contents.title).toEqual("Documentation")
  expect(contents.metaTags).toContainEqual({
    property: "og:title",
    content: "Documentation",
  })
})

it("generates description and og:description when a description prop is provided", () => {
  render(<PageMetadata description="Blazing fast static site generator" />)
  const contents = Helmet.peek()
  expect(contents.metaTags).toContainEqual({
    name: "description",
    content: "Blazing fast static site generator",
  })
  expect(contents.metaTags).toContainEqual({
    property: "og:description",
    content: "Blazing fast static site generator",
  })
})

it("generates a type property if a type prop is provided", () => {
  render(<PageMetadata type="article" />)
  const contents = Helmet.peek()
  expect(contents.metaTags).toContainEqual({
    property: "og:type",
    content: "article",
  })
})

it("generates twitter:card data if twitterCard prop is provided", () => {
  render(<PageMetadata twitterCard="summary_large_image" />)
  const contents = Helmet.peek()
  expect(contents.metaTags).toContainEqual({
    name: "twitter:card",
    content: "summary_large_image",
  })
})

it("generates twitter label data if timeToRead prop is provided", () => {
  render(<PageMetadata timeToRead={2} />)
  const contents = Helmet.peek()
  expect(contents.metaTags).toContainEqual({
    name: "twitter:label1",
    content: "Reading time",
  })
  expect(contents.metaTags).toContainEqual({
    name: "twitter:data1",
    content: "2 min read",
  })
})

it("generates an og:image if an image prop is provided", () => {
  const image = { src: "/assets/gatsby-logo.png" }
  render(<PageMetadata image={image} />)
  const contents = Helmet.peek()
  expect(contents.metaTags).toContainEqual({
    property: "og:image",
    content: "https://www.gatsbyjs.org/assets/gatsby-logo.png",
  })
})

it("generates og:image dimensions only if they are provided in the image prop", () => {
  const image = { src: "/assets/gatsby-logo.png", width: 600, height: 400 }
  render(<PageMetadata image={image} />)
  const contents = Helmet.peek()
  expect(contents.metaTags).toContainEqual({
    property: "og:image:width",
    content: 600,
  })
  expect(contents.metaTags).toContainEqual({
    property: "og:image:height",
    content: 400,
  })
})
