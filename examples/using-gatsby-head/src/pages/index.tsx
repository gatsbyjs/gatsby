import React from "react"
import { graphql, Link, PageProps, HeadFC } from "gatsby"
import { SEO } from "../components/seo"

type QueryReturn = { allPark: { nodes: { name: string; gatsbyPath: string }[] } }

const IndexPage: React.FC<PageProps<QueryReturn>> = ({ data }) => {
  return (
    <main style={pageStyles}>
      <h1 style={headingStyles}>Using Gatsby Head</h1>
      <p style={paragraphStyles}>
        Visit the separate pages below to see the metatags change. The main component is <code style={codeStyles}>src/components/seo.tsx</code> and it's used in the <code style={codeStyles}>Head</code> exports of each page.
      </p>
      <ul style={listStyles}>
        {data.allPark.nodes.map(park => (
          <li key={park.name} style={listItemStyles}>
            <Link
              style={linkStyle}
              to={park.gatsbyPath}
            >
              {park.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default IndexPage

export const Head: HeadFC<QueryReturn> = () => (
  <SEO />
)

export const query = graphql`
  {
    allPark {
      nodes {
        name
        gatsbyPath(filePath: "/parks/{Park.name}")
      }
    }
  }
`

const pageStyles = {
  color: "#232129",
  padding: 96,
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
  fontSize: "18px",
  maxWidth: "70ch"
}
const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
  maxWidth: 360,
}
const paragraphStyles = {
  marginBottom: 48,
  lineHeight: "1.6",
}
const codeStyles = {
  color: "#8A6534",
  padding: 4,
  backgroundColor: "#FFF4DB",
  fontSize: "1.25rem",
  borderRadius: 4,
}
const listStyles = {
  marginBottom: 96,
  paddingLeft: 0,
}
const listItemStyles = {
  fontWeight: 300,
  fontSize: 24,
  maxWidth: 560,
  marginBottom: 20,
}
const linkStyle = {
  color: "#8954A8",
  textDecoration: "none",
  fontWeight: "bold",
  verticalAlign: "5%",
}
