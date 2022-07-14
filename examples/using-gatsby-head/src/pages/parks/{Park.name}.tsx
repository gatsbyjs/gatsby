import React from "react"
import { graphql, Link, PageProps, HeadProps } from "gatsby"
import { SEO } from "../../components/seo"

type QueryReturn = { park: { name: string; description: string } }

const ParkPage: React.FC<PageProps<QueryReturn>> = ({ data }) => {
  return (
    <main style={pageStyles}>
      <Link to="/" style={{ textDecoration: "none" }}>Back to Homepage</Link>
      <h1 style={headingStyles}>{data.park.name}</h1>
      <p style={paragraphStyles}>
        {data.park.description}
      </p>
    </main>
  )
}

export default ParkPage

export const Head = ({ data: { park }, location }: HeadProps<QueryReturn>) => (
  <SEO title={park.name} description={park.description} pathname={location.pathname}>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🔥</text></svg>" />
  </SEO>
)

export const query = graphql`
  query ($id: String!){
    park(id: { eq: $id }) {
      name
      description
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
  marginTop: 20,
  marginBottom: 64,
  maxWidth: 360,
}
const paragraphStyles = {
  marginBottom: 48,
  lineHeight: "1.6",
}