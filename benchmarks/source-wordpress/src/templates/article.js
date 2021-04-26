import React from "react"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout_1"

const Article = ({ data: { article } }) => {
  return (
    <Layout>
      <Link to="/">Go back to index page</Link>
      <div>
        <h2>{article.title}</h2>
        {!!article.featuredImage?.node?.localFile?.childImageSharp && (
          <Img fluid={article.featuredImage.node.localFile.childImageSharp.fluid} />
        )}
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </Layout>
  )
}

export default Article

export const query = graphql`
  query($id: String!) {
    article: wpPost(id: { eq: $id }) {
      title
      content
      featuredImage {
        node {
          localFile {
            childImageSharp {
              fluid(maxWidth: 960, quality: 90) {
                ...GatsbyImageSharpFluid_withWebp_tracedSVG
              }
            }
          }
        }
      }
    }
  }
`
