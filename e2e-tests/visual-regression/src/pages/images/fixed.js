import * as React from "react"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { useStaticQuery, graphql } from "gatsby"
import Layout from "../../components/layout"

const Page = () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "cornwall.jpg" }) {
        childImageSharp {
          gatsbyImage(width: 240, height: 100, layout: FIXED) {
            imageData
          }
        }
      }
    }
  `)

  return (
    <Layout>
      <h1>Fixed width and height</h1>
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
