import * as React from "react"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { useStaticQuery, graphql } from "gatsby"
import Layout from "../../components/layout"

const Page = () => {
  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "landsend.jpg" }) {
        childImageSharp {
          # gatsbyImage(width: 500, height: 500, layout: FIXED) { Disabled until bug is fixed
          gatsbyImage(width: 550, layout: FIXED) {
            imageData
          }
        }
      }
    }
  `)
  console.log(data)

  return (
    <Layout>
      <h1>Fixed larger than source image</h1>
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
