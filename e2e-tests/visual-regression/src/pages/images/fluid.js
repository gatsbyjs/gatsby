import * as React from "react"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { useStaticQuery, graphql } from "gatsby"
import Layout from "../../components/layout"

const Page = () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "cornwall.jpg" }) {
        childImageSharp {
          gatsbyImage(maxWidth: 1024, layout: FLUID) {
            imageData
          }
        }
      }
    }
  `)

  return (
    <Layout>
      <h1>Fluid, maxWidth</h1>
      <div id="test-image" style={{ padding: 5 }}>
        <GatsbyImage
          image={getImage(data.file)}
          loading="eager"
          alt="chameleon"
        />
      </div>
    </Layout>
  )
}

export default Page
