import * as React from "react"
import { Link, navigate, graphql } from "gatsby"
import { StaticImage, GatsbyImage, getImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"

const IndexPage = ({ data }) => {
  const image = getImage(data.file)
  return (
    <Layout>
      <h1>Hi people</h1>
      <StaticImage
        src="../images/gatsby-icon.png"
        alt="Gatsby icon"
        layout="fixed"
        data-testid="static-image"
      />
      <GatsbyImage
        image={image}
        alt="Citrus Fruits"
        data-testid="gatsby-image"
      />
      <p>Welcome to your new Gatsby site.</p>
      <p>Now go build something great.</p>
      <Link data-testid="page-2-link" to="/page-2/">
        Go to page 2
      </Link>
      <Link data-testid="page-blogtest-link" to="/blogtest/">
        Go to blogtest
      </Link>
      <button
        data-testid="page-2-button-link"
        onClick={() => navigate(`/page-2/`)}
      >
        Go to page 2 with navigate()
      </button>
      <Link data-testid="404-link" to="/not-existing-page">
        Go to not existing page
      </Link>
      <Link data-testid="subdir-link" to="subdirectory/page-1">
        Go to subdirectory
      </Link>
      <Link data-testid="page-ssr-link" to="/ssr/">
        Go to SSR page
      </Link>
      <button
        data-testid="page-ssr-button-link"
        onClick={() => navigate(`/ssr/`)}
      >
        Go to SSR page with navigate()
      </button>
    </Layout>
  )
}

export const Head = () => <Seo />

export const query = graphql`
  query {
    file(relativePath: { eq: "citrus-fruits.jpg" }) {
      childImageSharp {
        gatsbyImageData
      }
    }
  }
`

export default IndexPage
