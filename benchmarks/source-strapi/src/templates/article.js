import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout_1"

export const query = graphql`
  query ArticleQuery($id: String) {
    strapiArticle(id: { eq: $id }) {
      title
      content
      image {
        childImageSharp {
          fluid(maxWidth: 960, quality: 90) {
            ...GatsbyImageSharpFluid_withWebp_tracedSVG
          }
        }
      }
    }
  }
`

const Article = ({ data }) => {
  const article = data.strapiArticle
  return (
    <Layout>
      <h1>{article.title}</h1>
      {article.image?.childImageSharp && (
        <Img fluid={article.image.childImageSharp.fluid} />
      )}
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
    </Layout>
  )
}

export default Article
