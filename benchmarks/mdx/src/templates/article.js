import React from "react"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout_1"
import { MDXRenderer } from "gatsby-plugin-mdx"

const Article = ({ data }) => {
  const { body } = data.mdx
  const { mdx } = data

  const featuredImgFluid = mdx.frontmatter.image.childImageSharp.fluid

  return (
    <Layout>
      <Link to="/">Go back to index page</Link>
      <div>
        <h1>{mdx.frontmatter.title}</h1>
        <Img fluid={featuredImgFluid} />
        <div>
          <MDXRenderer>{body}</MDXRenderer>
        </div>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query MdxQuery($id: String!) {
    mdx(id: { eq: $id }) {
      body
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
