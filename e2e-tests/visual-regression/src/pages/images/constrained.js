import * as React from "react"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { useStaticQuery, graphql } from "gatsby"
import Layout from "../../components/layout"

const Page = () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "cornwall.jpg" }) {
        childImageSharp {
          gatsbyImage(maxWidth: 1024, layout: CONSTRAINED) {
            imageData
          }
        }
      }
    }
  `)

  return (
    <Layout>
      <h1>Constrained</h1>
      <div id="test-image">
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
