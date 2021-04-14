import React from "react"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout_1"

import "../styles/styles.css"

const Article = ({ data }) => {
  let article = data.article.nodes[0]
  return (
    <Layout>
      <Link to="/">Go back to index page</Link>
      <div>
        <h2>{article.title}</h2>
        {article.image_ && article.image_[0] ? (
          <Img fluid={article.image_[0].fluid} />
        ) : (
          <div>Image can't be displayed</div>
        )}
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </Layout>
  )
}

export default Article

export const query = graphql`
  query($slug: String!) {
    article: allArticle(filter: { id: { eq: $slug } }) {
      nodes {
        title
        content
        image_ {
          fluid(maxWidth: 1000) {
            src
            srcSet
            aspectRatio
            originalName
          }
        }
      }
    }
  }
`
