jest.mock("../../hooks/use-site-metadata", () => {
  return () => {
    return {
      title: `GatsbyJS`,
      siteUrl: `https://www.gatsbyjs.org`,
      description: `Blazing fast modern site generator for React`,
      twitter: `@gatsbyjs`,
    }
  }
})

import React from "react"
import { render } from "@testing-library/react"
import { Helmet } from "react-helmet"
import SiteMetadata from "../site-metadata"

it("sets canonical url and og:url correctly", () => {
  render(<SiteMetadata pathname="/docs/quick-start/" />)
  const content = Helmet.peek()
  expect(content.linkTags).toContainEqual({
    rel: "canonical",
    href: "https://www.gatsbyjs.org/docs/quick-start/",
  })
  expect(content.metaTags).toContainEqual({
    property: "og:url",
    content: "https://www.gatsbyjs.org/docs/quick-start/",
  })
})

it("sets twitter defaults", () => {
  render(<SiteMetadata />)
  const content = Helmet.peek()
  expect(content.metaTags).toContainEqual({
    name: "twitter:card",
    content: "summary",
  })
  expect(content.metaTags).toContainEqual({
    name: "twitter:site",
    content: "@gatsbyjs",
  })
})

it("includes a default gatsby logo image", () => {
  render(<SiteMetadata />)
  const content = Helmet.peek()
  expect(content.metaTags).toContainEqual({
    property: "og:image",
    // make sure the image url has the full site url
    content: expect.stringContaining("https://www.gatsbyjs.org"),
  })
  expect(content.metaTags).toContainEqual({
    property: "og:image:alt",
    content: "Gatsby Logo",
  })
  expect(content.metaTags).toContainEqual({
    property: "og:image:width",
    content: "512",
  })
  expect(content.metaTags).toContainEqual({
    property: "og:image:height",
    content: "512",
  })
})
