import React from "react"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout_1"

const Article = ({ data }) => {
  const { html } = data.markdownRemark
  const { markdownRemark } = data

  const featuredImgFluid =
    markdownRemark.frontmatter.image.childImageSharp.fluid

  return (
    <Layout>
      <Link to="/">Go back to index page</Link>
      <div>
        <h1>{markdownRemark.frontmatter.title}</h1>
        <Img fluid={featuredImgFluid} />
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </Layout>
  )
}

export const query = graphql`
  query markdownRemarkQuery($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
        image {
          childImageSharp {
            fluid(maxWidth: 960, quality: 90) {
              ...GatsbyImageSharpFluid_withWebp_tracedSVG
            }
          }
        }
      }
    }
  }
`

export default Article
