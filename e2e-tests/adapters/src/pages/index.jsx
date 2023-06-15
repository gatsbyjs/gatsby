import * as React from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import gatsbyAstronaut from "../images/astro.png"

const routes = [
  {
    text: "Static",
    url: "/routes/static",
  },
  {
    text: "SSR",
    url: "/routes/ssr",
  },
  {
    text: "DSG",
    url: "/routes/dsg",
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
  }
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

const IndexPage = () => {
  return (
    <Layout hideBackToHome>
      <div style={astroWrapper}>
        <img src={gatsbyAstronaut} alt="Gatsby Astronaut" style={astro} />
      </div>
      <div style={titleStyles}>
        <img src="/gatsby-icon.png" alt="Gatsby Monogram Logo" style={{ maxHeight: '40px', marginRight: '1rem' }} />
        <h1>Adapters</h1>
      </div>
      <ul style={listStyles}>
        {routes.map(link => (
          <li key={link.url} style={{ ...listItemStyles }}>
            <Link style={linkStyle} to={link.url}>
              {link.text}
            </Link>
          </li>
        ))}
        {functions.map(link => (
          <li key={link.url} style={{ ...listItemStyles }}>
            <a style={linkStyle} href={link.url}>
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export default IndexPage

export const Head = () => (
  <>
    <title>Adapters E2E</title>
    <style>{`@keyframes float { 50% { transform: translateY(24px) } }`}</style>
  </>
)

const titleStyles = {
  display: "flex",
  alignItems: "center",
  flexDirection: "row",
}

const astroWrapper = {
  transform: "rotate(-18deg)",
  position: "absolute",
  top: "1.5rem",
  right: "1.75rem"
}

const astro = {
  maxHeight: "128px",
  animationName: "float",
  animationDuration: "5s",
  animationIterationCount: "infinite",
}

const listStyles = {
  marginTop: 30,
  marginBottom: 72,
  paddingLeft: 0,
}

const listItemStyles = {
  fontWeight: 300,
  fontSize: 24,
  maxWidth: 560,
  marginBottom: 8,
}

const linkStyle = {
  color: "#8954A8",
  fontWeight: "bold",
  fontSize: 16,
  verticalAlign: "5%",
  textDecoration: "none",
}
