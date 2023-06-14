import * as React from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"

const links = [
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
]

const IndexPage = () => {
  return (
    <Layout hideBackToHome>
      <h1>Adapters</h1>
      <ul style={listStyles}>
        {links.map(link => (
          <li key={link.url} style={{ ...listItemStyles }}>
            <Link style={linkStyle} to={link.url}>
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export default IndexPage

export const Head = () => <title>Home</title>

const listStyles = {
  marginTop: 30,
  marginBottom: 96,
  paddingLeft: 0,
}

const listItemStyles = {
  fontWeight: 300,
  fontSize: 24,
  maxWidth: 560,
  marginBottom: 16,
}

const linkStyle = {
  color: "#8954A8",
  fontWeight: "bold",
  fontSize: 16,
  verticalAlign: "5%",
  textDecoration: "none",
}
