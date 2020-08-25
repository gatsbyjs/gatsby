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
        {data.article.image.asset ? (
          <Img fluid={data.article.image.asset.fluid} />
        ) : (
          <div>Image can't be displayed</div>
        )}
        <div dangerouslySetInnerHTML={{ __html: data.article.content }} />
      </div>
    </Layout>
  )
}

export default Article

export const query = graphql`
  query($id: String!) {
    article: sanityPost(_id: { eq: $id }) {
      title
      content
      image {
        asset {
          fluid(maxWidth: 960) {
            ...GatsbySanityImageFluid
          }
        }
      }
    }
  }
`
