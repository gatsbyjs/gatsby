import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"

const listStyles = {
  margin: 0,
  marginBottom: 48,
  marginTop: 48,
  maxWidth: 860,
  padding: 0,
  display: "grid",
  // https://css-tricks.com/responsive-layouts-fewer-media-queries/
  "--w": "300px",
  "--n": "2",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(max(var(--w), 100%/(var(--n) + 1) + 0.1%),1fr))",
  gap: 48,
}
const listItemStyles = {
  margin: 0,
}
const linkStyle = {
  color: "var(--color-primary)",
  fontSize: 16,
  fontWeight: "bold",
}
const descriptionStyle = {
  color: "var(--text-color)",
  marginBottom: 0,
  marginTop: "0.25rem",
}

// data
const links = [
  {
    text: "Tutorial",
    url: "https://www.gatsbyjs.com/docs/tutorial/",
    description:
      "A great place to get started if you're new to web development. Designed to guide you through setting up your first Gatsby site.",
    color: "#E95800",
  },
  {
    text: "Examples",
    url: "https://github.com/gatsbyjs/gatsby/tree/master/examples",
    description:
      "Example websites sit on one or the other end of the spectrum from very basic to complex/complete.",
    color: "#159BF3",
  },
  {
    text: "Plugin Library",
    url: "https://www.gatsbyjs.com/plugins",
    description:
      "Add functionality and customize your Gatsby site or app with thousands of plugins built by our amazing developer community.",
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

const IndexPage = () => (
  <Layout>
    <Seo title="Home" />
    <main>
      <h1>
        <StaticImage
          src="../images/example.png"
          width={64}
          quality={95}
          formats={["auto", "webp", "avif"]}
          alt=""
          style={{ marginBottom: `0.5rem` }}
        />
        <br />
        Welcome to <b>Gatsby!</b>{" "}
        <span role="img" aria-label="Party popper emoji">
          🎉
        </span>
      </h1>
      <p>
        Edit <code>src/pages/index.js</code> to see this page update in
        real-time.
        <br />
        <b>Example pages:</b>{" "}
        {samplePageLinks.map((link, i) => (
          <>
            <Link to={link.url} key={link.url}>
              {link.text}
            </Link>
            {i !== samplePageLinks.length - 1 && <> &middot; </>}
          </>
        ))}
      </p>
      <ul style={listStyles}>
        {links.map(link => (
          <li key={link.url} style={{ ...listItemStyles, color: link.color }}>
            <a
              style={linkStyle}
              href={`${link.url}?utm_source=starter&utm_medium=start-page&utm_campaign=minimal-starter`}
            >
              {link.text}
            </a>{" "}
            <small>↗</small>
            <p style={descriptionStyle}>{link.description}</p>
          </li>
        ))}
      </ul>
    </main>
  </Layout>
)

export default IndexPage
