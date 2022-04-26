import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"

const listStyles = {
  margin: 0,
  maxWidth: `var(--size-content)`,
  padding: 0,
  display: `grid`,
  // https://css-tricks.com/responsive-layouts-fewer-media-queries/
  "--w": `280px`,
  "--n": `2`,
  gridTemplateColumns: `repeat(auto-fit,minmax(max(var(--w), 100%/(var(--n) + 1) + 0.1%),1fr))`,
  marginBottom: `var(--size-gap)`,
  marginTop: `var(--size-gap)`,
  gap: `var(--size-gap)`,
}
const listItemStyles = {
  margin: 0,
}
const linkStyle = {
  color: `var(--color-primary)`,
  fontSize: `var(--font-md)`,
  fontWeight: `bold`,
}
const descriptionStyle = {
  color: `var(--color-text)`,
  marginBottom: 0,
  marginTop: `var(--space-1)`,
}

const links = [
  {
    text: "Tutorial",
    url: "https://www.gatsbyjs.com/docs/tutorial",
    description:
      "A great place to get started if you're new to web development. Designed to guide you through setting up your first Gatsby site.",
    color: "#E95800",
  },
  {
    text: "Examples",
    url: "https://github.com/gatsbyjs/gatsby/tree/master/examples",
    description:
      "A collection of websites ranging from very basic to complex/complete that illustrate how to accomplish specific tasks within your Gatsby sites.",
    color: "#159BF3",
  },
  {
    text: "Plugin Library",
    url: "https://www.gatsbyjs.com/plugins",
    description:
      "Learn how to add functionality and customize your Gatsby site or app with thousands of plugins built by our amazing developer community.",
    color: "#8EB814",
  },
  {
    text: "Build and Host",
    url: "https://www.gatsbyjs.com/cloud",
    description:
      "Now you’re ready to show the world! Give your Gatsby site superpowers: Build and host on Gatsby Cloud. Get started for free!",
    color: "#663399",
  },
]

const samplePageLinks = [
  {
    text: "Page 2",
    url: "page-2",
    badge: false,
    description:
      "A simple example of linking to another page within a Gatsby site",
  },
  { text: "TypeScript", url: "using-typescript" },
  { text: "Server Side Rendering", url: "using-ssr" },
  { text: "Deferred Static Generation", url: "using-dsg" },
]

const moreLinks = [
  { text: "Join us on Discord", url: "https://gatsby.dev/discord" },
  {
    text: "Documentation",
    url: "https://gatsbyjs.com/docs/?utm_source=starter&utm_medium=start-page&utm_campaign=default-starter",
  },
  {
    text: "Starters",
    url: "https://gatsbyjs.com/starters/?utm_source=starter&utm_medium=start-page&utm_campaign=default-starter",
  },
  {
    text: "Showcase",
    url: "https://gatsbyjs.com/showcase/?utm_source=starter&utm_medium=start-page&utm_campaign=default-starter",
  },
  {
    text: "Contributing",
    url: "https://www.gatsbyjs.com/contributing/?utm_source=starter&utm_medium=start-page&utm_campaign=default-starter",
  },
  { text: "Issues", url: "https://github.com/gatsbyjs/gatsby/issues" },
]

const utmParameters = `?utm_source=starter&utm_medium=start-page&utm_campaign=default-starter`

const IndexPage = () => (
  <Layout>
    <Seo title="Home" />
    <div style={{ textAlign: "center" }}>
      <StaticImage
        src="../images/example.png"
        width={64}
        quality={95}
        formats={["auto", "webp", "avif"]}
        alt=""
        style={{ marginBottom: `var(--space-3)` }}
      />
      <h1>
        Welcome to <b>Gatsby!</b>
      </h1>
      <p
        style={{
          maxWidth: `none`,
          lineHeight: `var(--line-height-loose)`,
        }}
      >
        <b>Example pages:</b>{" "}
        {samplePageLinks.map((link, i) => (
          <React.Fragment key={link.url}>
            <Link to={link.url}>{link.text}</Link>
            {i !== samplePageLinks.length - 1 && <> &middot; </>}
          </React.Fragment>
        ))}
        <br />
        Edit <code>src/pages/index.js</code> to update this page.
      </p>
    </div>
    <ul style={listStyles}>
      {links.map(link => (
        <li key={link.url} style={{ ...listItemStyles, color: link.color }}>
          <a style={linkStyle} href={`${link.url}?${utmParameters}`}>
            {link.text} ↗
          </a>
          <p style={descriptionStyle}>{link.description}</p>
        </li>
      ))}
    </ul>
    {moreLinks.map((link, i) => (
      <React.Fragment key={link.url}>
        <a href={`${link.url}?${utmParameters}`}>{link.text}</a>
        {i !== moreLinks.length - 1 && <> &middot; </>}
      </React.Fragment>
    ))}
  </Layout>
)

export default IndexPage
