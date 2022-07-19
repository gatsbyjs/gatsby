import React from "react"
import { graphql, Link, PageProps, HeadFC } from "gatsby"
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

export const Head: HeadFC<QueryReturn> = ({ data: { park }, location }) => (
  <SEO title={park.name} description={park.description} pathname={location.pathname}>
    <link id="favicon-icon" rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🔥</text></svg>" />
    <script type="application/ld+json">
      {`
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "url": "https://www.spookytech.com",
  "name": "Spooky technologies",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+5-601-785-8543",
    "contactType": "Customer Support"
  }
}
      `}
    </script>
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