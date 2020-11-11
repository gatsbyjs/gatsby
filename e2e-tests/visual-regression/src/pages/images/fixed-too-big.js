import * as React from "react"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { useStaticQuery, graphql } from "gatsby"
import { TestWrapper } from "../../components/test-wrapper"
import Layout from "../../components/layout"

const Page = () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "landsend.jpg" }) {
        childImageSharp {
          gatsbyImageData(width: 500, height: 500, layout: FIXED)
        }
      }
    }
  `)
  console.log(data)

  return (
    <Layout>
      <h1>Fixed larger than source image</h1>
      <TestWrapper>
        <GatsbyImage
          image={getImage(data.file)}
          loading="eager"
          alt="landsend"
        />
      </TestWrapper>
    </Layout>
  )
}

export default Page
