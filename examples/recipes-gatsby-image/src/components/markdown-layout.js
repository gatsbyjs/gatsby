import React from "react"
import PropTypes from "prop-types"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import Header from "./header"
import "./layout.css"

const MarkdownLayout = ({ children, data }) => (
  <>
    <Header siteTitle={data.site.siteMetadata.title} />
    <div
      style={{
        margin: `0 auto`,
        maxWidth: 960,
        padding: `0px 1.0875rem 1.45rem`,
        paddingTop: 0,
      }}
    >
      <main>
        <Img
          fluid={data.mdx.frontmatter.image.childImageSharp.fluid}
          alt="A corgi smiling happily"
        />
        {children}
      </main>
      <footer>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  </>
)

MarkdownLayout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default MarkdownLayout

export const pageQuery = graphql`
  query PostQuery($slug: String) {
    mdx(fields: { slug: { eq: $slug } }) {
      id
      frontmatter {
        image {
          childImageSharp {
            fluid {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    }
    site {
      siteMetadata {
        title
      }
    }
  }
`
