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
        {data.article.metadata.image.local.childImageSharp ? (
          <Img fluid={data.article.metadata.image.local.childImageSharp.fluid} />
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
  query($slug: String!){
    article: cosmicjsPosts(slug: {eq: $slug }) {
      title
      content
      metadata{
        image {
          local {
            childImageSharp {
              fluid(quality: 90, maxWidth: 960) {
                ...GatsbyImageSharpFluid_withWebp_tracedSVG
              }
            }
          }
        }
      }
    }
  }
`