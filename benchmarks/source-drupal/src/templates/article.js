import React from "react"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout_1"

const Article = ({ data }) => {
  return (
    <Layout>
      <Link to="/">Go back to index page</Link>
      <div>
        <h2>{data.article.title}</h2>
        {data.article.relationships.field_image.localFile.childImageSharp ? (
          <Img
            fluid={
              data.article.relationships.field_image.localFile.childImageSharp
                .fluid
            }
          />
        ) : (
          <div>Image can't be displayed</div>
        )}
        <div
          dangerouslySetInnerHTML={{ __html: data.article.body.processed }}
        />
      </div>
    </Layout>
  )
}

export default Article

export const query = graphql`
  query($slug: String!) {
    article: nodeArticle(fields: { slug: { eq: $slug } }) {
      title
      body {
        processed
      }
      relationships {
        field_image {
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
