import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"

const listStyles = {
  marginBottom: 64,
  marginTop: 64,
  padding: 0,
  display: "flex",
  gap: 32,
}
const listItemStyles = {
  fontSize: 24,
  marginBottom: 32,
  maxWidth: 520,
}
const linkStyle = {
  color: "var(--color-primary)",
  fontSize: 16,
  fontWeight: "bold",
  verticalAlign: "5%",
}
const descriptionStyle = {
  color: "#000",
  fontSize: 14,
  marginBottom: 0,
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
    text: "Go to page 2",
    url: "page-2",
    badge: false,
    description:
      "A simple example of linking to another page within a Gatsby site",
  },
  { text: "TypeScript", url: "using-typescript" },
  { text: "Server Side Rendering", url: "using-ssr" },
  { text: "Deferred Static Geneation", url: "using-dsg" },
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
          alt="A Gatsby dial"
          style={{ marginBottom: `0.5rem` }}
        />
        <br />
        Welcome to
        <br />
        <b>Gatsby!</b>{" "}
        <span role="img" aria-label="Party popper emoji">
          🎉
        </span>
      </h1>
      <p>
        Edit <code>src/pages/index.js</code> to see this page update in
        real-time.
        <br />
        <b>Example pages:</b>{" "}
        {samplePageLinks.map(link => (
          <Link to={link.url} key={link.url}>
            {link.text}
          </Link>
        ))}
      </p>
      <ul style={listStyles}>
        {links.map(link => (
          <li key={link.url} style={{ ...listItemStyles, color: link.color }}>
            <span>
              <a
                style={linkStyle}
                href={`${link.url}?utm_source=starter&utm_medium=start-page&utm_campaign=minimal-starter`}
              >
                {link.text} ↗
              </a>
              <p style={descriptionStyle}>{link.description}</p>
            </span>
          </li>
        ))}
      </ul>
      <img
        alt="Gatsby G Logo"
        src="data:image/svg+xml,%3Csvg width='24' height='24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 2a10 10 0 110 20 10 10 0 010-20zm0 2c-3.73 0-6.86 2.55-7.75 6L14 19.75c3.45-.89 6-4.02 6-7.75h-5.25v1.5h3.45a6.37 6.37 0 01-3.89 4.44L6.06 9.69C7 7.31 9.3 5.63 12 5.63c2.13 0 4 1.04 5.18 2.65l1.23-1.06A7.959 7.959 0 0012 4zm-8 8a8 8 0 008 8c.04 0 .09 0-8-8z' fill='%23639'/%3E%3C/svg%3E"
      />
    </main>
  </Layout>
)

export default IndexPage
