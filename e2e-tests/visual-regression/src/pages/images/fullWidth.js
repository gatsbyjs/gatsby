import * as React from "react"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { useStaticQuery, graphql } from "gatsby"
import { TestWrapper } from "../../components/test-wrapper"
import Layout from "../../components/layout"

const Page = () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "cornwall.jpg" }) {
        childImageSharp {
          gatsbyImageData(layout: FULL_WIDTH)
        }
      }
    }
  `)

  return (
    <Layout>
      <h1>fullWidth, maxWidth</h1>
      <TestWrapper style={{ display: `block` }}>
        <GatsbyImage
          image={getImage(data.file)}
          loading="eager"
          alt="cornwall"
        />
      </TestWrapper>
    </Layout>
  )
}

export default Page
