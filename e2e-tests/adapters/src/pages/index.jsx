import * as React from "react"
import { Link, graphql, withPrefix } from "gatsby"
import Layout from "../components/layout"
import gatsbyAstronaut from "../images/astro.png"
import "./index.css"

const routes = [
  {
    text: "Static",
    url: "/routes/ssg/static",
    id: "static-without-slash",
  },
  {
    text: "Static (With Slash)",
    url: "/routes/ssg/static/",
    id: "static-with-slash",
  },
  {
    text: "SSR",
    url: "/routes/ssr/static",
  },
  {
    text: "DSG",
    url: "/routes/dsg/static",
  },
  {
    text: "Sub-Router",
    url: "/routes/sub-router",
  },
  {
    text: "Client-Only Params",
    url: "/routes/client-only/dune",
  },
  {
    text: "Client-Only Wildcard",
    url: "/routes/client-only/wildcard/atreides/harkonnen",
  },
  {
    text: "Client-Only Named Wildcard",
    url: "/routes/client-only/named-wildcard/corinno/fenring",
  },
  {
    text: "RemoteFile (ImageCDN and FileCDN) (SSG, Page Query)",
    url: "/routes/ssg/remote-file",
  },
  {
    text: "RemoteFile (ImageCDN and FileCDN) (SSG, Page Context)",
    url: "/routes/ssg/remote-file-data-from-context",
  },
  {
    text: "RemoteFile (ImageCDN and FileCDN) (SSR, Page Query)",
    url: "/routes/ssr/remote-file",
  },
]

const functions = [
  {
    text: "Functions (Static)",
    url: "/api/static",
  },
  {
    text: "Functions (Param)",
    url: "/api/param/dune",
  },
  {
    text: "Functions (Wildcard)",
    url: "/api/wildcard/atreides/harkonnen",
  },
  {
    text: "Functions (Named Wildcard)",
    url: "/api/named-wildcard/corinno/fenring",
  },
]

const IndexPage = ({ data }) => {
  return (
    <Layout hideBackToHome>
      <div className="astroWrapper">
        <img src={gatsbyAstronaut} alt="Gatsby Astronaut" className="astro" />
      </div>
      <div className="titleStyles">
        <img
          src={withPrefix(`/gatsby-icon.png`)}
          alt="Gatsby Monogram Logo"
          style={{ maxHeight: "40px", marginRight: "1rem" }}
        />
        <h1>{data.site.siteMetadata.title}</h1>
      </div>
      <ul className="listStyles">
        {routes.map(link => (
          <li key={link.url} className="listItemStyles">
            <Link className="linkStyle" to={link.url} data-testid={link?.id}>
              {link.text}
            </Link>
          </li>
        ))}
        {functions.map(link => (
          <li key={link.url} className="listItemStyles">
            <a className="linkStyle" href={link.url}>
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export default IndexPage

export const Head = () => <title>Adapters E2E</title>

export const query = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
  }
`
